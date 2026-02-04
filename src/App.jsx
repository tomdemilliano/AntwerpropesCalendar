import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query
} from 'firebase/firestore';
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithCustomToken,
  signInAnonymously 
} from 'firebase/auth';
import { 
  Calendar, 
  Lock, 
  Plus, 
  Trash2, 
  Edit2, 
  MapPin, 
  User, 
  Clock,
  LogOut,
  Users,
  Home,
  Settings,
  AlertCircle,
  RefreshCw,
  Euro,
  Info
} from 'lucide-react';

// Configuratie en Initialisatie BUITEN de component (Systeemvereiste)
const firebaseConfig = JSON.parse(__firebase_config);
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'sportclub-admin-v1';

const DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [locaties, setLocaties] = useState([]);
  const [groepen, setGroepen] = useState([]);
  const [tarieven, setTarieven] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [view, setView] = useState('list'); 
  const [adminSubView, setAdminSubView] = useState('planning'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Formulieren states
  const [eventForm, setEventForm] = useState({ datum: '', uren: '', locatieId: '', groepId: '', coachId: '', opmerking: '' });
  const [coachForm, setCoachForm] = useState({ voornaam: '', naam: '', email: '' });
  const [locatieForm, setLocatieForm] = useState({ benaming: '', adres: '', emailContact: '', boekingUrl: '' });
  const [groepForm, setGroepForm] = useState({ benaming: '' });
  const [tariefForm, setTariefForm] = useState({ seizoen: '2024-2025', coachUur: 0, locatieUur: 0 });

  // 1. Authenticatie Effect
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setErrorMessage("Authenticatie mislukt.");
      }
    };
    
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Sync Effect (Start pas als User er is)
  useEffect(() => {
    if (!user) return;

    const syncCollection = (colName, setter) => {
      // RULE 1: Gebruik het exacte pad /artifacts/{appId}/public/data/{collectionName}
      const colRef = collection(db, 'artifacts', appId, 'public', 'data', colName);
      
      return onSnapshot(colRef, 
        (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (colName === 'tarieven') {
            const map = {};
            data.forEach(t => map[t.seizoen] = t);
            setter(map);
          } else {
            setter(data);
          }
          if (colName === 'planning') setLoading(false);
        },
        (err) => {
          console.error(`Sync error ${colName}:`, err);
          // Toon geen error bij initialisatie om UI niet te blokkeren
        }
      );
    };

    const unsubs = [
      syncCollection('planning', setEvents),
      syncCollection('coaches', setCoaches),
      syncCollection('locaties', setLocaties),
      syncCollection('groepen', setGroepen),
      syncCollection('tarieven', setTarieven)
    ];

    return () => unsubs.forEach(fn => fn());
  }, [user]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setIsAdmin(true);
      setIsModalOpen(false);
      setAdminPassword("");
      setLoginError("");
    } else {
      setLoginError("Foutief wachtwoord.");
    }
  };

  const saveData = async (col, data, id = null) => {
    if (!isAdmin || !user) {
      setErrorMessage("U heeft geen toestemming om gegevens te wijzigen.");
      return;
    }
    
    setIsSaving(true);
    setErrorMessage("");
    
    try {
      // RULE 1: Exact pad voor documenten
      if (id) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', col, id);
        await updateDoc(docRef, data);
      } else {
        const colRef = collection(db, 'artifacts', appId, 'public', 'data', col);
        await addDoc(colRef, data);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      console.error("Save error:", e);
      setErrorMessage(`Opslaan mislukt: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (col, id) => {
    if (!isAdmin || !user || !window.confirm("Weet je zeker dat je dit wilt verwijderen?")) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', col, id);
      await deleteDoc(docRef);
    } catch (e) {
      setErrorMessage(`Verwijderen mislukt: ${e.message}`);
    }
  };

  const getCoachName = (id) => coaches.find(x => x.id === id)?.voornaam || 'Onbekend';
  const getLocatieName = (id) => locaties.find(x => x.id === id)?.benaming || 'Onbekend';
  const getGroepName = (id) => groepen.find(x => x.id === id)?.benaming || 'Algemeen';

  if (loading && !errorMessage) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-600 text-white">
      <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6"></div>
      <h2 className="text-xl font-black mb-2">Antwerp Ropes</h2>
      <p className="text-sm opacity-60">Laden...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      <header className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="cursor-pointer" onClick={() => setView('list')}>
            <h1 className="text-xl font-black tracking-tight">Antwerp Ropes</h1>
            <p className="text-[10px] uppercase font-bold opacity-70">Club Management</p>
          </div>
          <div className="flex gap-2">
            {!isAdmin ? (
              <button onClick={() => setIsModalOpen('login')} className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <Lock size={16} /> Admin
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setView(view === 'admin' ? 'list' : 'admin')} className={`p-2 rounded-xl transition ${view === 'admin' ? 'bg-white text-indigo-700' : 'bg-white/10'}`}>
                  <Settings size={20} />
                </button>
                <button onClick={() => setIsAdmin(false)} className="bg-red-500/20 p-2 rounded-xl text-red-100"><LogOut size={20} /></button>
              </div>
            )}
          </div>
        </div>
      </header>

      {errorMessage && (
        <div className="max-w-5xl mx-auto mt-4 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle size={18} />
            <span className="text-sm font-bold">{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="ml-auto text-red-400">×</button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto p-4 md:p-6">
        {view === 'admin' ? (
          <div className="space-y-6">
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
              {[
                { id: 'planning', label: 'Planning', icon: Calendar },
                { id: 'coaches', label: 'Coaches', icon: Users },
                { id: 'locaties', label: 'Locaties', icon: MapPin },
                { id: 'groepen', label: 'Groepen', icon: Home },
                { id: 'tarieven', label: 'Financiën', icon: Euro }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setAdminSubView(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition shrink-0 ${adminSubView === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black capitalize">{adminSubView} Beheer</h2>
                {adminSubView !== 'tarieven' && (
                  <button 
                    onClick={() => {
                      setEditingItem(null);
                      if(adminSubView === 'planning') setEventForm({ datum: '', uren: '', locatieId: '', groepId: '', coachId: '', opmerking: '' });
                      if(adminSubView === 'coaches') setCoachForm({ voornaam: '', naam: '', email: '' });
                      if(adminSubView === 'locaties') setLocatieForm({ benaming: '', adres: '', emailContact: '', boekingUrl: '' });
                      if(adminSubView === 'groepen') setGroepForm({ benaming: '' });
                      setIsModalOpen(adminSubView);
                    }}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>

              {adminSubView === 'planning' && (
                <div className="space-y-3">
                  {events.sort((a,b) => new Date(a.datum) - new Date(b.datum)).map(e => (
                    <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-indigo-600">{getGroepName(e.groepId)}</span>
                        <span className="font-bold">{new Date(e.datum).toLocaleDateString('nl-BE')}</span>
                        <span className="text-xs text-slate-500">{e.uren} - {getLocatieName(e.locatieId)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(e); setEventForm(e); setIsModalOpen('planning'); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => deleteItem('planning', e.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminSubView === 'coaches' && (
                <div className="grid gap-3">
                  {coaches.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div><p className="font-bold">{c.voornaam} {c.naam}</p><p className="text-xs text-slate-500">{c.email}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(c); setCoachForm(c); setIsModalOpen('coaches'); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => deleteItem('coaches', c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminSubView === 'locaties' && (
                <div className="grid gap-3">
                  {locaties.map(l => (
                    <div key={l.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div><p className="font-bold">{l.benaming}</p><p className="text-xs text-slate-500">{l.adres}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(l); setLocatieForm(l); setIsModalOpen('locaties'); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => deleteItem('locaties', l.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminSubView === 'groepen' && (
                <div className="grid gap-3">
                  {groepen.map(g => (
                    <div key={g.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="font-bold">{g.benaming}</p>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(g); setGroepForm(g); setIsModalOpen('groepen'); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => deleteItem('groepen', g.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminSubView === 'tarieven' && (
                <div className="space-y-6">
                  <div className="bg-indigo-50 p-4 rounded-2xl flex gap-3">
                    <Info className="text-indigo-600 shrink-0" />
                    <p className="text-xs text-indigo-900 font-medium">Stel hier de uurtarieven in voor de automatische facturatieberekening.</p>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); saveData('tarieven', tariefForm, Object.values(tarieven).find(t => t.seizoen === tariefForm.seizoen)?.id); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Seizoen</label>
                        <select value={tariefForm.seizoen} onChange={(e) => setTariefForm({...tariefForm, seizoen: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100">
                          <option>2023-2024</option>
                          <option>2024-2025</option>
                          <option>2025-2026</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Coach / u</label>
                        <input type="number" step="0.5" value={tariefForm.coachUur} onChange={(e) => setTariefForm({...tariefForm, coachUur: parseFloat(e.target.value)})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Zaal / u</label>
                        <input type="number" step="0.5" value={tariefForm.locatieUur} onChange={(e) => setTariefForm({...tariefForm, locatieUur: parseFloat(e.target.value)})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                      </div>
                    </div>
                    <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black">{isSaving ? 'Opslaan...' : 'Tarieven bijwerken'}</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
                <Calendar className="mx-auto text-slate-200 mb-4" size={64} />
                <p className="font-bold text-slate-400">Nog geen trainingen gepland.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {events.sort((a,b) => new Date(a.datum) - new Date(b.datum)).map(event => (
                  <div key={event.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">{getGroepName(event.groepId)}</span>
                        <h3 className="text-lg font-black mt-1">{event.opmerking || 'Training'}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-indigo-600">{new Date(event.datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{DAGEN[new Date(event.datum).getDay()]}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-500 text-sm font-medium">
                      <div className="flex items-center gap-2"><div className="p-1.5 bg-slate-50 rounded-lg text-indigo-500"><Clock size={14}/></div>{event.uren}</div>
                      <div className="flex items-center gap-2"><div className="p-1.5 bg-slate-50 rounded-lg text-indigo-500"><MapPin size={14}/></div>{getLocatieName(event.locatieId)}</div>
                      <div className="flex items-center gap-2"><div className="p-1.5 bg-slate-50 rounded-lg text-indigo-500"><User size={14}/></div>{getCoachName(event.coachId)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {isModalOpen && isModalOpen !== 'login' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden p-8">
            <h2 className="text-2xl font-black mb-6">{editingItem ? 'Bewerken' : 'Nieuw Toevoegen'}</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (isModalOpen === 'planning') saveData('planning', eventForm, editingItem?.id);
              if (isModalOpen === 'coaches') saveData('coaches', coachForm, editingItem?.id);
              if (isModalOpen === 'locaties') saveData('locaties', locatieForm, editingItem?.id);
              if (isModalOpen === 'groepen') saveData('groepen', groepForm, editingItem?.id);
            }} className="space-y-4">
              
              {isModalOpen === 'planning' && (
                <div className="space-y-3">
                  <input type="date" required value={eventForm.datum} onChange={(e) => setEventForm({...eventForm, datum: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                  <input type="text" placeholder="Uren (bv. 18:30 - 20:30)" required value={eventForm.uren} onChange={(e) => setEventForm({...eventForm, uren: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                  <select required value={eventForm.locatieId} onChange={(e) => setEventForm({...eventForm, locatieId: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100">
                    <option value="">Selecteer Locatie</option>
                    {locaties.map(l => <option key={l.id} value={l.id}>{l.benaming}</option>)}
                  </select>
                  <select required value={eventForm.coachId} onChange={(e) => setEventForm({...eventForm, coachId: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100">
                    <option value="">Selecteer Coach</option>
                    {coaches.map(c => <option key={c.id} value={c.id}>{c.voornaam} {c.naam}</option>)}
                  </select>
                  <select required value={eventForm.groepId} onChange={(e) => setEventForm({...eventForm, groepId: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100">
                    <option value="">Selecteer Groep</option>
                    {groepen.map(g => <option key={g.id} value={g.id}>{g.benaming}</option>)}
                  </select>
                  <textarea placeholder="Opmerking" value={eventForm.opmerking} onChange={(e) => setEventForm({...eventForm, opmerking: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100 h-20" />
                </div>
              )}

              {isModalOpen === 'coaches' && (
                <div className="space-y-3">
                  <input type="text" placeholder="Voornaam" required value={coachForm.voornaam} onChange={(e) => setCoachForm({...coachForm, voornaam: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                  <input type="text" placeholder="Naam" required value={coachForm.naam} onChange={(e) => setCoachForm({...coachForm, naam: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                  <input type="email" placeholder="E-mail" value={coachForm.email || ''} onChange={(e) => setCoachForm({...coachForm, email: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                </div>
              )}

              {isModalOpen === 'locaties' && (
                <div className="space-y-3">
                  <input type="text" placeholder="Benaming" required value={locatieForm.benaming} onChange={(e) => setLocatieForm({...locatieForm, benaming: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                  <input type="text" placeholder="Adres" value={locatieForm.adres || ''} onChange={(e) => setLocatieForm({...locatieForm, adres: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                </div>
              )}

              {isModalOpen === 'groepen' && (
                <div className="space-y-3">
                  <input type="text" placeholder="Groepsnaam" required value={groepForm.benaming} onChange={(e) => setGroepForm({...groepForm, benaming: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Annuleer</button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black">{isSaving ? 'Opslaan...' : 'Bevestigen'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen === 'login' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAdminLogin} className="bg-white rounded-[40px] w-full max-w-sm p-8 shadow-2xl text-center">
            <Lock className="mx-auto text-indigo-600 mb-4" size={40} />
            <h2 className="text-2xl font-black mb-6">Admin Login</h2>
            <input autoFocus type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Wachtwoord" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-center mb-4" />
            {loginError && <p className="text-red-500 text-xs font-bold mb-4">{loginError}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Sluiten</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black">Login</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
