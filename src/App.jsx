import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy, updateDoc 
} from 'firebase/firestore';
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, MapPin, User, Users, Settings, 
  Calendar as CalendarIcon, X, LayoutGrid, Euro, Info, Navigation
} from 'lucide-react';

const App = () => {
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('kalender'); // 'kalender' of 'beheer'
  const [adminSection, setAdminSection] = useState('groepen');
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- DATA STATE ---
  const [trainingen, setTrainingen] = useState([]);
  const [groepen, setGroepen] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [locaties, setLocaties] = useState([]);

  // --- FORM STATE ---
  const [newTraining, setNewTraining] = useState({ datum: '', groepId: '', coachId: '', locatieId: '', uren: '' });

  // 1. Firebase Real-time Sync
  useEffect(() => {
    const unsubTrainingen = onSnapshot(query(collection(db, "planning"), orderBy("datum", "asc")), (snapshot) => {
      setTrainingen(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubGroepen = onSnapshot(collection(db, "groepen"), (snapshot) => {
      setGroepen(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCoaches = onSnapshot(collection(db, "coaches"), (snapshot) => {
      setCoaches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubLocaties = onSnapshot(collection(db, "locaties"), (snapshot) => {
      setLocaties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubTrainingen(); unsubGroepen(); unsubCoaches(); unsubLocaties(); };
  }, []);

  // 2. Beheer Configuratie
  const sections = {
    groepen: {
      title: 'Trainingsgroepen',
      collection: 'groepen',
      icon: <Users size={20} />,
      data: groepen,
      fields: [
        { name: 'naam', label: 'Naam Groep', type: 'text', placeholder: 'bv. Selectie A' },
        { name: 'aantalSpringers', label: 'Aantal Springers', type: 'number', placeholder: '0' },
        { name: 'seizoen', label: 'Trainingsseizoen', type: 'text', placeholder: '2025-2026' }
      ]
    },
    coaches: {
      title: 'Coaches',
      collection: 'coaches',
      icon: <User size={20} />,
      data: coaches,
      fields: [
        { name: 'naam', label: 'Volledige Naam', type: 'text', placeholder: 'bv. Jan Janssen' },
        { name: 'uurtarief', label: 'Uurtarief (€)', type: 'number', placeholder: '0.00' }
      ]
    },
    locaties: {
      title: 'Locaties',
      collection: 'locaties',
      icon: <MapPin size={20} />,
      data: locaties,
      fields: [
        { name: 'naam', label: 'Naam Locatie', type: 'text', placeholder: 'bv. Sporthal De Dreef' },
        { name: 'adres', label: 'Adres', type: 'text', placeholder: 'Straat 1, 1000 Stad' },
        { name: 'uurtarief', label: 'Huurprijs per uur (€)', type: 'number', placeholder: '0.00' }
      ]
    }
  };

  const currentSection = sections[adminSection];

  // 3. Handlers
  const handleSaveAdminItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (editingItem) {
      await updateDoc(doc(db, currentSection.collection, editingItem.id), data);
    } else {
      await addDoc(collection(db, currentSection.collection), data);
    }
    setShowAdminModal(false);
    setEditingItem(null);
  };

  const deleteItem = async (col, id) => {
    if (window.confirm("Weet je zeker dat je dit wilt verwijderen?")) {
      await deleteDoc(doc(db, col, id));
    }
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // --- KALENDER LOGICA ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const dayLabels = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* HEADER NAV */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <CalendarIcon size={24} />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">TRAINING<span className="text-indigo-600">PLANNER</span></h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('kalender')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${activeTab === 'kalender' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutGrid size={18}/> Kalender
          </button>
          <button 
            onClick={() => setActiveTab('beheer')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${activeTab === 'beheer' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Settings size={18}/> Beheer
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'kalender' ? (
          /* --- KALENDER VIEW --- */
          <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200">
                  <button onClick={() => changeMonth(-1)} className="hover:text-indigo-600 transition"><ChevronLeft /></button>
                  <h2 className="text-xl font-bold min-w-[180px] text-center capitalize">
                    {currentDate.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button onClick={() => changeMonth(1)} className="hover:text-indigo-600 transition"><ChevronRight /></button>
                </div>
                <button 
                  onClick={() => setShowTrainingModal(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-100"
                >
                  <Plus /> Training Inplannen
                </button>
              </div>

              <div className="grid grid-cols-7 gap-3">
                {dayLabels.map(label => <div key={label} className="text-center text-xs font-bold text-slate-400 uppercase pb-2">{label}</div>)}
                {[...Array(firstDayOfMonth)].map((_, i) => <div key={`e-${i}`} />)}
                {[...Array(daysInMonth)].map((_, i) => {
                  const d = i + 1;
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const daily = trainingen.filter(t => t.datum === dateStr);
                  return (
                    <div key={d} className="bg-white border border-slate-200 rounded-2xl p-3 min-h-[140px] shadow-sm hover:border-indigo-200 transition">
                      <span className="text-sm font-bold text-slate-300">{d}</span>
                      <div className="mt-2 space-y-2">
                        {daily.map(t => (
                          <div key={t.id} className="text-[11px] p-2 bg-slate-50 border border-slate-100 rounded-xl">
                            <div className="font-bold text-indigo-700 mb-1">{groepen.find(g => g.id === t.groepId)?.naam || 'Groep'}</div>
                            <div className="flex items-center gap-1 text-slate-500"><User size={10}/> {coaches.find(c => c.id === t.coachId)?.naam}</div>
                            <div className="flex items-center gap-1 text-slate-500"><MapPin size={10}/> {locaties.find(l => l.id === t.locatieId)?.naam}</div>
                            <div className="mt-1 font-semibold text-slate-700">{t.uren}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
        ) : (
          /* --- BEHEER VIEW (DASHBOARD) --- */
          <div className="flex h-full">
            {/* Zijmenu */}
            <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4 mb-2">Instellingen</p>
              {Object.entries(sections).map(([key, sec]) => (
                <button
                  key={key}
                  onClick={() => setAdminSection(key)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${adminSection === key ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {sec.icon} {sec.title}
                </button>
              ))}
            </aside>

            {/* Hoofdpaneel */}
            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-800">{currentSection.title}</h2>
                  <p className="text-slate-500 mt-1">Beheer gegevens en tarieven voor {currentSection.title.toLowerCase()}.</p>
                </div>
                <button 
                  onClick={() => { setEditingItem(null); setShowAdminModal(true); }}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-800 transition font-bold"
                >
                  <Plus size={20}/> Nieuwe {currentSection.title.slice(0, -2)}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentSection.data.map(item => (
                  <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                        {currentSection.icon}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => { setEditingItem(item); setShowAdminModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"><Settings size={18}/></button>
                        <button onClick={() => deleteItem(currentSection.collection, item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={18}/></button>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-bold text-slate-800 mb-4">{item.naam}</h4>
                    
                    <div className="space-y-3 border-t border-slate-50 pt-4">
                      {currentSection.fields.filter(f => f.name !== 'naam').map(field => (
                        <div key={field.name} className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            {field.type === 'number' ? <Euro size={14}/> : <Info size={14}/>}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{field.label}</p>
                            <p className="text-slate-700 font-semibold">{field.type === 'number' ? `€ ${item[field.name]}` : item[field.name]}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADMIN EDIT/ADD */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-800">
                {editingItem ? 'Aanpassen' : 'Toevoegen'}
              </h2>
              <button onClick={() => setShowAdminModal(false)} className="p-2 hover:bg-white rounded-full shadow-sm border transition"><X /></button>
            </div>
            <form onSubmit={handleSaveAdminItem} className="p-8 space-y-6">
              {currentSection.fields.map(field => (
                <div key={field.name}>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                  <input 
                    name={field.name}
                    type={field.type} 
                    required 
                    defaultValue={editingItem ? editingItem[field.name] : ''}
                    placeholder={field.placeholder}
                    className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 ring-indigo-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium" 
                  />
                </div>
              ))}
              <div className="pt-4 flex gap-3">
                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  {editingItem ? 'Wijzigingen Opslaan' : 'Toevoegen aan Lijst'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRAINING TOEVOEGEN */}
      {showTrainingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">Training Inplannen</h2>
              <button onClick={() => setShowTrainingModal(false)}><X /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await addDoc(collection(db, "planning"), newTraining);
              setShowTrainingModal(false);
            }} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Datum</label>
                  <input type="date" required className="w-full mt-2 p-4 bg-slate-50 border rounded-2xl font-medium" 
                         onChange={e => setNewTraining({...newTraining, datum: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Groep</label>
                  <select required className="w-full mt-2 p-4 bg-slate-50 border rounded-2xl font-medium" 
                          onChange={e => setNewTraining({...newTraining, groepId: e.target.value})}>
                    <option value="">Kies groep...</option>
                    {groepen.map(g => <option key={g.id} value={g.id}>{g.naam}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Uren</label>
                  <input type="text" placeholder="14:00 - 16:00" className="w-full mt-2 p-4 bg-slate-50 border rounded-2xl font-medium" 
                         onChange={e => setNewTraining({...newTraining, uren: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Coach</label>
                  <select required className="w-full mt-2 p-4 bg-slate-50 border rounded-2xl font-medium" 
                          onChange={e => setNewTraining({...newTraining, coachId: e.target.value})}>
                    <option value="">Kies coach...</option>
                    {coaches.map(c => <option key={c.id} value={c.id}>{c.naam}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Locatie</label>
                  <select required className="w-full mt-2 p-4 bg-slate-50 border rounded-2xl font-medium" 
                          onChange={e => setNewTraining({...newTraining, locatieId: e.target.value})}>
                    <option value="">Kies locatie...</option>
                    {locaties.map(l => <option key={l.id} value={l.id}>{l.naam}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4">
                Bevestig Planning
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
