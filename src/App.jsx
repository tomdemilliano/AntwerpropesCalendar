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
import SeizoenModal from './components/SeizoenModal';
import CoachModal from './components/CoachModal';
import LocatieModal from './components/LocatieModal';
import BulkScheduleModal from './components/BulkScheduleModal';
import TrainingModal from './components/TrainingModal';
import AdminTable from './components/AdminTable';
import GroepenTable from '.components/GroepenTable';
import { getSectionsConfig } from './adminConfig';

const checkOverlap = (start1, eind1, start2, eind2) => {
  // Returnt true als de tijden elkaar overlappen
  return start1 < eind2 && start2 < eind1;
};

const App = () => {
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('kalender'); 
  const [adminSection, setAdminSection] = useState('groepen');
  const [zaalTab, setZaalTab] = useState('weekplanning'); 
  const [vasteTab, setVasteTab] = useState('vaste-planning'); // Nieuwe tab voor wekelijkse planning
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showBulkScheduleModal, setShowBulkScheduleModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
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
  const [afwijkingen, setAfwijkingen] = useState([]); // Nieuwe collectie

  // --- vaste array voor weekdagen ---
  const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

  // --- FIREBASE FETCHING ---
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
    const unsubAfwijkingen = onSnapshot(collection(db, "afwijkingen"), (snapshot) => {
      setAfwijkingen(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { 
      unsubTrainingen(); unsubGroepen(); unsubCoaches(); unsubLocaties(); 
      unsubSeizoenen(); unsubVasteTrainingen(); unsubBeschikbareZalen(); 
      unsubUitzonderingen(); unsubAfwijkingen();
    };
  }, [activeSeasonId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsCoachDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

// automatisch triggeren van selectie geplande zaal bij modal 'onbeschikbare' zaal
  useEffect(() => {
    // Enkel uitvoeren in de juiste context: zaalplanning -> uitzonderingen -> type onbeschikbaar
    if (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' && uitzonderingType === 'onbeschikbaar' && tempVasteTraining.datum) {
      const dagNaam = days[new Date(tempVasteTraining.datum).getDay()];
      const relevanteZalen = filteredBeschikbareZalen.filter(z => z.dag === dagNaam);

      if (relevanteZalen.length === 1) {
        const zaal = relevanteZalen[0];
      
        // Kleine vertraging om te zorgen dat de modal/formulier gerenderd is
        setTimeout(() => {
          const form = document.querySelector('form');
          if (form && form.weekplanningId) {
            form.weekplanningId.value = zaal.id;
            // Trigger handmatig de invulling
            form.startUur.value = zaal.startUur;
            form.eindUur.value = zaal.eindUur;
            form.locatieId.value = zaal.locatieId;
            form.zaaldelen.value = zaal.zaaldelen;
            form.huurprijs.value = zaal.huurprijs;
          
            setTempVasteTraining(prev => ({
              ...prev,
              weekplanningId: zaal.id,
              startUur: zaal.startUur,
              eindUur: zaal.eindUur,
              locatieId: zaal.locatieId,
              zaaldelen: zaal.zaaldelen,
              huurprijs: zaal.huurprijs
            }));
          }
        }, 100);
      }
    }
  }, [tempVasteTraining.datum]);
  
useEffect(() => {
  // Controleer of we in de juiste sectie zitten en of er een datum is
  if (adminSection === 'afwijkingen' && tempVasteTraining.datum) {
    
    // Gebruik een lokale array voor dagen (zodat je niet afhankelijk bent van externe bestanden)
    const lokaleDagen = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    const datumObj = new Date(tempVasteTraining.datum);
    const dagNaam = lokaleDagen[datumObj.getDay()];

    // Filter de lijst. Gebruik de 'vasteTrainingen' state direct.
    const relevante = vasteTrainingen.filter(v => v.dag === dagNaam);

    // Belangrijk: check of er exact 1 resultaat is EN of deze nog niet geselecteerd is
    // Dit voorkomt de "before initialization" en "infinite loop" errors
    if (relevante.length === 1 && tempVasteTraining.vastId !== relevante[0].id) {
      setTempVasteTraining(prev => ({
        ...prev,
        vasteId: relevante[0].id
      }));
    }
  }
}, [tempVasteTraining.datum, adminSection, vasteTrainingen]); 
// Let op: we luisteren naar .datum, niet naar het hele tempVasteTraining object!
  
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

  const filteredAfwijkingen = useMemo(() => {
    return afwijkingen.filter(a => a.seizoenId === activeSeasonId);
  }, [afwijkingen, activeSeasonId]);

  const filteredBeschikbareZalen = useMemo(() => {
    return beschikbareZalen.filter(z => z.seizoenId === activeSeasonId);
  }, [beschikbareZalen, activeSeasonId]);

  const filteredUitzonderingen = useMemo(() => {
    return zaalUitzonderingen.filter(u => u.seizoenId === activeSeasonId);
  }, [zaalUitzonderingen, activeSeasonId]);

  // --- DYNAMIC SECTIONS CONFIG ---
  const sections = getSectionsConfig(
    filteredGroepen, coaches, locaties, filteredBeschikbareZalen, 
    filteredUitzonderingen, seizoenen, filteredVasteTrainingen, zaalTab, uitzonderingType,
    filteredAfwijkingen, vasteTab, tempVasteTraining// Extra parameters doorsturen
  );
  const currentSection = sections[adminSection];

  // --- LOGIC ---
  const getBeschikbareLocatieOpties = (contextItem = null) => {
    const { dag, startUur, eindUur, datum } = tempVasteTraining;
    
    // Voor afwijkingen bepalen we de dag op basis van de datum
    let effectiveDag = dag;
    if (datum && !dag) {
      const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
      effectiveDag = days[new Date(datum).getDay()];
    }

    if (!effectiveDag || !startUur || !eindUur) return [];

    // 1. Basis: Zalen uit vaste weekplanning
    let opties = filteredBeschikbareZalen
      .filter(zaal => zaal.dag === effectiveDag && zaal.startUur <= startUur && zaal.eindUur >= eindUur)
      .map(zaal => ({ 
        value: zaal.locatieId, 
        label: `${locaties.find(l => l.id === zaal.locatieId)?.naam || 'Onbekend'} (${zaal.zaaldelen})` 
      }));

    // 2. Extra: Toevoegen van 'extra reservaties' uit uitzonderingen voor die specifieke datum
    if (datum) {
      const extraZalen = filteredUitzonderingen
        .filter(u => u.type === 'extra' && u.datum === datum)
        .map(u => ({
          value: u.locatieId,
          label: `EXTRA: ${locaties.find(l => l.id === u.locatieId)?.naam || 'Onbekend'}`
        }));
      opties = [...opties, ...extraZalen];
    }

    return opties;
  };

const handleSaveAdminItem = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  const currentColl = currentSection.collection;

  // 1. Opschonen data
  Object.keys(data).forEach(key => {
    if (data[key] === undefined || data[key] === "") delete data[key];
  });

  // 2. Metadata toevoegen
  if (currentColl === 'vasteTrainingen' || currentColl === 'groepen') data.coachIds = selectedCoachIds;
  
  if (currentColl === 'groepen') {
    const actueelSeizoen = seizoenen.find(s => s.id === activeSeasonId);
    data.seizoen = actueelSeizoen?.naam || '';
  }

  if (['vasteTrainingen', 'groepen', 'beschikbareZalen', 'zaalUitzonderingen', 'afwijkingen'].includes(currentColl)) {
    data.seizoenId = activeSeasonId;
  }

  if (currentColl === 'zaalUitzonderingen' && !editingItem?.id) {
    data.type = uitzonderingType;
  }

  try {
    // 3. De cruciale check: heeft het item een ID uit de database?
    if (editingItem && editingItem.id) {
      // UPDATE bestaand item
      await updateDoc(doc(db, currentColl, editingItem.id), data);
    } else {
      // VOEG NIEUW item toe
      const docRef = await addDoc(collection(db, currentColl), data);
      
      // Specifieke logica voor zaal-onbeschikbaarheid naar afwijkingen
      if (currentColl === 'zaalUitzonderingen' && uitzonderingType === 'onbeschikbaar') {
        const geselecteerdeDatum = new Date(data.datum);
        const dagNaam = days[geselecteerdeDatum.getDay()];
        
        const overlappendeTrainingen = filteredVasteTrainingen.filter(vt => {
          return vt.dag === dagNaam && 
                 vt.locatieId === data.locatieId && 
                 checkOverlap(vt.startUur, vt.eindUur, data.startUur, data.eindUur);
        });
        
        for (const vt of overlappendeTrainingen) {
          await addDoc(collection(db, 'afwijkingen'), {
            seizoenId: activeSeasonId || '',
            vasteId: vt.id || '',
            datum: data.datum || '',
            groepId: vt.groepId || '',
            startUur: vt.startUur || '',
            eindUur: vt.eindUur || '',
            locatieId: vt.locatieId || '',
            status: 'te behandelen',
            reden: data.reden || 'Zaal onbeschikbaar'
          });
        }
      }
    }

    // 4. UI Reset
    setShowAdminModal(false);
    setEditingItem(null);
    setSelectedCoachIds([]);
    setTempVasteTraining({ dag: '', startUur: '', eindUur: '', datum: '' });
  } catch (err) {
    console.error("Fout bij opslaan:", err);
    alert("Er is een fout opgetreden bij het opslaan.");
  }
};
  const openEditModal = (item) => {
    setEditingItem(item);
    if (adminSection === 'vasteTrainingen' || adminSection === 'groepen') setSelectedCoachIds(item.coachIds || []);
    if (adminSection === 'vasteTrainingen') setTempVasteTraining({ dag: item.dag || '', startUur: item.startUur || '', eindUur: item.eindUur || '' });
    if (adminSection === 'afwijkingen') setTempVasteTraining({ datum: item.datum, startUur: item.startUur, eindUur: item.eindUur });
    if (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen') setUitzonderingType(item.type || 'onbeschikbaar');
    setShowAdminModal(true);
  };

  const toggleCoach = (id) => {
    setSelectedCoachIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    setCoachSearch('');
  };

  const RenderInputField = (field) => {
    const isRequired = field.required !== false;
  
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

    if (field.type === 'date') {
      return (
        <input type="date" required={isRequired} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={editingItem?.[field.name] || ''}
          onChange={e => {
            const newValue = e.target.value;
            let extraUpdates = {};
            
            // Specifieke logica voor Afwijkingen
            if (adminSection === 'vasteTrainingen' && vasteTab === 'afwijkingen' && field.name === 'datum' && newValue) {
              const dagenWeek = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
              const datumObj = new Date(newValue);
              const dagNaam = dagenWeek[datumObj.getDay()];
              
              // Filter de vaste trainingen op de geselecteerde dag
              const matches = filteredVasteTrainingen.filter(v => v.dag === dagNaam);
              
              // Als er precies 1 match is, selecteer deze automatisch
              if (matches.length === 1) {
                extraUpdates.vasteId = matches[0].id;
                setTempVasteTraining(prev => ({ ...prev, datum: newValue, startUur: matches[0].startUur, eindUur: matches[0].eindUur }));
              } else {
                // Reset als de dag verandert naar een dag met 0 of meerdere opties
                extraUpdates.vasteId = '';
                setTempVasteTraining(prev => ({ ...prev, datum: newValue }));
              }
            }
            setEditingItem({...editingItem, [field.name]: newValue,  ...extraUpdates});
          }}
          />
      );
    }
    
    if (field.type === 'select') {
      let options = field.options;
      if ((adminSection === 'vasteTrainingen' || adminSection === 'afwijkingen') && field.name === 'locatieId') {
        options = getBeschikbareLocatieOpties();
      }

      // Filter de weekplanning op basis van de ingevulde datum
      if (field.name === 'weekplanningId') {
        const gekozenDatum = tempVasteTraining.datum;
        if (gekozenDatum) {
          const datumObject = new Date(gekozenDatum);
          const dagNaam = days[datumObject.getDay()];
      
          // Haal de rijen uit de vaste weekplanning die op deze dag vallen
          options = filteredBeschikbareZalen
            .filter(z => z.dag === dagNaam)
            .map(z => ({
              value: z.id,
              label: `${z.dag}: ${locaties.find(l => l.id === z.locatieId)?.naam} (${z.startUur}-${z.eindUur})`
            }));
        }
      }
      
      return (
        <select name={field.name} required={isRequired} defaultValue={editingItem ? editingItem[field.name] : ''} className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-indigo-50 outline-none text-sm"
          onChange={(e) => {
            if (adminSection === 'vasteTrainingen' && field.name === 'groepId') {
              const gObj = groepen.find(g => g.id === e.target.value);
              if (gObj?.coachIds) setSelectedCoachIds(gObj.coachIds);
            }
            if (adminSection === 'vasteTrainingen' && field.name === 'dag') setTempVasteTraining(prev => ({ ...prev, dag: e.target.value }));
                        
            if (adminSection === 'afwijkingen' && field.name === 'vasteId') {
              const v = vasteTrainingen.find(vt => vt.id === e.target.value);
              if (v) setTempVasteTraining(prev => ({ ...prev, startUur: v.startUur, eindUur: v.eindUur }));
              // start toevoeging om filtering te kunnen doen van vaste trainingen in afwijking modal
              const gekozenDatum = editingItem?.datum; // We halen de datum uit de state van het item dat we bewerken
              if (gekozenDatum) {
                const datumObject = new Date(gekozenDatum);
                const dagNaam = days[datumObject.getDay()];
                options = vasteTrainingen
                  .filter(vt => vt.dag === dagNaam)
                  .map(vt => ({
                    value: vt.id,
                    label: `${vt.dag}: ${groepen.find(g => g.id === vt.groepId)?.naam} (${vt.startUur}-${vt.eindUur})`
                  }));
              } else {
                options = []; // Geen datum = geen opties
              }
            //einde toevoeging
            }
            if (field.name === 'weekplanningId' && e.target.value) {
              const geselecteerdeZaal = filteredBeschikbareZalen.find(z => z.id === e.target.value);
              if (geselecteerdeZaal) {
                const form = e.target.form;
                // Vul de velden in het formulier direct in
                if(form.startUur) form.startUur.value = geselecteerdeZaal.startUur;
                if(form.eindUur) form.eindUur.value = geselecteerdeZaal.eindUur;
                if(form.locatieId) form.locatieId.value = geselecteerdeZaal.locatieId;
                if(form.zaaldelen) form.zaaldelen.value = geselecteerdeZaal.zaaldelen;
                if(form.huurprijs) form.huurprijs.value = geselecteerdeZaal.huurprijs;
            
                // Update ook de state zodat de save-functie de juiste data heeft
                setTempVasteTraining(prev => ({
                  ...prev,
                  weekplanningId: e.target.value,
                  startUur: geselecteerdeZaal.startUur,
                  eindUur: geselecteerdeZaal.eindUur,
                  locatieId: geselecteerdeZaal.locatieId,
                  zaaldelen: geselecteerdeZaal.zaaldelen,
                  huurprijs: geselecteerdeZaal.huurprijs
                }));
              }
            }
          }}
        >
          <option value="">Kies...</option>
          {options.map(opt => <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>{typeof opt === 'string' ? opt : opt.label}</option>)}
        </select>
      );
    }

    return (
      <input name={field.name} type={field.type} required={isRequired} defaultValue={editingItem ? editingItem[field.name] : ''} placeholder={field.placeholder} className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-indigo-50 outline-none text-sm font-medium" 
        onChange={(e) => { 
          if (['dag', 'startUur', 'eindUur', 'datum'].includes(field.name)) {
            setTempVasteTraining(prev => ({ ...prev, [field.name]: e.target.value }));
          }
        }}
      />
    );
  };

  const handleAddTraining = async (e, formData) => { // formData komt nu uit de modal
    e.preventDefault();
    try {
      if (editingItem) {
        // Wijzigen van bestaande training
        const docRef = doc(db, "trainingen", editingItem.id);
        await updateDoc(docRef, formData);
      } else {
        // Toevoegen van nieuwe training
        await addDoc(collection(db, "trainingen"), formData);
      }
      setShowTrainingModal(false);
      setEditingItem(null);
      // Optioneel: succes melding of reset
    } catch (error) {
      console.error("Fout bij opslaan training: ", error);
      alert("Er is een fout opgetreden bij het opslaan.");
    }
  };

  const handleSaveSeizoen = async (e, formData) => {
    if (e) e.preventDefault();
    try {
      if (editingItem) {
        // Update bestaand seizoen
        await updateDoc(doc(db, "seizoenen", editingItem.id), formData);
      } else {
        // Voeg nieuw seizoen toe
        await addDoc(collection(db, "seizoenen"), formData);
      }
      // UI opschonen
      setShowAdminModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Fout bij opslaan seizoen:", error);
      alert("Er is een fout opgetreden bij het opslaan van het seizoen.");
    }
  };

  const handleSaveCoach = async (e, formData) => {
    if (e) e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, "coaches", editingItem.id), formData);
      } else {
        await addDoc(collection(db, "coaches"), formData);
      }
      setShowAdminModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Fout bij opslaan coach:", error);
      alert("Er is een fout opgetreden.");
    }
  };

  const handleSaveLocatie = async (e, formData) => {
    if (e) e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, "locaties", editingItem.id), formData);
      } else {
        await addDoc(collection(db, "locaties"), formData);
      }
      setShowAdminModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Fout bij opslaan locatie:", error);
      alert("Er is een fout opgetreden.");
    }
  };
  
  // --- CALENDAR LOGIC (Ongewijzigd) ---
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
            {adminSection === 'groepen' ? (
              <GroepenTable 
                groepen={filteredGroepen}
                coaches={coaches}
                openEditModal={openEditModal}
                deleteDoc={deleteDoc}
                db={db}
                doc={doc}
              />
          ) : (
            <AdminTable 
              adminSection={adminSection}
              currentSection={currentSection}
              activeSeasonId={activeSeasonId}
              setActiveSeasonId={setActiveSeasonId}
              seizoenen={seizoenen}
              zaalTab={zaalTab}
              setZaalTab={setZaalTab}
              vasteTab={vasteTab}
              setVasteTab={setVasteTab}
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
              vasteTrainingen={vasteTrainingen}
              beschikbareZalen={beschikbareZalen}
              db={db}
              deleteDoc={deleteDoc}
              doc={doc}
            />
          )}
          </div>
        )}
      </main>

      <BulkScheduleModal 
        show={showBulkScheduleModal} onClose={() => setShowBulkScheduleModal(false)}
        onSubmit={async (e) => { e.preventDefault(); await handleBulkSchedule(selectedSeasonId, activeSeasonId, selectedVasteIds, seizoenen, vasteTrainingen, trainingen); setShowBulkScheduleModal(false); setSelectedVasteIds([]); }}
        seizoenen={seizoenen} selectedSeasonId={selectedSeasonId} setSelectedSeasonId={setSelectedSeasonId} activeSeasonId={activeSeasonId} vasteTrainingen={vasteTrainingen} selectedVasteIds={selectedVasteIds} setSelectedVasteIds={setSelectedVasteIds}
      />
      <SeizoenModal 
        show={showAdminModal && adminSection === 'seizoenen'} 
        onClose={() => { setShowAdminModal(false); setEditingItem(null); }}
        onSubmit={handleSaveSeizoen}
        editingItem={editingItem}
        handleDeleteAllPlanned={handleDeleteAllPlannedForSeason}
      />
      <CoachModal 
        show={showAdminModal && adminSection === 'coaches'} 
        onClose={() => { setShowAdminModal(false); setEditingItem(null); }}
        onSubmit={handleSaveCoach}
        editingItem={editingItem}
      /> 
      <LocatieModal 
        show={showAdminModal && adminSection === 'locaties'} 
        onClose={() => { setShowAdminModal(false); setEditingItem(null); }}
        onSubmit={handleSaveLocatie}
        editingItem={editingItem}
      /> 
      <AdminModal 
        show={showAdminModal&& !['seizoenen', 'coaches', 'locaties'].includes(adminSection)}
        onClose={() => { setShowAdminModal(false); setEditingItem(null); }}
        title={editingItem ? 'Bewerken' : (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' ? (uitzonderingType === 'extra' ? 'Extra reservatie' : 'Zaal onbeschikbaar') : 'Nieuw Item')}
        onSubmit={handleSaveAdminItem} editingItem={editingItem} fields={currentSection.fields} renderInputField={RenderInputField} handleDeleteAllPlanned={handleDeleteAllPlannedForSeason} adminSection={adminSection}
      />
      <TrainingModal 
        show={showTrainingModal} 
        onClose={() => { 
          setShowTrainingModal(false); 
          setEditingItem(null); // Zorgt dat de modal leeg is de volgende keer
        }} 
        onSubmit={handleAddTraining}
        editingItem={editingItem} // Geef het te bewerken item door
        groepen={groepen} 
        coaches={coaches} 
        locaties={locaties}
      />
    </div>
  );
};

export default App;
