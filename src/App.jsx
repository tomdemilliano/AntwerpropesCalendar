import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from './firebase';
import { 
  collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy, updateDoc
} from 'firebase/firestore';
import { handleBulkSchedule, handleDeleteAllPlannedForSeason, handleDeleteVasteTraining } from './firebaseUtils';
import { ChevronLeft, ChevronRight, Plus, X, Search } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AdminModal from './components/AdminModal';
import BulkScheduleModal from './components/BulkScheduleModal';
import TrainingModal from './components/TrainingModal';
import AdminTable from './components/AdminTable';
import { getSectionsConfig } from './adminConfig'; // Import de nieuwe config

const App = () => {
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('kalender'); 
  const [adminSection, setAdminSection] = useState('groepen');
  const [zaalTab, setZaalTab] = useState('weekplanning'); 
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showBulkScheduleModal, setShowBulkScheduleModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newTraining, setNewTraining] = useState({ datum: '', groepId: '', coachId: '', uren: '', locatieId: '' });
  const [uitzonderingType, setUitzonderingType] = useState('onbeschikbaar');
  const [activeSeasonId, setActiveSeasonId] = useState('');
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [selectedVasteIds, setSelectedVasteIds] = useState([]);
  const [coachSearch, setCoachSearch] = useState('');
  const [selectedCoachIds, setSelectedCoachIds] = useState([]);
  const [isCoachDropdownOpen, setIsCoachDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [tempVasteTraining, setTempVasteTraining] = useState({ dag: '', startUur: '', eindUur: '' });

  // --- DATA STATE ---
  const [trainingen, setTrainingen] = useState([]);
  const [groepen, setGroepen] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [locaties, setLocaties] = useState([]);
  const [seizoenen, setSeizoenen] = useState([]);
  const [vasteTrainingen, setVasteTrainingen] = useState([]);
  const [beschikbareZalen, setBeschikbareZalen] = useState([]);
  const [zaalUitzonderingen, setZaalUitzonderingen] = useState([]);

  // --- FIREBASE FETCHING (Ongewijzigd) ---
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
    const unsubSeizoenen = onSnapshot(query(collection(db, "seizoenen"), orderBy("startDatum", "desc")), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSeizoenen(data);
      const today = new Date().toISOString().split('T')[0];
      const huidigSeizoen = data.find(s => today >= s.startDatum && today <= s.eindDatum);
      if (huidigSeizoen && !activeSeasonId) setActiveSeasonId(huidigSeizoen.id);
      else if (data.length > 0 && !activeSeasonId) setActiveSeasonId(data[0].id);
    });
    const unsubVasteTrainingen = onSnapshot(collection(db, "vasteTrainingen"), (snapshot) => {
      setVasteTrainingen(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubBeschikbareZalen = onSnapshot(collection(db, "beschikbareZalen"), (snapshot) => {
      setBeschikbareZalen(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubUitzonderingen = onSnapshot(collection(db, "zaalUitzonderingen"), (snapshot) => {
      setZaalUitzonderingen(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { 
      unsubTrainingen(); unsubGroepen(); unsubCoaches(); 
      unsubLocaties(); unsubSeizoenen(); unsubVasteTrainingen(); unsubBeschikbareZalen(); unsubUitzonderingen();
    };
  }, [activeSeasonId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsCoachDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- MEMOIZED DATA ---
  const filteredGroepen = useMemo(() => {
    const actueelSeizoen = seizoenen.find(s => s.id === activeSeasonId);
    if (!actueelSeizoen) return [];
    return groepen.filter(g => g.seizoen === actueelSeizoen.naam || g.seizoenId === actueelSeizoen.id);
  }, [groepen, seizoenen, activeSeasonId]);

  const filteredVasteTrainingen = useMemo(() => {
    const groepIdsInSeizoen = filteredGroepen.map(g => g.id);
    return vasteTrainingen.filter(v => groepIdsInSeizoen.includes(v.groepId));
  }, [vasteTrainingen, filteredGroepen]);

  const filteredBeschikbareZalen = useMemo(() => {
    return beschikbareZalen.filter(z => z.seizoenId === activeSeasonId);
  }, [beschikbareZalen, activeSeasonId]);

  const filteredUitzonderingen = useMemo(() => {
    return zaalUitzonderingen.filter(u => u.seizoenId === activeSeasonId);
  }, [zaalUitzonderingen, activeSeasonId]);

  // --- DYNAMIC SECTIONS CONFIG ---
  const sections = getSectionsConfig(
    filteredGroepen, coaches, locaties, filteredBeschikbareZalen, 
    filteredUitzonderingen, seizoenen, filteredVasteTrainingen, zaalTab, uitzonderingType
  );
  const currentSection = sections[adminSection];

  // --- LOGIC (De rest van de functies zoals handleSaveAdminItem blijft hier) ---
  const getBeschikbareLocatieOpties = () => {
    const { dag, startUur, eindUur } = tempVasteTraining;
    if (!dag || !startUur || !eindUur) return [];
    return filteredBeschikbareZalen
      .filter(zaal => zaal.dag === dag && zaal.startUur <= startUur && zaal.eindUur >= eindUur)
      .map(zaal => ({ 
        value: zaal.locatieId, 
        label: `${locaties.find(l => l.id === zaal.locatieId)?.naam || 'Onbekend'} (${zaal.zaaldelen})` 
      }));
  };

  const handleAddTraining = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "planning"), newTraining);
      setShowTrainingModal(false);
      setNewTraining({ datum: '', groepId: '', coachId: '', uren: '', locatieId: '' });
    } catch (error) { alert("Er is een fout opgetreden."); }
  };

  const handleSaveAdminItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const currentColl = currentSection.collection;
    
    if (currentColl === 'vasteTrainingen' || currentColl === 'groepen') data.coachIds = selectedCoachIds;
    if (currentColl === 'groepen') {
        const actueelSeizoen = seizoenen.find(s => s.id === activeSeasonId);
        data.seizoen = actueelSeizoen?.naam || '';
    }
    if (['vasteTrainingen', 'groepen', 'beschikbareZalen', 'zaalUitzonderingen'].includes(currentColl)) {
        data.seizoenId = activeSeasonId;
    }
    if (currentColl === 'zaalUitzonderingen' && !editingItem) data.type = uitzonderingType;

    if (editingItem) await updateDoc(doc(db, currentColl, editingItem.id), data);
    else await addDoc(collection(db, currentColl), data);
    
    setShowAdminModal(false);
    setEditingItem(null);
    setSelectedCoachIds([]);
    setTempVasteTraining({ dag: '', startUur: '', eindUur: '' });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    if (adminSection === 'vasteTrainingen' || adminSection === 'groepen') setSelectedCoachIds(item.coachIds || []);
    if (adminSection === 'vasteTrainingen') setTempVasteTraining({ dag: item.dag || '', startUur: item.startUur || '', eindUur: item.eindUur || '' });
    if (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen') setUitzonderingType(item.type || 'onbeschikbaar');
    setShowAdminModal(true);
  };

  const toggleCoach = (id) => {
    setSelectedCoachIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    setCoachSearch('');
  };

  // --- RENDER HELPERS ---
  const RenderInputField = (field) => {
    if (field.type === 'tag-input') {
      return (
        <div className="mt-1" ref={dropdownRef}>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCoachIds.map(id => {
              const coach = coaches.find(c => c.id === id);
              return (
                <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                  {coach?.voornaam} {coach?.achternaam}
                  <button type="button" onClick={() => toggleCoach(id)} className="hover:text-indigo-900"><X size={12}/></button>
                </span>
              );
            })}
          </div>
          <div className="relative">
            <input type="text" placeholder="Zoek coach..." value={coachSearch} onFocus={() => setIsCoachDropdownOpen(true)} onChange={(e) => setCoachSearch(e.target.value)} className="w-full p-3 pl-10 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-indigo-50 outline-none text-sm" />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
          </div>
          {isCoachDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-40 overflow-y-auto">
              {coaches.filter(c => !selectedCoachIds.includes(c.id)).filter(c => `${c.voornaam} ${c.achternaam}`.toLowerCase().includes(coachSearch.toLowerCase())).map(c => (
                <button key={c.id} type="button" onClick={() => toggleCoach(c.id)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0">{c.voornaam} {c.achternaam}</button>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (field.type === 'select') {
      let options = field.options;
      if (adminSection === 'vasteTrainingen' && field.name === 'locatieId') options = getBeschikbareLocatieOpties();

      return (
        <select name={field.name} required={field.name !== 'reden'} defaultValue={editingItem ? editingItem[field.name] : ''} className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-indigo-50 outline-none text-sm"
          onChange={(e) => {
            if (adminSection === 'vasteTrainingen' && field.name === 'groepId') {
              const gObj = groepen.find(g => g.id === e.target.value);
              if (gObj?.coachIds) setSelectedCoachIds(gObj.coachIds);
            }
            if (adminSection === 'vasteTrainingen' && field.name === 'dag') setTempVasteTraining(prev => ({ ...prev, dag: e.target.value }));
          }}
        >
          <option value="">{options.length === 0 && adminSection === 'vasteTrainingen' && field.name === 'locatieId' ? 'Geen zaal beschikbaar...' : 'Kies...'}</option>
          {options.map(opt => <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>{typeof opt === 'string' ? opt : opt.label}</option>)}
        </select>
      );
    }

    return (
      <input name={field.name} type={field.type} required={field.name !== 'reden'} defaultValue={editingItem ? editingItem[field.name] : ''} placeholder={field.placeholder} className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-indigo-50 outline-none text-sm font-medium" 
        onChange={(e) => { if (adminSection === 'vasteTrainingen' && ['dag', 'startUur', 'eindUur'].includes(field.name)) setTempVasteTraining(prev => ({ ...prev, [field.name]: e.target.value })); }}
      />
    );
  };

  // --- CALENDAR LOGIC ---
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const dayLabels = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        {activeTab === 'kalender' ? (
          <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-6 bg-white px-5 py-2 rounded-xl shadow-sm border border-slate-200">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}><ChevronLeft size={20}/></button>
                  <h2 className="text-lg font-bold min-w-[150px] text-center capitalize">{currentDate.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}</h2>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}><ChevronRight size={20}/></button>
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
          <div className="flex h-full bg-white">
            <Sidebar sections={sections} adminSection={adminSection} setAdminSection={setAdminSection} setSelectedCoachIds={setSelectedCoachIds} setTempVasteTraining={setTempVasteTraining} />
            <AdminTable 
              adminSection={adminSection}
              currentSection={currentSection}
              activeSeasonId={activeSeasonId}
              setActiveSeasonId={setActiveSeasonId}
              seizoenen={seizoenen}
              zaalTab={zaalTab}
              setZaalTab={setZaalTab}
              setEditingItem={setEditingItem}
              setUitzonderingType={setUitzonderingType}
              setShowAdminModal={setShowAdminModal}
              setShowBulkScheduleModal={setShowBulkScheduleModal}
              setSelectedCoachIds={setSelectedCoachIds}
              setTempVasteTraining={setTempVasteTraining}
              openEditModal={openEditModal}
              handleDeleteVasteTraining={handleDeleteVasteTraining}
              trainingen={trainingen}
              groepen={groepen}
              coaches={coaches}
              locaties={locaties}
              beschikbareZalen={beschikbareZalen}
              db={db}
              deleteDoc={deleteDoc}
              doc={doc}
            />
          </div>
        )}
      </main>

      {/* Modals blijven identiek... */}
      <BulkScheduleModal 
        show={showBulkScheduleModal} onClose={() => setShowBulkScheduleModal(false)}
        onSubmit={async (e) => { e.preventDefault(); await handleBulkSchedule(selectedSeasonId, activeSeasonId, selectedVasteIds, seizoenen, vasteTrainingen, trainingen); setShowBulkScheduleModal(false); setSelectedVasteIds([]); }}
        seizoenen={seizoenen} selectedSeasonId={selectedSeasonId} setSelectedSeasonId={setSelectedSeasonId} activeSeasonId={activeSeasonId} vasteTrainingen={vasteTrainingen} selectedVasteIds={selectedVasteIds} setSelectedVasteIds={setSelectedVasteIds}
      />
      <AdminModal 
        show={showAdminModal} onClose={() => setShowAdminModal(false)}
        title={editingItem ? 'Bewerken' : (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' ? (uitzonderingType === 'extra' ? 'Extra reservatie' : 'Zaal onbeschikbaar') : 'Nieuw Item')}
        onSubmit={handleSaveAdminItem} editingItem={editingItem} fields={currentSection.fields} renderInputField={RenderInputField} handleDeleteAllPlanned={handleDeleteAllPlannedForSeason} adminSection={adminSection}
      />
      <TrainingModal 
        show={showTrainingModal} onClose={() => setShowTrainingModal(false)} onSubmit={handleAddTraining}
        newTraining={newTraining} setNewTraining={setNewTraining} groepen={groepen} coaches={coaches} locaties={locaties}
      />
    </div>
  );
};

export default App;
