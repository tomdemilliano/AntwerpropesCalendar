import React, { useState, useRef, useMemo } from 'react';
// De Firebase imports zijn nu veel korter omdat de data-fetching in de hook zit
import { 
  addDoc, deleteDoc, doc, updateDoc, writeBatch, collection
} from 'firebase/firestore';
import { db } from './firebase'; // Nog nodig voor directe acties zoals add/delete
import { handleBulkSchedule, handleDeleteAllPlannedForSeason, handleDeleteVasteTraining } from './firebaseUtils';
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, MapPin, User, Users, Settings, 
  Calendar as CalendarIcon, X, LayoutGrid, Edit2, Clock, CalendarDays, Search, CalendarCheck, Filter, CheckCircle2, AlertTriangle, Building2, CalendarX, PlusCircle
} from 'lucide-react';

// Importeer de nieuwe hook
import { useAppData } from './hooks/useAppData';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AdminModal from './components/AdminModal';
import BulkScheduleModal from './components/BulkScheduleModal';
import TrainingModal from './components/TrainingModal';

const App = () => {
  // --- DATA HOOK ---
  const { 
    trainingen, groepen, coaches, locaties, seizoenen, 
    vasteTrainingen, beschikbareZalen, zaalUitzonderingen, loading 
  } = useAppData();

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('kalender'); 
  const [adminSection, setAdminSection] = useState('groepen');
  const [zaalTab, setZaalTab] = useState('weekplanning'); 
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showBulkScheduleModal, setShowBulkScheduleModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [newTraining, setNewTraining] = useState({
    groepId: '', coachIds: [], locatieId: '', datum: '', uren: ''
  });

  // --- FILTERS & ADMIN STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoachIds, setSelectedCoachIds] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [selectedVasteIds, setSelectedVasteIds] = useState([]);
  const [tempVasteTraining, setTempVasteTraining] = useState({ dag: '', startUur: '', eindUur: '' });
  const [uitzonderingType, setUitzonderingType] = useState('onbeschikbaar');

  // --- LOGIC: CURRENT SEASON ---
  const activeSeasonId = useMemo(() => {
    const now = new Date();
    const active = seizoenen.find(s => new Date(s.startDatum) <= now && new Date(s.eindDatum) >= now);
    return active ? active.id : (seizoenen[0]?.id || '');
  }, [seizoenen]);

  // --- HELPERS ---
  const formatDate = (date) => {
    return date.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getDayRange = (date) => {
    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(date);
    end.setHours(23,59,59,999);
    return { start, end };
  };

  const filteredTrainingen = useMemo(() => {
    const { start, end } = getDayRange(currentDate);
    return trainingen.filter(t => {
      const d = new Date(t.datum);
      return d >= start && d <= end;
    });
  }, [trainingen, currentDate]);

  const isIngepland = (vasteTr) => {
    const seizoen = seizoenen.find(s => s.id === (selectedSeasonId || activeSeasonId));
    if(!seizoen) return false;
    return trainingen.some(t => 
      t.groepId === vasteTr.groepId && 
      t.uren === `${vasteTr.startUur}-${vasteTr.eindUur}` &&
      t.datum >= seizoen.startDatum && t.datum <= seizoen.eindDatum
    );
  };

  // --- ACTIONS ---
  const handleAddTraining = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "planning"), newTraining);
      setShowTrainingModal(false);
      setNewTraining({ groepId: '', coachIds: [], locatieId: '', datum: '', uren: '' });
    } catch (e) { console.error(e); }
  };

  const handleDeleteTraining = async (id) => {
    if(window.confirm("Verwijderen?")) await deleteDoc(doc(db, "planning", id));
  };

  const handleSaveAdminItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    
    currentSection.fields.forEach(f => {
      if (f.isRow) {
        f.fields.forEach(sf => data[sf.name] = formData.get(sf.name));
      } else {
        if (f.type === 'multi-select') data[f.name] = selectedCoachIds;
        else if (f.type !== 'status') data[f.name] = formData.get(f.name);
      }
    });

    if (adminSection === 'vasteTrainingen') {
       const g = groepen.find(gr => gr.id === data.groepId);
       data.groepNaam = g ? g.naam : '';
    }

    if (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen') {
      data.type = uitzonderingType;
    }

    try {
      const colName = (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen') ? "zaalUitzonderingen" : adminSection;
      if (editingItem) {
        await updateDoc(doc(db, colName, editingItem.id), data);
      } else {
        await addDoc(collection(db, colName), data);
      }
      setShowAdminModal(false);
      setEditingItem(null);
      setSelectedCoachIds([]);
    } catch (e) { console.error(e); }
  };

  const handleDeleteAdminItem = async (id, item) => {
    if (adminSection === 'vasteTrainingen') {
      await handleDeleteVasteTraining(item, trainingen, isIngepland);
      return;
    }
    if(window.confirm("Verwijderen?")) {
      const colName = (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen') ? "zaalUitzonderingen" : adminSection;
      await deleteDoc(doc(db, colName, id));
    }
  };

  // --- CONFIG ---
  const sections = {
    groepen: { title: 'Groepen', icon: <Users size={18}/>, fields: [{name:'naam', label:'Naam', type:'text'}] },
    coaches: { title: 'Coaches', icon: <User size={18}/>, fields: [{name:'naam', label:'Naam', type:'text'}, {name:'kleur', label:'Kleur (Hex)', type:'color'}] },
    locaties: { title: 'Locaties', icon: <MapPin size={18}/>, fields: [{name:'naam', label:'Naam', type:'text'}] },
    seizoenen: { title: 'Seizoenen', icon: <CalendarDays size={18}/>, fields: [
      {name:'naam', label:'Naam', type:'text'},
      {isRow: true, fields: [{name:'startDatum', label:'Start Seizoen', type:'date'}, {name:'eindDatum', label:'Einde Seizoen', type:'date'}]},
      {isRow: true, fields: [{name:'startTrainingen', label:'Start Trainingen', type:'date'}, {name:'eindTrainingen', label:'Einde Trainingen', type:'date'}]}
    ]},
    vasteTrainingen: { title: 'Vaste Trainingen', icon: <Clock size={18}/>, fields: [
      {name:'groepId', label:'Groep', type:'select', options: groepen},
      {name:'coachIds', label:'Coaches', type:'multi-select', options: coaches},
      {name:'dag', label:'Dag', type:'select', options: [{id:'Maandag', naam:'Maandag'},{id:'Dinsdag', naam:'Dinsdag'},{id:'Woensdag', naam:'Woensdag'},{id:'Donderdag', naam:'Donderdag'},{id:'Vrijdag', naam:'Vrijdag'},{id:'Zaterdag', naam:'Zaterdag'},{id:'Zondag', naam:'Zondag'}]},
      {isRow: true, fields: [{name:'startUur', label:'Start', type:'text'}, {name:'eindUur', label:'Einde', type:'text'}]},
      {name: 'status', type: 'status'}
    ]},
    beschikbareZalen: { title: 'Zaalbezetting', icon: <Building2 size={18}/>, fields: [
      {name:'dag', label:'Dag', type:'select', options: [{id:'Maandag', naam:'Maandag'},{id:'Dinsdag', naam:'Dinsdag'},{id:'Woensdag', naam:'Woensdag'},{id:'Donderdag', naam:'Donderdag'},{id:'Vrijdag', naam:'Vrijdag'},{id:'Zaterdag', naam:'Zaterdag'},{id:'Zondag', naam:'Zondag'}]},
      {isRow: true, fields: [{name:'startUur', label:'Start', type:'text'}, {name:'eindUur', label:'Einde', type:'text'}]},
      {name:'omschrijving', label:'Omschrijving', type:'text'}
    ]}
  };

  const currentSection = sections[adminSection];

  // --- RENDER HELPERS ---
  const RenderInputField = (field) => {
    if (field.type === 'select') {
      return (
        <select name={field.name} defaultValue={editingItem?.[field.name] || ''} required className=\"w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500\">
          <option value=\"\">Selecteer...</option>
          {field.options?.map(o => <option key={o.id} value={o.id}>{o.naam}</option>)}
        </select>
      );
    }
    if (field.type === 'multi-select') {
      return (
        <div className=\"grid grid-cols-2 gap-2\">
          {field.options?.map(o => (
            <button key={o.id} type=\"button\" onClick={() => setSelectedCoachIds(prev => prev.includes(o.id) ? prev.filter(id => id !== o.id) : [...prev, o.id])}
              className={`p-2 rounded-lg text-xs font-bold border transition-all ${selectedCoachIds.includes(o.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
              {o.naam}
            </button>
          ))}
        </div>
      );
    }
    return <input name={field.name} type={field.type} defaultValue={editingItem?.[field.name] || ''} required className=\"w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500\" />;
  };

  if (loading) return (
    <div className=\"h-screen w-full flex items-center justify-center bg-slate-50\">
      <div className=\"flex flex-col items-center gap-4\">
        <div className=\"animate-spin text-indigo-600\"><Settings size={40} /></div>
        <p className=\"font-black text-slate-400 uppercase tracking-widest text-xs\">Laden...</p>
      </div>
    </div>
  );

  return (
    <div className=\"min-h-screen bg-slate-50 font-sans text-slate-900\">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className=\"max-w-7xl mx-auto p-8\">
        {activeTab === 'kalender' ? (
          <div className=\"space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700\">
            <div className=\"flex justify-between items-end\">
              <div className=\"space-y-1\">
                <p className=\"text-xs font-black text-indigo-600 uppercase tracking-[0.2em]\">Planning Overzicht</p>
                <h2 className=\"text-4xl font-black text-slate-800 flex items-center gap-4\">
                  {formatDate(currentDate)}
                  <div className=\"flex gap-1 ml-4\">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))} className=\"p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all shadow-sm\">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className=\"px-4 text-xs font-bold uppercase tracking-widest hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all\">Vandaag</button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))} className=\"p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all shadow-sm\">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </h2>
              </div>
              <button onClick={() => setShowTrainingModal(true)} className=\"bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all\">
                <Plus size={20} /> Training Toevoegen
              </button>
            </div>

            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
              {filteredTrainingen.length > 0 ? (
                filteredTrainingen.map(t => {
                  const groep = groepen.find(g => g.id === t.groepId);
                  const locatie = locaties.find(l => l.id === t.locatieId);
                  const coachNames = t.coachIds?.map(cid => coaches.find(c => c.id === cid)?.naam).join(', ');

                  return (
                    <div key={t.id} className=\"group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 relative overflow-hidden\">
                      <div className=\"flex justify-between items-start mb-6\">
                        <div className=\"flex items-center gap-3\">
                          <div className=\"bg-indigo-50 p-3 rounded-2xl text-indigo-600\"><Users size={20}/></div>
                          <div>
                            <h3 className=\"font-black text-slate-800 text-lg leading-tight\">{groep?.naam || 'Onbekende groep'}</h3>
                            <div className=\"flex items-center gap-1.5 text-indigo-500 mt-0.5\">
                              <Clock size={12} strokeWidth={3}/>
                              <span className=\"text-[10px] font-black uppercase tracking-wider\">{t.uren}</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteTraining(t.id)} className=\"opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all\">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className=\"space-y-3\">
                        <div className=\"flex items-center gap-3 text-slate-500\">
                          <div className=\"w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center\"><User size={14}/></div>
                          <span className=\"text-sm font-bold\">{coachNames || 'Geen coach'}</span>
                        </div>
                        <div className=\"flex items-center gap-3 text-slate-500\">
                          <div className=\"w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center\"><MapPin size={14}/></div>
                          <span className=\"text-sm font-bold\">{locatie?.naam || 'Geen locatie'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className=\"col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400 gap-4\">
                  <div className=\"p-6 bg-slate-50 rounded-full\"><CalendarX size={40} /></div>
                  <p className=\"font-black uppercase tracking-widest text-xs\">Geen trainingen voor deze dag</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className=\"bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex min-h-[70vh] animate-in fade-in zoom-in duration-500\">
            <Sidebar 
              sections={sections} 
              adminSection={adminSection} 
              setAdminSection={setAdminSection} 
              setSelectedCoachIds={setSelectedCoachIds} 
              setTempVasteTraining={setTempVasteTraining} 
            />

            <div className=\"flex-1 p-10\">
              <div className=\"flex justify-between items-center mb-10\">
                <div>
                  <h2 className=\"text-3xl font-black text-slate-800 mb-2\">{currentSection.title}</h2>
                  <p className=\"text-slate-400 text-sm font-medium\">Beheer de {currentSection.title.toLowerCase()} van het systeem</p>
                </div>
                <div className=\"flex gap-3\">
                  {adminSection === 'vasteTrainingen' && (
                    <button onClick={() => setShowBulkScheduleModal(true)} className=\"bg-indigo-50 text-indigo-600 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100\">
                      <CalendarCheck size={18} /> Inplannen
                    </button>
                  )}
                  <button onClick={() => { setEditingItem(null); setSelectedCoachIds([]); setShowAdminModal(true); }} className=\"bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition-all\">
                    <Plus size={18} /> Toevoegen
                  </button>
                </div>
              </div>

              {adminSection === 'beschikbareZalen' && (
                <div className=\"flex bg-slate-100 p-1.5 rounded-2xl w-fit mb-8 border border-slate-200/50\">
                  <button onClick={() => setZaalTab('weekplanning')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${zaalTab === 'weekplanning' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Wekelijks</button>
                  <button onClick={() => setZaalTab('uitzonderingen')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${zaalTab === 'uitzonderingen' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Uitzonderingen</button>
                </div>
              )}

              <div className=\"overflow-hidden rounded-2xl border border-slate-100\">
                <table className=\"w-full text-left\">
                  <thead className=\"bg-slate-50 border-b border-slate-100\">
                    <tr>
                      {currentSection.fields.map(f => !f.isRow ? (
                        <th key={f.name} className=\"px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]\">{f.label}</th>
                      ) : f.fields.map(sf => (
                        <th key={sf.name} className=\"px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]\">{sf.label}</th>
                      )))}
                      <th className=\"px-6 py-4\"></th>
                    </tr>
                  </thead>
                  <tbody className=\"divide-y divide-slate-50\">
                    {(adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' ? zaalUitzonderingen : (adminSection === 'beschikbareZalen' ? beschikbareZalen : eval(adminSection))).map(item => (
                      <tr key={item.id} className=\"hover:bg-slate-50/50 transition-colors group\">
                        {currentSection.fields.map(f => {
                          if (f.isRow) {
                            return f.fields.map(sf => <td key={sf.name} className=\"px-6 py-4 text-sm font-bold text-slate-600\">{item[sf.name]}</td>);
                          }
                          if (f.name === 'coachIds') {
                            return <td key={f.name} className=\"px-6 py-4\"><div className=\"flex -space-x-2\">{item[f.name]?.map(cid => <div key={cid} title={coaches.find(c=>c.id===cid)?.naam} className=\"w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm\" style={{backgroundColor: coaches.find(c=>c.id===cid)?.kleur || '#cbd5e1'}}>{coaches.find(c=>c.id===cid)?.naam?.charAt(0)}</div>)}</div></td>;
                          }
                          if (f.name === 'groepId') {
                            return <td key={f.name} className=\"px-6 py-4 text-sm font-bold text-slate-800\">{groepen.find(g => g.id === item[f.name])?.naam}</td>;
                          }
                          if (f.type === 'color') {
                            return <td key={f.name} className=\"px-6 py-4\"><div className=\"w-6 h-6 rounded-lg shadow-inner border border-white/20\" style={{backgroundColor: item[f.name]}} /></td>;
                          }
                          if (f.name === 'status') {
                            const scheduled = isIngepland(item);
                            return <td key={f.name} className=\"px-6 py-4\"><div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${scheduled ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{scheduled ? <CheckCircle2 size={12}/> : <Clock size={12}/>} {scheduled ? 'Ingepland' : 'Niet ingepland'}</div></td>;
                          }
                          return <td key={f.name} className=\"px-6 py-4 text-sm font-bold text-slate-600\">{item[f.name]}</td>;
                        })}
                        <td className=\"px-6 py-4 text-right\">
                          <div className=\"flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all\">
                            <button onClick={() => { setEditingItem(item); setSelectedCoachIds(item.coachIds || []); setShowAdminModal(true); }} className=\"p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all\"><Edit2 size={16}/></button>
                            <button onClick={() => handleDeleteAdminItem(item.id, item)} className=\"p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all\"><Trash2 size={16}/></button>
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

      <BulkScheduleModal 
        show={showBulkScheduleModal}
        onClose={() => setShowBulkScheduleModal(false)}
        onSubmit={(e) => {
          e.preventDefault();
          handleBulkSchedule(selectedSeasonId, activeSeasonId, selectedVasteIds, seizoenen, vasteTrainingen, trainingen);
          setShowBulkScheduleModal(false);
          setSelectedVasteIds([]);
        }}
        seizoenen={seizoenen}
        selectedSeasonId={selectedSeasonId}
        setSelectedSeasonId={setSelectedSeasonId}
        activeSeasonId={activeSeasonId}
        vasteTrainingen={vasteTrainingen}
        selectedVasteIds={selectedVasteIds}
        setSelectedVasteIds={setSelectedVasteIds}
      />

      <AdminModal 
        show={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title={editingItem ? 'Bewerken' : (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' ? (uitzonderingType === 'extra' ? 'Extra reservatie toevoegen' : 'Zaal onbeschikbaar toevoegen') : 'Nieuw Item')}
        onSubmit={handleSaveAdminItem}
        editingItem={editingItem}
        fields={currentSection.fields}
        renderInputField={RenderInputField}
        handleDeleteAllPlanned={handleDeleteAllPlannedForSeason}
        adminSection={adminSection}
      />

      <TrainingModal 
        show={showTrainingModal}
        onClose={() => setShowTrainingModal(false)}
        onSubmit={handleAddTraining}
        newTraining={newTraining}
        setNewTraining={setNewTraining}
        groepen={groepen}
        coaches={coaches}
        locaties={locaties}
      />
    </div>
  );
};

export default App;
