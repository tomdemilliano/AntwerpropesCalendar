import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
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
  List, 
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
  Euro,
  Settings
} from 'lucide-react';

// --- FIREBASE INITIALISATIE ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
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
  
  const [view, setView] = useState('list'); 
  const [adminSubView, setAdminSubView] = useState('coaches'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [eventForm, setEventForm] = useState({ datum: '', uren: '', locatieId: '', groepId: '', coachId: '', opmerking: '' });
  const [coachForm, setCoachForm] = useState({ voornaam: '', naam: '', email: '' });
  const [locatieForm, setLocatieForm] = useState({ benaming: '', adres: '', emailContact: '', boekingUrl: '' });
  const [groepForm, setGroepForm] = useState({ benaming: '' });
  const [tariefForm, setTariefForm] = useState({ seizoen: '2024-2025', coachUur: 0, locatieUur: 0 });

  // Auth Effect
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Sync Data Effect
  useEffect(() => {
    if (!user) return;

    const syncCollection = (collectionName, setter) => {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', collectionName));
      return onSnapshot(q, 
        (snapshot) => {
          const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setter(data);
          if (collectionName === 'planning') setLoading(false);
        },
        (error) => {
          console.error(`Error fetching ${collectionName}:`, error);
        }
      );
    };

    const unsubEvents = syncCollection('planning', setEvents);
    const unsubCoaches = syncCollection('coaches', setCoaches);
    const unsubLocaties = syncCollection('locaties', setLocaties);
    const unsubGroepen = syncCollection('groepen', setGroepen);
    const unsubTarieven = syncCollection('tarieven', (data) => {
        const map = {};
        data.forEach(t => map[t.seizoen] = t);
        setTarieven(map);
    });

    return () => {
      unsubEvents(); unsubCoaches(); unsubLocaties(); unsubGroepen(); unsubTarieven();
    };
  }, [user]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setIsAdmin(true);
      setIsModalOpen(false);
      setAdminPassword("");
      setLoginError("");
    } else {
      setLoginError("Foutief wachtwoord");
    }
  };

  const saveData = async (col, data, id = null) => {
    if (!isAdmin || !user) return;
    setIsSaving(true);
    try {
      if (id) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id), data);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', col), data);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (e) { 
      console.error("Fout bij opslaan:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (col, id) => {
    if (!isAdmin || !user || !window.confirm("Weet je zeker dat je dit wilt verwijderen?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id));
    } catch (e) { console.error("Fout bij verwijderen:", e); }
  };

  // Helper functions
  const getCoachName = (id) => {
    const c = coaches.find(x => x.id === id);
    return c ? `${c.voornaam} ${c.naam}` : 'Geen coach';
  };

  const getLocatieName = (id) => {
    const l = locaties.find(x => x.id === id);
    return l ? l.benaming : 'Geen locatie';
  };

  const getGroepName = (id) => {
    const g = groepen.find(x => x.id === id);
    return g ? g.benaming : 'Geen groep';
  };

  if (loading && !user) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">
      <header className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="cursor-pointer" onClick={() => setView('list')}>
            <h1 className="text-xl font-black tracking-tight">Antwerp Ropes</h1>
            <p className="text-[10px] uppercase font-bold opacity-70">Club Management System</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView(view === 'list' ? 'calendar' : 'list')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition">
              {view === 'list' ? <Calendar size={20} /> : <List size={20} />}
            </button>
            {isAdmin && (
              <button onClick={() => setView('admin')} className={`p-2 rounded-xl transition ${view === 'admin' ? 'bg-white text-indigo-700' : 'bg-white/10'}`}>
                <Settings size={20} />
              </button>
            )}
            {!isAdmin ? (
                <button onClick={() => setIsModalOpen('login')} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-sm font-bold">
                    <Lock size={16} /> Admin
                </button>
            ) : (
                <button onClick={() => setIsAdmin(false)} className="bg-red-500/20 hover:bg-red-500/40 p-2 rounded-xl text-red-100 transition">
                    <LogOut size={20} />
                </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6">
        {view === 'admin' ? (
          <div className="space-y-6">
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
              {[
                { id: 'coaches', label: 'Coaches', icon: Users },
                { id: 'locaties', label: 'Locaties', icon: MapPin },
                { id: 'groepen', label: 'Groepen', icon: Home },
                { id: 'financien', label: 'Financiën', icon: Euro }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setAdminSubView(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition ${adminSubView === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black capitalize">{adminSubView}</h2>
                    <button 
                        onClick={() => { 
                            setEditingItem(null); 
                            if(adminSubView === 'coaches') setCoachForm({ voornaam: '', naam: '', email: '' });
                            if(adminSubView === 'locaties') setLocatieForm({ benaming: '', adres: '', emailContact: '', boekingUrl: '' });
                            if(adminSubView === 'groepen') setGroepForm({ benaming: '' });
                            if(adminSubView === 'financien') setTariefForm({ seizoen: '2024-2025', coachUur: 0, locatieUur: 0 });
                            setIsModalOpen(adminSubView); 
                        }}
                        className="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100 transition"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {adminSubView === 'coaches' && (
                    <div className="grid gap-4">
                        {coaches.map(c => (
                            <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="font-bold text-slate-900">{c.voornaam} {c.naam}</p>
                                    <p className="text-xs text-slate-500">{c.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingItem(c); setCoachForm(c); setIsModalOpen('coaches'); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
                                    <button onClick={() => deleteItem('coaches', c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {adminSubView === 'locaties' && (
                    <div className="grid gap-4">
                        {locaties.map(l => (
                            <div key={l.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="font-bold text-slate-900">{l.benaming}</p>
                                    <p className="text-xs text-slate-500">{l.adres}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingItem(l); setLocatieForm(l); setIsModalOpen('locaties'); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
                                    <button onClick={() => deleteItem('locaties', l.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {adminSubView === 'groepen' && (
                    <div className="grid gap-4">
                        {groepen.map(g => (
                            <div key={g.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="font-bold text-slate-900">{g.benaming}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingItem(g); setGroepForm(g); setIsModalOpen('groepen'); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
                                    <button onClick={() => deleteItem('groepen', g.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {adminSubView === 'financien' && (
                    <div className="grid gap-4">
                        {Object.values(tarieven).map(t => (
                            <div key={t.seizoen} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-black text-indigo-700">Seizoen {t.seizoen}</p>
                                    <button onClick={() => { setEditingItem(t); setTariefForm(t); setIsModalOpen('financien'); }} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                                </div>
                                <div className="flex gap-6 text-sm">
                                    <p><span className="text-slate-400 font-medium">Coach:</span> <span className="font-bold">€{t.coachUur}/u</span></p>
                                    <p><span className="text-slate-400 font-medium">Locatie:</span> <span className="font-bold">€{t.locatieUur}/u</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {events.length === 0 && !loading && (
              <div className="text-center p-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                <p className="font-bold text-slate-400">Nog geen trainingen gepland.</p>
              </div>
            )}
            {events.sort((a,b) => new Date(a.datum) - new Date(b.datum)).map(event => (
              <div key={event.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 group hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">
                      {getGroepName(event.groepId)}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">{event.opmerking || 'Training'}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-600">{new Date(event.datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{DAGEN[new Date(event.datum).getDay()]}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <div className="p-1.5 bg-slate-50 rounded-lg text-indigo-500"><Clock size={14}/></div>
                    {event.uren}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <div className="p-1.5 bg-slate-50 rounded-lg text-indigo-500"><MapPin size={14}/></div>
                    <span className="truncate">{getLocatieName(event.locatieId)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <div className="p-1.5 bg-slate-50 rounded-lg text-indigo-500"><User size={14}/></div>
                    <span className="truncate">{getCoachName(event.coachId)}</span>
                  </div>
                </div>

                {isAdmin && (
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingItem(event); setEventForm(event); setIsModalOpen('planning'); }} className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg">Aanpassen</button>
                        <button onClick={() => deleteItem('planning', event.id)} className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg">Verwijder</button>
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {isAdmin && view === 'list' && (
        <button onClick={() => { setEditingItem(null); setEventForm({ datum: '', uren: '', locatieId: '', groepId: '', coachId: '', opmerking: '' }); setIsModalOpen('planning'); }} className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl hover:bg-indigo-700 transition-all hover:scale-110 z-30">
          <Plus size={32} />
        </button>
      )}

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-200">
            {isModalOpen === 'login' && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <h2 className="text-2xl font-black text-center mb-6">Beheerder Toegang</h2>
                <input autoFocus type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Wachtwoord" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-center" />
                {loginError && <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Terug</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black">Inloggen</button>
                </div>
              </form>
            )}

            {isModalOpen === 'planning' && (
              <form onSubmit={(e) => { e.preventDefault(); saveData('planning', eventForm, editingItem?.id); }} className="space-y-4">
                <h2 className="text-2xl font-black mb-4">{editingItem ? 'Bewerken' : 'Nieuwe Training'}</h2>
                <div className="space-y-3">
                    <input type="date" required value={eventForm.datum} onChange={(e) => setEventForm({...eventForm, datum: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                    <input type="text" placeholder="Uren (bv. 18:30 - 20:30)" value={eventForm.uren} onChange={(e) => setEventForm({...eventForm, uren: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                    
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

                    <textarea placeholder="Extra opmerking..." value={eventForm.opmerking} onChange={(e) => setEventForm({...eventForm, opmerking: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold h-20 border border-slate-100" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Annuleer</button>
                  <button type="submit" disabled={isSaving} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black">
                    {isSaving ? "Even geduld..." : (editingItem ? 'Opslaan' : 'Toevoegen')}
                  </button>
                </div>
              </form>
            )}

            {isModalOpen === 'coaches' && (
              <form onSubmit={(e) => { e.preventDefault(); saveData('coaches', coachForm, editingItem?.id); }} className="space-y-4">
                <h2 className="text-2xl font-black mb-4">Coach Beheren</h2>
                <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Voornaam" value={coachForm.voornaam} onChange={(e) => setCoachForm({...coachForm, voornaam: e.target.value})} className="p-3 bg-slate-50 rounded-xl font-bold border border-slate-100" />
                    <input type="text" placeholder="Naam" value={coachForm.naam} onChange={(e) => setCoachForm({...coachForm, naam: e.target.value})} className="p-3 bg-slate-50 rounded-xl font-bold border border-slate-100" />
                </div>
                <input type="email" placeholder="Emailadres" value={coachForm.email} onChange={(e) => setCoachForm({...coachForm, email: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100" />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Terug</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black">Opslaan</button>
                </div>
              </form>
            )}

            {isModalOpen === 'locaties' && (
              <form onSubmit={(e) => { e.preventDefault(); saveData('locaties', locatieForm, editingItem?.id); }} className="space-y-3">
                <h2 className="text-2xl font-black mb-4">Locatie Beheren</h2>
                <input type="text" placeholder="Benaming (bv. Sporthal X)" value={locatieForm.benaming} onChange={(e) => setLocatieForm({...locatieForm, benaming: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100" />
                <input type="text" placeholder="Adres" value={locatieForm.adres} onChange={(e) => setLocatieForm({...locatieForm, adres: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100" />
                <input type="email" placeholder="Email contactpersoon" value={locatieForm.emailContact} onChange={(e) => setLocatieForm({...locatieForm, emailContact: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100" />
                <input type="url" placeholder="URL Boeking (https://...)" value={locatieForm.boekingUrl} onChange={(e) => setLocatieForm({...locatieForm, boekingUrl: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100" />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Terug</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black">Opslaan</button>
                </div>
              </form>
            )}

            {isModalOpen === 'groepen' && (
              <form onSubmit={(e) => { e.preventDefault(); saveData('groepen', groepForm, editingItem?.id); }} className="space-y-4">
                <h2 className="text-2xl font-black mb-4">Groep Beheren</h2>
                <input type="text" placeholder="Naam van de groep" value={groepForm.benaming} onChange={(e) => setGroepForm({...groepForm, benaming: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100" />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Terug</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black">Opslaan</button>
                </div>
              </form>
            )}

            {isModalOpen === 'financien' && (
              <form onSubmit={(e) => { e.preventDefault(); saveData('tarieven', tariefForm, editingItem?.id); }} className="space-y-4">
                <h2 className="text-2xl font-black mb-4">Tarieven Instellen</h2>
                <input type="text" placeholder="Seizoen (bv. 2024-2025)" value={tariefForm.seizoen} onChange={(e) => setTariefForm({...tariefForm, seizoen: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100" />
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Coach /u</label>
                        <input type="number" step="0.5" value={tariefForm.coachUur} onChange={(e) => setTariefForm({...tariefForm, coachUur: parseFloat(e.target.value) || 0})} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Locatie /u</label>
                        <input type="number" step="0.5" value={tariefForm.locatieUur} onChange={(e) => setTariefForm({...tariefForm, locatieUur: parseFloat(e.target.value) || 0})} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100" />
                    </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Terug</button>
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black">Opslaan</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
