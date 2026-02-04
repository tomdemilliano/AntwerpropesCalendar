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
  Settings,
  AlertCircle
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
  const [configError, setConfigError] = useState(false);
  
  const [view, setView] = useState('list'); 
  const [adminSubView, setAdminSubView] = useState('coaches'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Formulieren
  const [eventForm, setEventForm] = useState({ datum: '', uren: '', locatieId: '', groepId: '', coachId: '', opmerking: '' });
  const [coachForm, setCoachForm] = useState({ voornaam: '', naam: '', email: '' });
  const [locatieForm, setLocatieForm] = useState({ benaming: '', adres: '', emailContact: '', boekingUrl: '' });
  const [groepForm, setGroepForm] = useState({ benaming: '' });
  const [tariefForm, setTariefForm] = useState({ seizoen: '2024-2025', coachUur: 0, locatieUur: 0 });

  // 1. Ultre-robuuste Firebase initialisatie
  useEffect(() => {
    let checkInterval;
    let attempts = 0;
    const maxAttempts = 50; // We proberen het 5 seconden lang (elke 100ms)

    const init = async () => {
      const configStr = window.__firebase_config;
      const id = window.__app_id;
      const token = window.__initial_auth_token;

      if (!configStr) {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setConfigError(true);
          setLoading(false);
        }
        return; // Blijf wachten
      }

      // We hebben de config! Stop de interval
      clearInterval(checkInterval);

      try {
        const config = JSON.parse(configStr);
        const firebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
        const firebaseAuth = getAuth(firebaseApp);
        const firebaseDb = getFirestore(firebaseApp);

        setDb(firebaseDb);
        setAuth(firebaseAuth);
        if (id) setAppId(id);

        // Auth afhandeling
        if (token) {
          await signInWithCustomToken(firebaseAuth, token);
        } else {
          await signInAnonymously(firebaseAuth);
        }

        const unsubscribe = onAuthStateChanged(firebaseAuth, (u) => {
          setUser(u);
          if (!u) setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error("Firebase init fout:", err);
        setConfigError(true);
        setLoading(false);
      }
    };

    checkInterval = setInterval(init, 100);
    return () => clearInterval(checkInterval);
  }, []);

  // 2. Data synchronisatie
  useEffect(() => {
    if (!user || !db) return;

    const syncCollection = (collectionName, setter) => {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', collectionName));
      return onSnapshot(q, 
        (snapshot) => {
          const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setter(data);
          if (collectionName === 'planning') setLoading(false);
        },
        (err) => {
          console.error(`Fout bij laden van ${collectionName}:`, err);
          // Als de fout 403 is, kan het zijn dat de user nog niet volledig geauth is
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
  }, [user, db, appId]);

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
    if (!isAdmin || !user || !db) return;
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
    if (!isAdmin || !user || !db || !window.confirm("Weet je zeker dat je dit wilt verwijderen?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id));
    } catch (e) { console.error("Fout bij verwijderen:", e); }
  };

  const getCoachName = (id) => {
    const coach = coaches.find(x => x.id === id);
    return coach ? `${coach.voornaam} ${coach.naam}` : 'Geen coach';
  };
  const getLocatieName = (id) => locaties.find(x => x.id === id)?.benaming || 'Geen locatie';
  const getGroepName = (id) => groepen.find(x => x.id === id)?.benaming || 'Geen groep';

  if (configError) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
      <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-sm border border-red-100">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-black mb-2 text-slate-900">Verbindingsfout</h2>
        <p className="text-slate-500 text-sm font-medium">We konden geen verbinding maken met de database. Herlaad de pagina of probeer het later opnieuw.</p>
        <button onClick={() => window.location.reload()} className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Nu herladen</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-b-indigo-600"></div>
      </div>
      <p className="mt-4 text-slate-500 font-bold text-sm tracking-wide animate-pulse">Laden...</p>
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition shrink-0 ${adminSubView === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}
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
                                <div><p className="font-bold">{c.voornaam} {c.naam}</p><p className="text-xs text-slate-500">{c.email}</p></div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingItem(c); setCoachForm(c); setIsModalOpen('coaches'); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={16}/></button>
                                    <button onClick={() => deleteItem('coaches', c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
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
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">{getGroepName(event.groepId)}</span>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">{event.opmerking || 'Training'}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-600">{new Date(event.datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{DAGEN[new Date(event.datum).getDay()]}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <div className="p-1.5 bg-slate-50 rounded-lg text-indigo-500"><Clock size={14}/></div>{event.uren}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <div className="p-1.5 bg-slate-50 rounded-lg text-indigo-500"><MapPin size={14}/></div><span className="truncate">{getLocatieName(event.locatieId)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <div className="p-1.5 bg-slate-50 rounded-lg text-indigo-500"><User size={14}/></div><span className="truncate">{getCoachName(event.coachId)}</span>
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

            {(isModalOpen === 'planning' || isModalOpen === 'coaches') && (
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                if (isModalOpen === 'planning') saveData('planning', eventForm, editingItem?.id);
                if (isModalOpen === 'coaches') saveData('coaches', coachForm, editingItem?.id);
              }} className="space-y-4">
                <h2 className="text-2xl font-black mb-4">{editingItem ? 'Bewerken' : 'Nieuw Item'}</h2>
                
                {isModalOpen === 'planning' && (
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
                )}

                {isModalOpen === 'coaches' && (
                    <div className="space-y-3">
                        <input type="text" placeholder="Voornaam" required value={coachForm.voornaam} onChange={(e) => setCoachForm({...coachForm, voornaam: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                        <input type="text" placeholder="Naam" required value={coachForm.naam} onChange={(e) => setCoachForm({...coachForm, naam: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                        <input type="email" placeholder="E-mail" value={coachForm.email} onChange={(e) => setCoachForm({...coachForm, email: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold border border-slate-100" />
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Annuleer</button>
                  <button type="submit" disabled={isSaving} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black">
                    {isSaving ? "Even geduld..." : (editingItem ? 'Opslaan' : 'Toevoegen')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
