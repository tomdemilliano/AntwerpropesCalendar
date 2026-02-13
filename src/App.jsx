import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy, updateDoc 
} from 'firebase/firestore';
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, MapPin, User, Users, Settings, 
  Calendar as CalendarIcon, X, LayoutGrid, Euro, Info, Edit2, Tag
} from 'lucide-react';

const App = () => {
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('kalender'); 
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

  // 2. Beheer Configuratie met Uitgebreide Velden
  const sections = {
    groepen: {
      title: 'Trainingsgroepen',
      collection: 'groepen',
      icon: <Users size={18} />,
      data: groepen,
      fields: [
        { name: 'naam', label: 'Naam Groep', type: 'text', placeholder: 'bv. Selectie A' },
        { name: 'type', label: 'Type', type: 'select', options: ['Recrea', 'Volwassenen', 'Competitie'] },
        { name: 'aantalSpringers', label: 'Springers', type: 'number', placeholder: '0' },
        { name: 'seizoen', label: 'Seizoen', type: 'text', placeholder: '2025-2026' }
      ]
    },
    coaches: {
      title: 'Coaches',
      collection: 'coaches',
      icon: <User size={18} />,
      data: coaches,
      fields: [
        { name: 'voornaam', label: 'Voornaam', type: 'text', placeholder: 'Jan' },
        { name: 'achternaam', label: 'Achternaam', type: 'text', placeholder: 'Janssen' },
        { name: 'uurtarief', label: 'Uurtarief (€)', type: 'number', placeholder: '0.00' }
      ]
    },
    locaties: {
      title: 'Locaties',
      collection: 'locaties',
      icon: <MapPin size={18} />,
      data: locaties,
      fields: [
        { name: 'naam', label: 'Naam Locatie', type: 'text', placeholder: 'bv. Sporthal De Dreef' },
        { name: 'straat', label: 'Straat', type: 'text' },
        { name: 'huisnummer', label: 'Nr.', type: 'text' },
        { name: 'gemeente', label: 'Gemeente', type: 'text' },
        { name: 'uurtarief', label: 'Huur/uur (€)', type: 'number', placeholder: '0.00' }
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
    if (window.confirm("Verwijderen bevestigen?")) {
      await deleteDoc(doc(db, col, id));
    }
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // --- KALENDER LOGICA (ONGEMOEID) ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const dayLabels = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* HEADER NAV */}
      <nav className="bg-white border-b border-slate-200 px-8 py-3 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <CalendarIcon size={20} />
          </div>
          <h1 className="text-lg font-black tracking-tighter">TRAINING<span className="text-indigo-600">PLAN</span></h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button onClick={() => setActiveTab('kalender')} className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'kalender' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500'}`}><LayoutGrid size={16}/> Kalender</button>
          <button onClick={() => setActiveTab('beheer')} className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'beheer' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500'}`}><Settings size={16}/> Beheer</button>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'kalender' ? (
          /* --- KALENDER VIEW (ONGEMOEID) --- */
          <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-6 bg-white px-5 py-2 rounded-xl shadow-sm border border-slate-200">
                  <button onClick={() => changeMonth(-1)}><ChevronLeft size={20}/></button>
                  <h2 className="text-lg font-bold min-w-[150px] text-center capitalize">{currentDate.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}</h2>
                  <button onClick={() => changeMonth(1)}><ChevronRight size={20}/></button>
                </div>
                <button onClick={() => setShowTrainingModal(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold shadow-sm"><Plus size={18}/> Inplannen</button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {dayLabels.map(label => <div key={label} className="text-center text-[10px] font-bold text-slate-400 uppercase">{label}</div>)}
                {[...Array(firstDayOfMonth)].map((_, i) => <div key={`e-${i}`} />)}
                {[...Array(daysInMonth)].map((_, i) => {
                  const d = i + 1;
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const daily = trainingen.filter(t => t.datum === dateStr);
                  return (
                    <div key={d} className="bg-white border border-slate-200 rounded-xl p-2 min-h-[110px] shadow-sm">
                      <span className="text-xs font-bold text-slate-300">{d}</span>
                      <div className="mt-1 space-y-1">
                        {daily.map(t => (
                          <div key={t.id} className="text-[9px] p-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                            <div className="font-bold text-indigo-700">{groepen.find(g => g.id === t.groepId)?.naam}</div>
                            <div className="text-slate-500 truncate">{t.uren}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
        ) : (
          /* --- NIEUWE COMPACTE BEHEER VIEW --- */
          <div className="flex h-full bg-white">
            <aside className="w-64 border-r border-slate-100 p-4 flex flex-col gap-1 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-4">Database</p>
              {Object.entries(sections).map(([key, sec]) => (
                <button key={key} onClick={() => setAdminSection(key)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${adminSection === key ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
                  {sec.icon} {sec.title}
                </button>
              ))}
            </aside>

            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">{currentSection.title}</h2>
                <button onClick={() => { setEditingItem(null); setShowAdminModal(true); }} className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-600 transition text-sm font-bold">
                  <Plus size={16}/> Toevoegen
                </button>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {currentSection.fields.map(f => <th key={f.name} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.label}</th>)}
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentSection.data.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        {currentSection.fields.map(f => (
                          <td key={f.name} className="px-4 py-3 text-sm text-slate-600 font-medium">
                            {f.type === 'number' ? `€ ${item[f.name]}` : item[f.name]}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => { setEditingItem(item); setShowAdminModal(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit2 size={14}/></button>
                            <button onClick={() => deleteItem(currentSection.collection, item.id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADMIN EDIT/ADD */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800">{editingItem ? 'Bewerken' : 'Nieuw Item'}</h2>
              <button onClick={() => setShowAdminModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveAdminItem} className="p-6 space-y-4">
              {currentSection.fields.map(field => (
                <div key={field.name}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                  {field.type === 'select' ? (
                    <select name={field.name} required defaultValue={editingItem ? editingItem[field.name] : ''} className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-indigo-50 focus:border-indigo-500 outline-none transition text-sm">
                      <option value="">Kies type...</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input name={field.name} type={field.type} required defaultValue={editingItem ? editingItem[field.name] : ''} placeholder={field.placeholder} className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-indigo-50 focus:border-indigo-500 outline-none transition text-sm font-medium" />
                  )}
                </div>
              ))}
              <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4">
                {editingItem ? 'Wijzigingen Opslaan' : 'Toevoegen aan Lijst'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRAINING TOEVOEGEN (ONGEMOEID) */}
      {showTrainingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-black">Planning</h2><button onClick={() => setShowTrainingModal(false)}><X /></button></div>
            <form onSubmit={async (e) => { e.preventDefault(); await addDoc(collection(db, "planning"), newTraining); setShowTrainingModal(false); }} className="p-6 space-y-4">
              <input type="date" required className="w-full p-3 bg-slate-50 border rounded-xl" onChange={e => setNewTraining({...newTraining, datum: e.target.value})} />
              <select required className="w-full p-3 bg-slate-50 border rounded-xl" onChange={e => setNewTraining({...newTraining, groepId: e.target.value})}>
                <option value="">Kies groep...</option>
                {groepen.map(g => <option key={g.id} value={g.id}>{g.naam}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <select required className="w-full p-3 bg-slate-50 border rounded-xl" onChange={e => setNewTraining({...newTraining, coachId: e.target.value})}>
                  <option value="">Coach...</option>
                  {coaches.map(c => <option key={c.id} value={c.id}>{c.voornaam} {c.achternaam}</option>)}
                </select>
                <input type="text" placeholder="bv. 14u-16u" className="w-full p-3 bg-slate-50 border rounded-xl" onChange={e => setNewTraining({...newTraining, uren: e.target.value})} />
              </div>
              <select required className="w-full p-3 bg-slate-50 border rounded-xl" onChange={e => setNewTraining({...newTraining, locatieId: e.target.value})}>
                <option value="">Locatie...</option>
                {locaties.map(l => <option key={l.id} value={l.id}>{l.naam}</option>)}
              </select>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100">Opslaan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
