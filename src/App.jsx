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
  Settings,
  AlertCircle,
  Activity,
  RefreshCw
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
  
  const [loading, setLoading] = useState(true);
  const [debugLogs, setDebugLogs] = useState(["Systeem initialiseren..."]);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [view, setView] = useState('list'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Formulieren states
  const [eventForm, setEventForm] = useState({ datum: '', uren: '', locatieId: '', groepId: '', coachId: '', opmerking: '' });

  const addLog = (msg) => {
    console.log(`[DEBUG] ${msg}`);
    setDebugLogs(prev => [...prev.slice(-8), msg]);
  };

  // De robuuste configuratiezoeker die je voorstelde
  const getFirebaseConfig = () => {
    try {
      // 1. Check de lokale globale variabele (Canvas/Editor)
      if (typeof __firebase_config !== 'undefined' && __firebase_config) {
        return typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
      }
      
      // 2. Check window object
      if (window.__firebase_config) {
        return typeof window.__firebase_config === 'string' ? JSON.parse(window.__firebase_config) : window.__firebase_config;
      }

      // 3. Check Vite environment variables
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_CONFIG) {
        return JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
      }

      // 4. Check process.env
      if (typeof process !== 'undefined' && process.env && process.env.VITE_FIREBASE_CONFIG) {
        return JSON.parse(process.env.VITE_FIREBASE_CONFIG);
      }
    } catch (e) {
      addLog("Fout bij parsen van config.");
    }
    return null;
  };

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30;

    const boot = async () => {
      attempts++;
      const config = getFirebaseConfig();
      const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : window.__initial_auth_token;
      const envAppId = typeof __app_id !== 'undefined' ? __app_id : window.__app_id;

      if (!config) {
        if (attempts % 5 === 0) addLog(`Zoeken naar configuratie (poging ${attempts}/30)...`);
        if (attempts >= maxAttempts) {
          setErrorMessage("Geen database configuratie gevonden in de omgeving.");
          setLoading(false);
          return;
        }
        setTimeout(boot, 200);
        return;
      }

      addLog("Configuratie gevonden! Verbinding maken...");

      try {
        const firebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
        const firebaseAuth = getAuth(firebaseApp);
        const firebaseDb = getFirestore(firebaseApp);

        setDb(firebaseDb);
        setAuth(firebaseAuth);
        if (envAppId) setAppId(envAppId);

        if (token) {
          addLog("Inloggen met systeem-token...");
          await signInWithCustomToken(firebaseAuth, token);
        } else {
          addLog("Anoniem inloggen...");
          await signInAnonymously(firebaseAuth);
        }

        onAuthStateChanged(firebaseAuth, (u) => {
          if (u) {
            addLog("Verbinding succesvol.");
            setUser(u);
          } else {
            setLoading(false);
          }
        });
      } catch (err) {
        addLog(`Fout: ${err.message}`);
        setErrorMessage(err.message);
        setLoading(false);
      }
    };

    boot();
  }, []);

  // Data synchronisatie
  useEffect(() => {
    if (!user || !db) return;

    const setupSync = (colName, setter) => {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', colName));
      return onSnapshot(q, (snap) => {
        setter(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        if (colName === 'planning') setLoading(false);
      }, (err) => {
        addLog(`Sync fout (${colName}): ${err.code}`);
      });
    };

    const unsubs = [
      setupSync('planning', setEvents),
      setupSync('coaches', setCoaches),
      setupSync('locaties', setLocaties),
      setupSync('groepen', setGroepen)
    ];

    return () => unsubs.forEach(fn => fn());
  }, [user, db, appId]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === "admin123") {
      setIsAdmin(true);
      setIsModalOpen(false);
      setAdminPassword("");
    } else {
      setLoginError("Foutief wachtwoord.");
    }
  };

  const getCoachName = (id) => coaches.find(x => x.id === id)?.voornaam || 'Onbekend';
  const getLocatieName = (id) => locaties.find(x => x.id === id)?.benaming || 'Onbekend';
  const getGroepName = (id) => groepen.find(x => x.id === id)?.benaming || 'Algemeen';

  if (errorMessage) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full border border-red-100 text-center">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
        <h2 className="text-xl font-black mb-2">Verbindingsfout</h2>
        <p className="text-slate-500 text-sm mb-6">{errorMessage}</p>
        <div className="bg-slate-50 p-4 rounded-xl text-left mb-6 font-mono text-[10px] text-slate-400">
          {debugLogs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <button onClick={() => window.location.reload()} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">
          <RefreshCw size={18} /> Herladen
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-600 text-white">
      <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6"></div>
      <h2 className="text-xl font-black mb-2">Antwerp Ropes</h2>
      <p className="text-xs opacity-60 font-mono">{debugLogs[debugLogs.length - 1]}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      <header className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-30 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black">Antwerp Ropes</h1>
          <p className="text-[10px] font-bold opacity-70">Club Planner</p>
        </div>
        {!isAdmin ? (
          <button onClick={() => setIsModalOpen('login')} className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <Lock size={16} /> Admin
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setIsAdmin(false)} className="bg-red-500/20 p-2 rounded-xl text-red-100"><LogOut size={20} /></button>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6">
        {events.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
            <Calendar className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="font-bold text-slate-400">Geen trainingen gevonden.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map(event => (
              <div key={event.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">{getGroepName(event.groepId)}</span>
                  <span className="text-slate-400 text-xs font-bold">{new Date(event.datum).toLocaleDateString('nl-BE')}</span>
                </div>
                <h3 className="text-lg font-black">{event.opmerking || 'Training'}</h3>
                <div className="flex flex-wrap gap-4 mt-3 text-slate-500 text-sm font-medium">
                  <div className="flex items-center gap-1"><Clock size={14}/> {event.uren}</div>
                  <div className="flex items-center gap-1"><MapPin size={14}/> {getLocatieName(event.locatieId)}</div>
                  <div className="flex items-center gap-1"><User size={14}/> {getCoachName(event.coachId)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
