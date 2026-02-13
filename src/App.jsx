import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { 
  collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy 
} from 'firebase/firestore';
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, MapPin, User, Users, Settings, Calendar as CalendarIcon, X 
} from 'lucide-react';

const App = () => {
  // Tabs & UI State
  const [activeTab, setActiveTab] = useState('kalender'); // 'kalender' of 'beheer'
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data States
  const [trainingen, setTrainingen] = useState([]);
  const [groepen, setGroepen] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [locaties, setLocaties] = useState([]);

  // Form State
  const [newTraining, setNewTraining] = useState({ datum: '', groepId: '', coachId: '', locatieId: '', uren: '' });
  const [newItemName, setNewItemName] = useState('');

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

  // 2. Kalender Logica
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const dayLabels = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // 3. Acties
  const handleAddTraining = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "planning"), newTraining);
    setShowAddModal(false);
    setNewTraining({ datum: '', groepId: '', coachId: '', locatieId: '', uren: '' });
  };

  const handleAddManagedItem = async (col) => {
    if (!newItemName) return;
    await addDoc(collection(db, col), { naam: newItemName });
    setNewItemName('');
  };

  const deleteItem = async (col, id) => {
    if (window.confirm("Zeker weten?")) await deleteDoc(doc(db, col, id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigatie Balk */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <CalendarIcon /> Training Planner
        </h1>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('kalender')}
            className={`px-4 py-2 rounded-md transition ${activeTab === 'kalender' ? 'bg-white shadow text-indigo-600 font-semibold' : 'text-slate-500'}`}
          >
            Kalender
          </button>
          <button 
            onClick={() => setActiveTab('beheer')}
            className={`px-4 py-2 rounded-md transition ${activeTab === 'beheer' ? 'bg-white shadow text-indigo-600 font-semibold' : 'text-slate-500'}`}
          >
            Beheer
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-6xl mx-auto">
        {activeTab === 'kalender' ? (
          /* KALENDER VIEW */
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white rounded-full border shadow-sm"><ChevronLeft size={20}/></button>
                <h2 className="text-2xl font-bold min-w-[200px] text-center capitalize">
                  {currentDate.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white rounded-full border shadow-sm"><ChevronRight size={20}/></button>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
              >
                <Plus size={20}/> Training Toevoegen
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {dayLabels.map(label => (
                <div key={label} className="bg-slate-50 p-2 text-center text-xs font-bold text-slate-500 uppercase">{label}</div>
              ))}
              {[...Array(firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[120px]" />)}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const trainingsVandaag = trainingen.filter(t => t.datum === dateString);

                return (
                  <div key={day} className="bg-white min-h-[120px] p-2 border-t border-l border-slate-100 hover:bg-slate-50 transition">
                    <span className="text-sm font-medium text-slate-400">{day}</span>
                    <div className="mt-1 space-y-1">
                      {trainingsVandaag.map(t => (
                        <div key={t.id} className="text-[10px] p-1.5 bg-indigo-50 border border-indigo-100 rounded text-indigo-700 leading-tight">
                          <div className="font-bold">{groepen.find(g => g.id === t.groepId)?.naam || 'Onbekend'}</div>
                          <div>{t.uren}</div>
                          <div className="flex justify-between mt-1 items-center">
                             <span>{locaties.find(l => l.id === t.locatieId)?.naam}</span>
                             <button onClick={() => deleteItem('planning', t.id)} className="text-red-400 hover:text-red-600"><Trash2 size={10}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          /* BEHEER VIEW */
          <section className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Groepen', col: 'groepen', data: groepen, icon: <Users size={18}/> },
              { title: 'Coaches', col: 'coaches', data: coaches, icon: <User size={18}/> },
              { title: 'Locaties', col: 'locaties', data: locaties, icon: <MapPin size={18}/> }
            ].map((sectie) => (
              <div key={sectie.title} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4 font-bold text-slate-700">
                  {sectie.icon} {sectie.title}
                </div>
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="Nieuwe..." 
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 ring-indigo-100 outline-none"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                  <button onClick={() => handleAddManagedItem(sectie.col)} className="bg-slate-800 text-white p-2 rounded-lg"><Plus size={18}/></button>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {sectie.data.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm group">
                      {item.naam}
                      <button onClick={() => deleteItem(sectie.col, item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* MODAL: Nieuwe Training */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Training Inplannen</h2>
              <button onClick={() => setShowAddModal(false)}><X /></button>
            </div>
            <form onSubmit={handleAddTraining} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Datum</label>
                <input type="date" required className="w-full mt-1 p-2.5 border rounded-xl" 
                       onChange={e => setNewTraining({...newTraining, datum: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Groep</label>
                <select required className="w-full mt-1 p-2.5 border rounded-xl bg-white" 
                        onChange={e => setNewTraining({...newTraining, groepId: e.target.value})}>
                  <option value="">Kies een groep...</option>
                  {groepen.map(g => <option key={g.id} value={g.id}>{g.naam}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Coach</label>
                  <select required className="w-full mt-1 p-2.5 border rounded-xl bg-white" 
                          onChange={e => setNewTraining({...newTraining, coachId: e.target.value})}>
                    <option value="">Kies coach...</option>
                    {coaches.map(c => <option key={c.id} value={c.id}>{c.naam}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Uren</label>
                  <input type="text" placeholder="bv. 14:00 - 16:00" className="w-full mt-1 p-2.5 border rounded-xl" 
                         onChange={e => setNewTraining({...newTraining, uren: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Locatie</label>
                <select required className="w-full mt-1 p-2.5 border rounded-xl bg-white" 
                        onChange={e => setNewTraining({...newTraining, locatieId: e.target.value})}>
                  <option value="">Kies locatie...</option>
                  {locaties.map(l => <option key={l.id} value={l.id}>{l.naam}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">
                Opslaan in Planning
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
