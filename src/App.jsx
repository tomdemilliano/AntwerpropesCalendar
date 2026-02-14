import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from './firebase';
import { 
  collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy, updateDoc, where, getDocs, writeBatch
} from 'firebase/firestore';
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, MapPin, User, Users, Settings, 
  Calendar as CalendarIcon, X, LayoutGrid, Edit2, Clock, CalendarDays, Search, CalendarCheck, Filter, CheckCircle2, AlertTriangle, Building2, CalendarX, PlusCircle
} from 'lucide-react';

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
  
  // State voor het type uitzondering bij toevoegen
  const [uitzonderingType, setUitzonderingType] = useState('onbeschikbaar');

  // State voor Seizoen Selectie in Beheer
  const [activeSeasonId, setActiveSeasonId] = useState('');

  // State voor Bulk Scheduling
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [selectedVasteIds, setSelectedVasteIds] = useState([]);

  // State voor de Tag Input (Coaches)
  const [coachSearch, setCoachSearch] = useState('');
  const [selectedCoachIds, setSelectedCoachIds] = useState([]);
  const [isCoachDropdownOpen, setIsCoachDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- FORM STATE VOOR DYNAMISCHE FILTERING ---
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
      if (huidigSeizoen && !activeSeasonId) {
        setActiveSeasonId(huidigSeizoen.id);
      } else if (data.length > 0 && !activeSeasonId) {
        setActiveSeasonId(data[0].id);
      }
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCoachDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const getBeschikbareLocatieOpties = () => {
    const { dag, startUur, eindUur } = tempVasteTraining;
    if (!dag || !startUur || !eindUur) return [];

    return filteredBeschikbareZalen
      .filter(zaal => {
        return zaal.dag === dag && 
               zaal.startUur <= startUur && 
               zaal.eindUur >= eindUur;
      })
      .map(zaal => {
        const locNaam = locaties.find(l => l.id === zaal.locatieId)?.naam || 'Onbekend';
        return { 
          value: zaal.locatieId, 
          label: `${locNaam} (${zaal.zaaldelen})` 
        };
      });
  };

  const isIngepland = (vaste) => {
    return trainingen.some(t => 
      t.groepId === vaste.groepId && 
      t.uren === `${vaste.startUur}-${vaste.eindUur}`
    );
  };

  const sections = {
    groepen: {
      title: 'Trainingsgroepen',
      collection: 'groepen',
      icon: <Users size={18} />,
      data: filteredGroepen,
      fields: [
        { name: 'naam', label: 'Naam Groep', type: 'text', placeholder: 'bv. Selectie A' },
        { name: 'type', label: 'Type', type: 'select', options: ['Recrea', 'Volwassenen', 'Competitie'] },
        { name: 'aantalSpringers', label: 'Springers', type: 'number', placeholder: '0' },
        { name: 'coachIds', label: 'Vaste Coaches', type: 'tag-input' }
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
    },
    beschikbareZalen: {
      title: 'Beschikbare zalen',
      collection: zaalTab === 'weekplanning' ? 'beschikbareZalen' : 'zaalUitzonderingen',
      icon: <Building2 size={18} />,
      data: zaalTab === 'weekplanning' ? filteredBeschikbareZalen : filteredUitzonderingen,
      fields: zaalTab === 'weekplanning' ? [
        { name: 'locatieId', label: 'Locatie', type: 'select', options: locaties.map(l => ({ value: l.id, label: l.naam })) },
        { name: 'zaaldelen', label: 'Zaaldelen', type: 'select', options: ['Volledige zaal', '1/2de zaal', '1/3de zaal', '2/3de zaal'] },
        { isRow: true, fields: [
          { name: 'dag', label: 'Weekdag', type: 'select', options: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'] },
          { name: 'startUur', label: 'Beginuur', type: 'time' },
          { name: 'eindUur', label: 'Einduur', type: 'time' }
        ]},
        { name: 'huurprijs', label: 'Huurprijs (€)', type: 'number', placeholder: '0.00' }
      ] : (uitzonderingType === 'onbeschikbaar' ? [
        { name: 'datum', label: 'Datum', type: 'date' },
        { name: 'zaalId', label: 'Betreffende Vaste Planning', type: 'select', options: filteredBeschikbareZalen.map(z => ({ 
            value: z.id, 
            label: `${locaties.find(l => l.id === z.locatieId)?.naam} (${z.dag} ${z.startUur}-${z.eindUur})` 
          })) 
        },
        { name: 'reden', label: 'Reden van onbeschikbaarheid', type: 'text', placeholder: 'bv. Schoolfeest, onderhoud...' }
      ] : [
        { name: 'datum', label: 'Datum', type: 'date' },
        { isRow: true, fields: [
          { name: 'startUur', label: 'Beginuur', type: 'time' },
          { name: 'eindUur', label: 'Einduur', type: 'time' }
        ]},
        { name: 'locatieId', label: 'Locatie', type: 'select', options: locaties.map(l => ({ value: l.id, label: l.naam })) },
        { name: 'zaaldelen', label: 'Zaaldelen', type: 'select', options: ['Volledige zaal', '1/2de zaal', '1/3de zaal', '2/3de zaal'] },
        { name: 'huurprijs', label: 'Huurprijs (€)', type: 'number', placeholder: '0.00' }
      ])
    },
    seizoenen: {
      title: 'Seizoenen',
      collection: 'seizoenen',
      icon: <CalendarDays size={18} />,
      data: seizoenen,
      fields: [
        { name: 'naam', label: 'Naam Seizoen', type: 'text', placeholder: 'bv. 2025-2026' },
        { isRow: true, fields: [
          { name: 'startDatum', label: 'Startdatum Seizoen', type: 'date' },
          { name: 'eindDatum', label: 'Einddatum Seizoen', type: 'date' }
        ]},
        { isRow: true, fields: [
          { name: 'startTrainingen', label: 'Start Trainingen', type: 'date' },
          { name: 'eindTrainingen', label: 'Einde Trainingen', type: 'date' }
        ]}
      ]
    },
    vasteTrainingen: {
      title: 'Wekelijkse Trainingen',
      collection: 'vasteTrainingen',
      icon: <Clock size={18} />,
      data: filteredVasteTrainingen,
      fields: [
        { name: 'groepId', label: 'Groep', type: 'select', options: filteredGroepen.map(g => ({ value: g.id, label: g.naam })) },
        { isRow: true, fields: [
          { name: 'dag', label: 'Weekdag', type: 'select', options: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'] },
          { name: 'startUur', label: 'Start', type: 'time' },
          { name: 'eindUur', label: 'Einde', type: 'time' }
        ]},
        { name: 'coachIds', label: 'Coaches toewijzen', type: 'tag-input' },
        { name: 'locatieId', label: 'Locatie', type: 'select', isDynamic: true, options: [] }, 
        { name: 'ingepland', label: 'Ingepland', type: 'status' }
      ]
    }
  };

  const currentSection = sections[adminSection];

  const handleSaveAdminItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    if (currentSection.collection === 'vasteTrainingen') {
      data.coachIds = selectedCoachIds;
      data.seizoenId = activeSeasonId; 
    }

    if (currentSection.collection === 'groepen') {
      data.coachIds = selectedCoachIds;
      const actueelSeizoen = seizoenen.find(s => s.id === activeSeasonId);
      data.seizoen = actueelSeizoen?.naam || '';
      data.seizoenId = activeSeasonId;
    }

    if (currentSection.collection === 'beschikbareZalen') {
      data.seizoenId = activeSeasonId;
    }

    if (currentSection.collection === 'zaalUitzonderingen') {
      data.seizoenId = activeSeasonId;
      if (!editingItem) {
        data.type = uitzonderingType;
      }
    }

    if (editingItem) {
      await updateDoc(doc(db, currentSection.collection, editingItem.id), data);
    } else {
      await addDoc(collection(db, currentSection.collection), data);
    }
    setShowAdminModal(false);
    setEditingItem(null);
    setSelectedCoachIds([]);
    setTempVasteTraining({ dag: '', startUur: '', eindUur: '' });
  };

  const handleBulkSchedule = async (e) => {
    e.preventDefault();
    const seasonIdToUse = selectedSeasonId || activeSeasonId;
    if (!seasonIdToUse || selectedVasteIds.length === 0) return;

    const seizoen = seizoenen.find(s => s.id === seasonIdToUse);
    const trainingStartStr = seizoen.startTrainingen || seizoen.startDatum;
    const trainingEindStr = seizoen.eindTrainingen || seizoen.eindDatum;

    if (!trainingStartStr || !trainingEindStr) {
      alert("Zorg dat de start- en einddatum van de trainingen zijn ingevuld voor dit seizoen.");
      return;
    }

    const start = new Date(trainingStartStr);
    const eind = new Date(trainingEindStr);
    const dagIndexen = { 'Zondag': 0, 'Maandag': 1, 'Dinsdag': 2, 'Woensdag': 3, 'Donderdag': 4, 'Vrijdag': 5, 'Zaterdag': 6 };

    const q = query(
      collection(db, "planning"), 
      where("datum", ">=", trainingStartStr),
      where("datum", "<=", trainingEindStr)
    );
    const existingDocs = await getDocs(q);
    
    const batch = writeBatch(db);

    for (const vasteId of selectedVasteIds) {
      const vaste = vasteTrainingen.find(v => v.id === vasteId);
      const targetDag = dagIndexen[vaste.dag];

      existingDocs.forEach(docSnap => {
        const data = docSnap.data();
        const d = new Date(data.datum);
        if (data.groepId === vaste.groepId && d.getDay() === targetDag) {
          batch.delete(docSnap.ref);
        }
      });

      let loopDate = new Date(start);
      while (loopDate <= eind) {
        if (loopDate.getDay() === targetDag) {
          const formattedDate = loopDate.toISOString().split('T')[0];
          const newDocRef = doc(collection(db, "planning"));
          batch.set(newDocRef, {
            datum: formattedDate,
            groepId: vaste.groepId,
            locatieId: vaste.locatieId,
            uren: `${vaste.startUur}-${vaste.eindUur}`,
            coachId: vaste.coachIds?.[0] || '',
            coachIds: vaste.coachIds || []
          });
        }
        loopDate.setDate(loopDate.getDate() + 1);
      }
    }

    await batch.commit();
    setShowBulkScheduleModal(false);
    setSelectedVasteIds([]);
    alert(`Trainingsmomenten succesvol ingepland tussen ${trainingStartStr} en ${trainingEindStr}!`);
  };

  const handleDeleteAllPlannedForSeason = async (seizoen) => {
    const confirmDelete = window.confirm(
      `Weet u zeker dat u ALLE ingeplande trainingen voor het seizoen "${seizoen.naam}" wilt verwijderen uit de kalender?\n\n` +
      `Dit verwijdert alle items tussen ${seizoen.startDatum} en ${seizoen.eindDatum}.`
    );

    if (confirmDelete) {
      const q = query(
        collection(db, "planning"),
        where("datum", ">=", seizoen.startDatum),
        where("datum", "<=", seizoen.eindDatum)
      );
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();
      alert(`${querySnapshot.size} trainingen zijn succesvol verwijderd uit de planning.`);
      setShowAdminModal(false);
    }
  };

  const handleDeleteVasteTraining = async (item) => {
    const isScheduled = isIngepland(item);
    
    if (isScheduled) {
      const confirmDelete = window.confirm(
        "Er zijn reeds trainingen ingepland in de kalender voor dit wekelijkse moment.\n\n" +
        "Wilt u dit wekelijkse moment én alle bijbehorende trainingen uit de kalender verwijderen?"
      );
      
      if (confirmDelete) {
        const batch = writeBatch(db);
        const relevantTrainingen = trainingen.filter(t => 
          t.groepId === item.groepId && t.uren === `${item.startUur}-${item.eindUur}`
        );
        relevantTrainingen.forEach(t => {
          batch.delete(doc(db, "planning", t.id));
        });
        batch.delete(doc(db, "vasteTrainingen", item.id));
        await batch.commit();
        alert("Wekelijks moment en alle ingeplande trainingen zijn verwijderd.");
      }
    } else {
      if(window.confirm("Weet u zeker dat u dit wekelijkse moment wilt verwijderen?")) {
        await deleteDoc(doc(db, "vasteTrainingen", item.id));
      }
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    if (adminSection === 'vasteTrainingen' || adminSection === 'groepen') {
      setSelectedCoachIds(item.coachIds || []);
    }
    if (adminSection === 'vasteTrainingen') {
      setTempVasteTraining({ 
        dag: item.dag || '', 
        startUur: item.startUur || '', 
        eindUur: item.eindUur || '' 
      });
    }
    if (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen') {
      setUitzonderingType(item.type || 'onbeschikbaar');
    }
    setShowAdminModal(true);
  };

  const toggleCoach = (id) => {
    setSelectedCoachIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    setCoachSearch('');
  };

  const renderCellContent = (item, field) => {
    const value = item[field.name];
    if (field.name === 'groepId') return groepen.find(g => g.id === value)?.naam || 'Onbekend';
    if (field.name === 'locatieId') return locaties.find(l => l.id === value)?.naam || 'Onbekend';
    if (field.name === 'zaalId') {
        const z = beschikbareZalen.find(bz => bz.id === value);
        if (!z) return 'Onbekend';
        return `${locaties.find(l => l.id === z.locatieId)?.naam} (${z.dag})`;
    }
    if (field.name === 'coachIds' && Array.isArray(value)) {
      return value.map(id => coaches.find(c => c.id === id)?.voornaam).join(', ');
    }
    if (field.type === 'number' && (field.name === 'uurtarief' || field.name === 'huurprijs')) return `€ ${value}`;
    if (field.type === 'status') {
      return isIngepland(item) ? (
        <span className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase">
          <CheckCircle2 size={14}/> Ja
        </span>
      ) : (
        <span className="text-slate-300 font-bold text-[10px] uppercase">Nee</span>
      );
    }
    if (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' && field.name === 'datum') {
      const prefix = item.type === 'extra' ? '➕ ' : '🚫 ';
      return <span>{prefix} {value}</span>;
    }
    return value;
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const dayLabels = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

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
            <input 
              type="text" 
              placeholder="Zoek coach..." 
              value={coachSearch}
              onFocus={() => setIsCoachDropdownOpen(true)}
              onChange={(e) => setCoachSearch(e.target.value)}
              className="w-full p-3 pl-10 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-indigo-50 outline-none text-sm"
            />
            <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
          </div>
          {isCoachDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-40 overflow-y-auto">
              {coaches
                .filter(c => !selectedCoachIds.includes(c.id))
                .filter(c => `${c.voornaam} ${c.achternaam}`.toLowerCase().includes(coachSearch.toLowerCase()))
                .map(c => (
                  <button key={c.id} type="button" onClick={() => toggleCoach(c.id)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0">
                    {c.voornaam} {c.achternaam}
                  </button>
                ))}
            </div>
          )}
        </div>
      );
    }
    
    if (field.type === 'select') {
      let options = field.options;
      
      if (adminSection === 'vasteTrainingen' && field.name === 'locatieId') {
        options = getBeschikbareLocatieOpties();
      }

      return (
        <select 
          name={field.name} 
          required={field.name !== 'reden'} 
          defaultValue={editingItem ? editingItem[field.name] : ''} 
          className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-indigo-50 outline-none text-sm"
          onChange={(e) => {
            if (adminSection === 'vasteTrainingen' && field.name === 'groepId') {
              const gId = e.target.value;
              const gObj = groepen.find(g => g.id === gId);
              if (gObj && gObj.coachIds) {
                setSelectedCoachIds(gObj.coachIds);
              }
            }
            if (adminSection === 'vasteTrainingen' && field.name === 'dag') {
              setTempVasteTraining(prev => ({ ...prev, dag: e.target.value }));
            }
          }}
        >
          <option value="">{options.length === 0 && adminSection === 'vasteTrainingen' && field.name === 'locatieId' ? 'Geen zaal beschikbaar op dit moment...' : 'Kies...'}</option>
          {options.map(opt => (
            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input 
        name={field.name} 
        type={field.type} 
        required={field.name !== 'reden'} 
        defaultValue={editingItem ? editingItem[field.name] : ''} 
        placeholder={field.placeholder} 
        className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-indigo-50 outline-none text-sm font-medium" 
        onChange={(e) => {
          if (adminSection === 'vasteTrainingen' && ['dag', 'startUur', 'eindUur'].includes(field.name)) {
            setTempVasteTraining(prev => ({ ...prev, [field.name]: e.target.value }));
          }
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200 px-8 py-3 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><CalendarIcon size={20} /></div>
          <h1 className="text-lg font-black tracking-tighter">TRAINING<span className="text-indigo-600">PLAN</span></h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button onClick={() => setActiveTab('kalender')} className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'kalender' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500'}`}><LayoutGrid size={16}/> Kalender</button>
          <button onClick={() => setActiveTab('beheer')} className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'beheer' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500'}`}><Settings size={16}/> Beheer</button>
        </div>
      </nav>

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
            <aside className="w-64 border-r border-slate-100 p-4 flex flex-col gap-1 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-4">Database</p>
              {Object.entries(sections).map(([key, sec]) => (
                <button key={key} onClick={() => { setAdminSection(key); setSelectedCoachIds([]); setTempVasteTraining({dag:'', startUur:'', eindUur:''}); }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${adminSection === key ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
                  {sec.icon} {sec.title}
                </button>
              ))}
            </aside>

            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">{currentSection.title}</h2>
                  {(adminSection === 'vasteTrainingen' || adminSection === 'groepen' || adminSection === 'beschikbareZalen') && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <Filter size={14} className="text-indigo-600" />
                      <span>Actief seizoen:</span>
                      <select 
                        value={activeSeasonId} 
                        onChange={(e) => setActiveSeasonId(e.target.value)}
                        className="bg-transparent font-bold text-indigo-600 outline-none border-b border-indigo-200"
                      >
                        {seizoenen.map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {adminSection === 'vasteTrainingen' && (
                    <button onClick={() => setShowBulkScheduleModal(true)} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-200 transition text-sm font-bold">
                      <CalendarCheck size={16}/> Trainingsmomenten inplannen
                    </button>
                  )}
                  {adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' ? (
                    <>
                      <button onClick={() => { setEditingItem(null); setUitzonderingType('extra'); setShowAdminModal(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition text-sm font-bold">
                        <PlusCircle size={16}/> Extra reservatie
                      </button>
                      <button onClick={() => { setEditingItem(null); setUitzonderingType('onbeschikbaar'); setShowAdminModal(true); }} className="bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-red-700 transition text-sm font-bold">
                        <CalendarX size={16}/> Zaal onbeschikbaar
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setEditingItem(null); setSelectedCoachIds([]); setTempVasteTraining({dag:'', startUur:'', eindUur:''}); setShowAdminModal(true); }} className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-600 transition text-sm font-bold">
                      <Plus size={16}/> Toevoegen
                    </button>
                  )}
                </div>
              </div>

              {/* TABBLADEN VOOR BESCHIKBARE ZALEN */}
              {adminSection === 'beschikbareZalen' && (
                <div className="flex gap-4 mb-6 border-b border-slate-100">
                  <button 
                    onClick={() => setZaalTab('weekplanning')}
                    className={`pb-2 px-4 text-sm font-bold transition-all ${zaalTab === 'weekplanning' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}
                  >
                    Vaste planning
                  </button>
                  <button 
                    onClick={() => setZaalTab('uitzonderingen')}
                    className={`pb-2 px-4 text-sm font-bold transition-all ${zaalTab === 'uitzonderingen' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}
                  >
                    Uitzonderingen
                  </button>
                </div>
              )}

              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {currentSection.fields.map((f, i) => {
                        if (f.isRow) return f.fields.map(sub => <th key={sub.name} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sub.label}</th>);
                        return <th key={f.name || i} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.label}</th>;
                      })}
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentSection.data.length > 0 ? (
                      currentSection.data.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                          {currentSection.fields.map((f, i) => {
                            if (f.isRow) return f.fields.map(sub => <td key={sub.name} className="px-4 py-3 text-sm text-slate-600 font-medium">{renderCellContent(item, sub)}</td>);
                            return <td key={f.name || i} className="px-4 py-3 text-sm text-slate-600 font-medium">{renderCellContent(item, f)}</td>;
                          })}
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit2 size={14}/></button>
                              <button 
                                onClick={() => adminSection === 'vasteTrainingen' ? handleDeleteVasteTraining(item) : (window.confirm("Verwijderen?") && deleteDoc(doc(db, currentSection.collection, item.id)))} 
                                className="p-1.5 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 size={14}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="100%" className="px-4 py-12 text-center text-slate-400 text-sm">
                          Geen gegevens gevonden voor dit seizoen.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: BULK INPLANNEN */}
      {showBulkScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800">Trainingsmomenten inplannen</h2>
              <button onClick={() => setShowBulkScheduleModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleBulkSchedule} className="p-6 space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kies Seizoen</label>
                <select 
                  required 
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" 
                  value={selectedSeasonId || activeSeasonId}
                  onChange={e => setSelectedSeasonId(e.target.value)}
                >
                  <option value="">Selecteer seizoen...</option>
                  {seizoenen.map(s => <option key={s.id} value={s.id}>{s.naam} ({s.startTrainingen || s.startDatum} tot {s.eindTrainingen || s.eindDatum})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kies Momenten om te genereren</label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-slate-50 rounded-xl p-2">
                  {vasteTrainingen
                    .filter(v => {
                      const selSeason = seizoenen.find(s => s.id === (selectedSeasonId || activeSeasonId));
                      const groep = groepen.find(g => g.id === v.groepId);
                      return groep?.seizoen === selSeason?.naam;
                    })
                    .map(v => (
                    <label key={v.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-indigo-600"
                        checked={selectedVasteIds.includes(v.id)}
                        onChange={(e) => {
                          if(e.target.checked) setSelectedVasteIds([...selectedVasteIds, v.id]);
                          else setSelectedVasteIds(selectedVasteIds.filter(id => id !== v.id));
                        }}
                      />
                      <span className="text-sm font-medium">
                        {groepen.find(g => g.id === v.groepId)?.naam} - {v.dag} ({v.startUur}-{v.eindUur})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  <strong>Let op:</strong> Deze actie zal alle eerder ingeplande trainingen voor de geselecteerde groepen op die specifieke weekdagen <strong>tussen de trainingsdatums</strong> van het seizoen overschrijven.
                </p>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all">
                Bevestig en Plan in
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN EDIT/ADD */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800">
                {editingItem ? 'Bewerken' : (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' ? (uitzonderingType === 'extra' ? 'Extra reservatie toevoegen' : 'Zaal onbeschikbaar toevoegen') : 'Nieuw Item')}
              </h2>
              <button onClick={() => setShowAdminModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveAdminItem} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {currentSection.fields.filter(f => f.type !== 'status').map((field, idx) => {
                if (field.isRow) {
                  return (
                    <div key={idx} className={`grid ${field.fields.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                      {field.fields.map(subField => (
                        <div key={subField.name}>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{subField.label}</label>
                          {RenderInputField(subField)}
                        </div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div key={field.name || idx}>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                    {RenderInputField(field)}
                  </div>
                );
              })}

              {adminSection === 'seizoenen' && editingItem && (
                <div className="pt-4 mt-4 border-t border-slate-50">
                   <button 
                    type="button"
                    onClick={() => handleDeleteAllPlannedForSeason(editingItem)}
                    className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                  >
                    <AlertTriangle size={16}/> Verwijder alle ingeplande momenten
                  </button>
                </div>
              )}

              <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all mt-4">
                {editingItem ? 'Wijzigingen Opslaan' : 'Toevoegen'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KALENDER PLANNING */}
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
