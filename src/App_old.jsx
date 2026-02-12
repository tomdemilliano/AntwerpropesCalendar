import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
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
  Euro,
  Info
} from 'lucide-react';

const DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

export default function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [appId, setAppId] = useState('sportclub-admin-v1');
  
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

  // Form states
  const [eventForm, setEventForm] = useState({ datum: '', uren: '', locatieId: '', groepId: '', coachId: '', opmerking: '' });
  const [coachForm, setCoachForm] = useState({ voornaam: '', naam: '', email: '' });
  const [locatieForm, setLocatieForm] = useState({ benaming: '', adres: '', emailContact: '', boekingUrl: '' });
  const [groepForm, setGroepForm] = useState({ benaming: '' });
  const [tariefForm, setTariefForm] = useState({ seizoen: '2024-2025', coachUur: 0, locatieUur: 0 });

  // 1. Robuuste Firebase Configuratie Helper
  const getFirebaseConfig = useCallback(() => {
    try {
      if (typeof __firebase_config !== 'undefined' && __firebase_config) {
        return typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
      }
      if (typeof window !== 'undefined' && window.__firebase_config) {
        return typeof window.__firebase_config === 'string' ? JSON.parse(window.__firebase_config) : window.__firebase_config;
      }
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_CONFIG) {
        return JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
      }
    } catch (e) {
      console.error("Config parse error:", e);
    }
    return null;
  }, []);

  // 2. Firebase Initialisatie
  useEffect(() => {
    const startFirebase = async () => {
      try {
        const config = getFirebaseConfig();
        
        if (!config) {
          setTimeout(startFirebase, 500);
          return;
        }

        const firebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
        const firebaseAuth = getAuth(firebaseApp);
        const firebaseDb = getFirestore(firebaseApp);
        
        // App ID ophalen (Cruciaal voor Firestore paden)
        const currentAppId = typeof __app_id !== 'undefined' ? __app_id : (typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'sportclub-admin-v1');

        setDb(firebaseDb);
        setAuth(firebaseAuth);
        setAppId(currentAppId);

        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : (typeof window !== 'undefined' ? window.__initial_auth_token : null);

        if (token) {
          await signInWithCustomToken(firebaseAuth, token);
        } else {
          await signInAnonymously(firebaseAuth);
        }

        onAuthStateChanged(firebaseAuth, (u) => {
          setUser(u);
          setLoading(false);
        });

      } catch (err) {
        console.error("Fout bij opstarten:", err);
        setErrorMessage("Verbinding met de database mislukt.");
        setLoading(false);
      }
    };

    startFirebase();
  }, [getFirebaseConfig]);

  // 3. Data synchronisatie
  useEffect(() => {
    if (!user || !db || !appId) return;

    const setupSync = (collectionName, setter) => {
      const path = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
      
      return onSnapshot(path, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (collectionName === 'tarieven') {
          const map = {};
          items.forEach(t => map[t.seizoen] = t);
          setter(map);
        } else {
          setter(items);
        }
      }, (error) => {
        console.error(`Sync error voor ${collectionName}:`, error);
      });
    };

    const unsubEvents = setupSync('planning', setEvents);
    const unsubCoaches = setupSync('coaches', setCoaches);
    const unsubLocaties = setupSync('locaties', setLocaties);
    const unsubGroepen = setupSync('groepen', setGroepen);
    const unsubTarieven = setupSync('tarieven', setTarieven);

    return () => {
      unsubEvents();
      unsubCoaches();
      unsubLocaties();
      unsubGroepen();
      unsubTarieven();
    };
  }, [user, db, appId]);

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

  // Verbeterde Save handler met expliciete paden
  const handleSave = async (col, data, id = null) => {
    if (!isAdmin || !db || !user) {
      setErrorMessage("Geen machtiging of database niet verbonden.");
      return;
    }
    
    setIsSaving(true);
    setErrorMessage("");
    
    try {
      // Gebruik exact het pad dat de regels verwachten
      if (id) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', col, id);
        await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
      } else {
        const colRef = collection(db, 'artifacts', appId, 'public', 'data', col);
        await addDoc(colRef, { ...data, createdAt: new Date().toISOString() });
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Firestore Save Error:", err);
      setErrorMessage(`Opslaan mislukt: ${err.message || 'Controleer rechten'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (col, id) => {
    if (!isAdmin || !db || !user || !window.confirm("Dit item verwijderen?")) return;
    
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', col, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Firestore Delete Error:", err);
      setErrorMessage("Verwijderen mislukt.");
    }
  };

  const getCoachName = (id) => coaches.find(x => x.id === id)?.voornaam || 'Onbekend';
  const getLocatieName = (id) => locaties.find(x => x.id === id)?.benaming || 'Onbekend';
  const getGroepName = (id) => groepen.find(x => x.id === id)?.benaming || 'Algemeen';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-700 text-white p-6 text-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-black mb-2 tracking-tight">Antwerp Ropes</h2>
        <p className="text-sm opacity-60 max-w-xs">De beveiligde verbinding met de database wordt opgezet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="cursor-pointer" onClick={() => setView('list')}>
            <h1 className="text-xl font-black">Antwerp Ropes</h1>
            <p className="text-[10px] uppercase opacity-70">Club Management</p>
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
        <div className="max-w-5xl mx-auto m-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold">
            <AlertCircle size={16} /> {errorMessage}
          </div>
          <button onClick={() => setErrorMessage("")} className="font-black text-xl leading-none">&times;</button>
        </div>
      )}

      <main className="max-w-5xl mx-auto p-4 md:p-6">
        {view === 'admin' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shrink-0 transition ${adminSubView === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black capitalize">{adminSubView}</h2>
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
                    className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 shadow-sm"
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {adminSubView === 'planning' && events.sort((a,b) => new Date(a.datum) - new Date(b.datum)).map(e => (
                  <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition">
                    <div>
                      <p className="font-black text-indigo-700">{new Date(e.datum).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{e.uren} — {getLocatieName(e.locatieId)}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{getCoachName(e.coachId)} | {getGroepName(e.groepId)}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingItem(e); setEventForm(e); setIsModalOpen('planning'); }} className="p-2 text-indigo-600 hover:bg-white rounded-lg shadow-sm"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete('planning', e.id)} className="p-2 text-red-600 hover:bg-white rounded-lg shadow-sm"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}

                {adminSubView === 'coaches' && coaches.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <p className="font-bold">{c.voornaam} {c.naam}</p>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingItem(c); setCoachForm(c); setIsModalOpen('coaches'); }} className="p-2 text-indigo-600 hover:bg-white rounded-lg"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete('coaches', c.id)} className="p-2 text-red-600 hover:bg-white rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}

                {adminSubView === 'locaties' && locaties.map(l => (
                  <div key={l.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <p className="font-bold">{l.benaming}</p>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingItem(l); setLocatieForm(l); setIsModalOpen('locaties'); }} className="p-2 text-indigo-600 hover:bg-white rounded-lg"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete('locaties', l.id)} className="p-2 text-red-600 hover:bg-white rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 animate-in slide-in-from-bottom-4 duration-500">
            {events.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                <Calendar className="mx-auto text-slate-200 mb-4" size={56} />
                <p className="text-slate-400 font-bold text-lg">Geen geplande trainingen</p>
                <p className="text-slate-300 text-sm">Nieuwe sessies verschijnen hier zodra de admin ze toevoegt.</p>
              </div>
            ) : (
              events.sort((a,b) => new Date(a.datum) - new Date(b.datum)).map(event => (
                <div key={event.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg uppercase tracking-wider">{getGroepName(event.groepId)}</span>
                      <h3 className="text-xl font-black mt-2 text-slate-800">{event.opmerking || 'Training'}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-600 text-xl font-black leading-none">{new Date(event.datum).toLocaleDateString('nl-BE', {day:'2-digit', month:'short'})}</p>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mt-1">{DAGEN[new Date(event.datum).getDay()]}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-500 font-bold border-t border-slate-50 pt-4">
                    <span className="flex items-center gap-2"><div className="p-1.5 bg-slate-50 rounded-lg text-indigo-500"><Clock size={16}/></div> {event.uren}</span>
                    <span className="flex items-center gap-2"><div className="p-1.5 bg-slate-50 rounded-lg text-indigo-500"><MapPin size={16}/></div> {getLocatieName(event.locatieId)}</span>
                    <span className="flex items-center gap-2"><div className="p-1.5 bg-slate-50 rounded-lg text-indigo-500"><User size={16}/></div> {getCoachName(event.coachId)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Login Modal */}
      {isModalOpen === 'login' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAdminLogin} className="bg-white p-8 rounded-[40px] w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-black mb-2 text-center">Beheerder Login</h2>
            <p className="text-slate-400 text-center text-sm mb-8 font-medium">Toegang beperkt tot geautoriseerde coaches.</p>
            <input 
              autoFocus
              type="password" 
              value={adminPassword} 
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Wachtwoord"
              className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-center mb-4 transition"
            />
            {loginError && <p className="text-red-500 text-xs font-bold mb-4 text-center">{loginError}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Terug</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200">Login</button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Form Modals */}
      {isModalOpen && isModalOpen !== 'login' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white p-8 rounded-[40px] w-full max-w-lg my-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <h2 className="text-2xl font-black mb-6 capitalize">{isModalOpen} details</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if(isModalOpen === 'planning') handleSave('planning', eventForm, editingItem?.id);
              if(isModalOpen === 'coaches') handleSave('coaches', coachForm, editingItem?.id);
              if(isModalOpen === 'locaties') handleSave('locaties', locatieForm, editingItem?.id);
              if(isModalOpen === 'groepen') handleSave('groepen', groepForm, editingItem?.id);
            }} className="space-y-4">
              {isModalOpen === 'planning' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Datum</label>
                      <input type="date" required value={eventForm.datum} onChange={e => setEventForm({...eventForm, datum: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tijd (bv 18-20u)</label>
                      <input type="text" placeholder="18:00 - 20:00" required value={eventForm.uren} onChange={e => setEventForm({...eventForm, uren: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none font-bold" />
                    </div>
                  </div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Locatie</label>
                  <select required value={eventForm.locatieId} onChange={e => setEventForm({...eventForm, locatieId: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none font-bold">
                    <option value="">Kies locatie...</option>
                    {locaties.map(l => <option key={l.id} value={l.id}>{l.benaming}</option>)}
                  </select>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Coach & Groep</label>
                  <div className="grid grid-cols-2 gap-3">
                    <select required value={eventForm.coachId} onChange={e => setEventForm({...eventForm, coachId: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none font-bold">
                      <option value="">Coach...</option>
                      {coaches.map(c => <option key={c.id} value={c.id}>{c.voornaam} {c.naam}</option>)}
                    </select>
                    <select required value={eventForm.groepId} onChange={e => setEventForm({...eventForm, groepId: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none font-bold">
                      <option value="">Groep...</option>
                      {groepen.map(g => <option key={g.id} value={g.id}>{g.benaming}</option>)}
                    </select>
                  </div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Titel / Info</label>
                  <input type="text" placeholder="bv. Kersttraining" value={eventForm.opmerking} onChange={e => setEventForm({...eventForm, opmerking: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none font-bold" />
                </div>
              )}
              {isModalOpen === 'coaches' && (
                <div className="space-y-3">
                  <input placeholder="Voornaam" required value={coachForm.voornaam} onChange={e => setCoachForm({...coachForm, voornaam: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none font-bold" />
                  <input placeholder="Achternaam" required value={coachForm.naam} onChange={e => setCoachForm({...coachForm, naam: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none font-bold" />
                  <input type="email" placeholder="E-mail (optioneel)" value={coachForm.email || ''} onChange={e => setCoachForm({...coachForm, email: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none font-bold" />
                </div>
              )}
              {isModalOpen === 'locaties' && (
                <div className="space-y-3">
                  <input placeholder="Naam locatie" required value={locatieForm.benaming} onChange={e => setLocatieForm({...locatieForm, benaming: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none font-bold" />
                  <input placeholder="Adres" value={locatieForm.adres || ''} onChange={e => setLocatieForm({...locatieForm, adres: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none font-bold" />
                </div>
              )}
              {isModalOpen === 'groepen' && (
                <div className="space-y-3">
                  <input placeholder="Naam groep (bv. Competitie)" required value={groepForm.benaming} onChange={e => setGroepForm({...groepForm, benaming: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 outline-none font-bold" />
                </div>
              )}
              <div className="flex gap-2 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Annuleer</button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 disabled:opacity-50">
                  {isSaving ? 'Bezig...' : 'Opslaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
