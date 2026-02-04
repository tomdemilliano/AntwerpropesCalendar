import React, { useState, useEffect, useMemo } from 'react';
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
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Calendar, 
  List, 
  Lock, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  User, 
  Clock,
  Info,
  LogOut
} from 'lucide-react';

// Veilige initialisatie voor verschillende omgevingen
const getFirebaseConfig = () => {
  try {
    // 1. Check de lokale globale variabele (Canvas/Editor)
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      return JSON.parse(__firebase_config);
    }
    
    // 2. Check Vite environment variables
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_CONFIG) {
      return JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
    }

    // 3. Fallback voor andere omgevingen/process.env
    if (typeof process !== 'undefined' && process.env && process.env.VITE_FIREBASE_CONFIG) {
      return JSON.parse(process.env.VITE_FIREBASE_CONFIG);
    }
  } catch (e) {
    console.error("Firebase configuratie kon niet worden geparsed.");
  }
  return null;
};

const config = getFirebaseConfig();
const app = config ? initializeApp(config) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

const getAppId = () => {
  if (typeof __app_id !== 'undefined') return __app_id;
  
  const envId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_ID) || 
                (typeof process !== 'undefined' && process.env?.VITE_APP_ID);
                
  return envId || 'sportclub-planning-default';
};

const appId = getAppId();

const DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const MAANDEN = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [formData, setFormData] = useState({
    dag: '', datum: '', waar: '', uren: '', groep: '', coach: '', opmerking: ''
  });

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'planning'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      data.sort((a, b) => new Date(a.datum) - new Date(b.datum));
      setEvents(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === "admin123") { 
      setIsAdmin(true);
      setLoginError("");
      setAdminPassword("");
      setIsModalOpen(false);
    } else {
      setLoginError("Onjuist wachtwoord.");
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!isAdmin || !db) return;

    try {
      const colPath = ['artifacts', appId, 'public', 'data', 'planning'];
      const colRef = collection(db, ...colPath);
      
      if (editingEvent) {
        const docRef = doc(db, ...colPath, editingEvent.id);
        await updateDoc(docRef, formData);
      } else {
        await addDoc(colRef, formData);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Opslaan mislukt:", error);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!db || !window.confirm("Weet je zeker dat je dit wilt verwijderen?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'planning', id));
    } catch (error) {
      console.error("Verwijderen mislukt:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      dag: '', datum: '', waar: '', uren: '', groep: '', coach: '', opmerking: ''
    });
    setEditingEvent(null);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setFormData({ ...event });
    setIsModalOpen('form');
  };

  const filteredEvents = useMemo(() => {
    if (view === 'list') {
      const today = new Date();
      today.setHours(0,0,0,0);
      return events.filter(e => new Date(e.datum) >= today);
    } else {
      return events.filter(e => {
        const d = new Date(e.datum);
        return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      });
    }
  }, [events, view, selectedDate]);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200 max-w-sm text-center">
          <Lock className="mx-auto mb-4 text-amber-500" size={48} />
          <h2 className="text-xl font-bold text-amber-900 mb-2">Configuratie Nodig</h2>
          <p className="text-amber-700 text-sm">
            Zorg dat de Firebase instellingen correct zijn ingevoerd in de omgevingsvariabelen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">
      <header className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Antwerp Ropes</h1>
            <p className="text-xs opacity-80 font-medium">Club Planning 25-26</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
            >
              {view === 'list' ? <Calendar size={20} /> : <List size={20} />}
            </button>
            {isAdmin ? (
              <button onClick={() => setIsAdmin(false)} className="flex items-center gap-1 bg-red-500 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <button onClick={() => setIsModalOpen('login')} className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg text-sm font-bold">
                <Lock size={16} /> <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {view === 'calendar' && (
          <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="p-2 hover:bg-slate-100 rounded-full">
              <ChevronLeft />
            </button>
            <h2 className="text-lg font-bold">{MAANDEN[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h2>
            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="p-2 hover:bg-slate-100 rounded-full">
              <ChevronRight />
            </button>
          </div>
        )}

        {isAdmin && (
          <button 
            onClick={() => { resetForm(); setIsModalOpen('form'); }}
            className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 z-30"
          >
            <Plus size={32} />
          </button>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Info className="mx-auto mb-4 text-slate-300" size={56} />
            <p className="text-slate-500 font-medium">Geen activiteiten gepland.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition duration-300 group">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-indigo-50 text-indigo-700 text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
                      {event.groep || 'Algemeen'}
                    </span>
                    <div className="text-right">
                      <p className="text-base font-black text-slate-800">
                        {new Date(event.datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{DAGEN[new Date(event.datum).getDay()]}</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-4">{event.opmerking || 'Training'}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Clock size={16} className="text-indigo-500" />
                      </div>
                      <span>{event.uren}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <MapPin size={16} className="text-indigo-500" />
                      </div>
                      <span className="truncate">{event.waar}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <User size={16} className="text-indigo-500" />
                      </div>
                      <span className="truncate">{event.coach || 'N.t.b.'}</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="mt-5 pt-4 border-t border-slate-50 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(event)} className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold text-xs transition">
                        <Edit2 size={14} /> Aanpassen
                      </button>
                      <button onClick={() => handleDeleteEvent(event.id)} className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg font-bold text-xs transition">
                        <Trash2 size={14} /> Verwijder
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {isModalOpen === 'login' ? (
              <div className="p-10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} />
                  </div>
                  <h2 className="text-2xl font-black">Beheerders toegang</h2>
                  <p className="text-slate-500 text-sm">Voer het club-wachtwoord in.</p>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input 
                    type="password" 
                    autoFocus
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Wachtwoord"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition font-bold"
                  />
                  {loginError && <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition">Annuleer</button>
                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">Login</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-8">
                <h2 className="text-2xl font-black mb-6">{editingEvent ? 'Activiteit bewerken' : 'Nieuwe activiteit'}</h2>
                <form onSubmit={handleSaveEvent} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Datum</label>
                      <input 
                        type="date" required value={formData.datum}
                        onChange={(e) => setFormData({...formData, datum: e.target.value})}
                        className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Uren</label>
                      <input 
                        type="text" placeholder="19u - 21u" value={formData.uren}
                        onChange={(e) => setFormData({...formData, uren: e.target.value})}
                        className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Locatie</label>
                    <input 
                      type="text" placeholder="Sporthal Groenendaal" value={formData.waar}
                      onChange={(e) => setFormData({...formData, waar: e.target.value})}
                      className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Groep</label>
                      <input 
                        type="text" placeholder="Recreanten" value={formData.groep}
                        onChange={(e) => setFormData({...formData, groep: e.target.value})}
                        className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Coach</label>
                      <input 
                        type="text" placeholder="Naam coach" value={formData.coach}
                        onChange={(e) => setFormData({...formData, coach: e.target.value})}
                        className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Wat gaan we doen?</label>
                    <textarea 
                      placeholder="Bijv. Speed-training of Wedstrijd" value={formData.opmerking}
                      onChange={(e) => setFormData({...formData, opmerking: e.target.value})}
                      className="w-full p-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold h-24"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition">Annuleren</button>
                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">Opslaan</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
