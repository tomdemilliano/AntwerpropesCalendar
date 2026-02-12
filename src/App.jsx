import React, { useState, useMemo, useEffect } from 'react';
import { db } from './firebase'; // Importeer je db config
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy 
} from 'firebase/firestore';
import { 
  Calendar, ChevronLeft, ChevronRight, Filter, MapPin, User, 
  Clock, Info, Search, CheckCircle, AlertCircle, Plus, Trash2, X 
} from 'lucide-react';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // States voor filters
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8, 1));
  const [filterGroup, setFilterGroup] = useState('Alle');
  const [filterCoach, setFilterCoach] = useState('Alle');
  const [searchTerm, setSearchTerm] = useState('');

  // State voor nieuw item
  const [newItem, setNewItem] = useState({
    dag: '', datum: '', waar: '', uren: '', groep: '', coach1: '', coach2: '', opmerking: '', status: ''
  });

  // 1. Haal data op uit Firebase
  useEffect(() => {
    const q = query(collection(db, "planning"), orderBy("datum", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ ...doc.data(), id: doc.id });
      });
      setData(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Toevoegen
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "planning"), newItem);
      setShowAddModal(false);
      setNewItem({ dag: '', datum: '', waar: '', uren: '', groep: '', coach1: '', coach2: '', opmerking: '', status: '' });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // 3. Data Verwijderen
  const handleDelete = async (id) => {
    if(window.confirm("Zeker dat je dit item wilt verwijderen?")) {
      await deleteDoc(doc(db, "planning", id));
    }
  };

  // Helpers voor filters (gebaseerd op live data)
  const getUnique = (arr, key) => [...new Set(arr.map(item => item[key]).filter(Boolean))].sort();
  const groups = useMemo(() => ['Alle', ...getUnique(data, 'groep')], [data]);
  const coaches = useMemo(() => {
    const all = data.flatMap(d => [d.coach1, d.coach2]).filter(Boolean);
    return ['Alle', ...new Set(all)].sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchMonth = new Date(item.datum).getMonth() === currentMonth.getMonth() && 
                         new Date(item.datum).getFullYear() === currentMonth.getFullYear();
      const matchGroup = filterGroup === 'Alle' || item.groep === filterGroup;
      const matchCoach = filterCoach === 'Alle' || [item.coach1, item.coach2].includes(filterCoach);
      const matchSearch = searchTerm === '' || Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
      return matchMonth && matchGroup && matchCoach && matchSearch;
    });
  }, [data, filterGroup, filterCoach, searchTerm, currentMonth]);

  const monthName = currentMonth.toLocaleString('nl-NL', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header met Add Button */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">Antwerp Ropes</h1>
            <p className="text-slate-500 italic">Live Planning Beheer</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md"
            >
              <Plus size={20} /> Nieuwe Training
            </button>
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-slate-100 rounded">
                <ChevronLeft size={20} />
              </button>
              <span className="font-semibold min-w-[120px] text-center capitalize">{monthName}</span>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-slate-100 rounded">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Filters (Hetzelfde als origineel) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <div className="relative">
             <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
             <select className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none" 
                     value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
               {groups.map(g => <option key={g} value={g}>{g}</option>)}
             </select>
           </div>
           <div className="relative">
             <User className="absolute left-3 top-3 text-slate-400" size={18} />
             <select className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none"
                     value={filterCoach} onChange={(e) => setFilterCoach(e.target.value)}>
               {coaches.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
           </div>
           <div className="relative">
             <Search className="absolute left-3 top-3 text-slate-400" size={18} />
             <input type="text" placeholder="Zoek..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <p className="text-center py-10 text-slate-400">Data laden uit Firebase...</p>
            ) : filteredData.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed text-center text-slate-400">
                Geen trainingen gevonden voor deze periode.
              </div>
            ) : (
              filteredData.map((item) => (
                <div key={item.id} className="group relative bg-white p-4 rounded-2xl shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition-all">
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase">{item.datum}</span>
                      <h3 className="text-lg font-bold text-slate-800">{item.groep || 'Event'}</h3>
                    </div>
                    {item.uren && <div className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-sm font-medium">{item.uren}</div>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><MapPin size={14} /> {item.waar}</div>
                    <div className="flex items-center gap-2"><User size={14} /> {item.coach1}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="bg-indigo-900 text-white p-6 rounded-3xl h-fit">
            <h3 className="font-bold mb-4">Database Info</h3>
            <div className="text-3xl font-bold">{data.length}</div>
            <p className="text-indigo-300 text-sm">Totaal aantal records in Cloud Firestore</p>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Nieuwe Training</h2>
              <button onClick={() => setShowAddModal(false)}><X /></button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <input type="date" required className="w-full p-2 border rounded-lg" 
                     onChange={e => setNewItem({...newItem, datum: e.target.value})} />
              <input type="text" placeholder="Groep (bijv. Mini's)" className="w-full p-2 border rounded-lg" 
                     onChange={e => setNewItem({...newItem, groep: e.target.value})} />
              <input type="text" placeholder="Locatie" className="w-full p-2 border rounded-lg" 
                     onChange={e => setNewItem({...newItem, waar: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Coach 1" className="w-full p-2 border rounded-lg" 
                       onChange={e => setNewItem({...newItem, coach1: e.target.value})} />
                <input type="text" placeholder="Uren (14-16u)" className="w-full p-2 border rounded-lg" 
                       onChange={e => setNewItem({...newItem, uren: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Opslaan in Firebase</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
