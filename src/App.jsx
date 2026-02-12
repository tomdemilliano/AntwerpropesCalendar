import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  MapPin, 
  User, 
  Clock, 
  Info,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Gegevens geëxtraheerd uit de "JAAR overzicht" CSV
const RAW_DATA = [
  { dag: 'maandag', datum: '2025-09-01', waar: 'St Michiel Schoten', uren: '19-21u', groep: '16+', coach1: 'Seppe', coach2: 'Ben' },
  { dag: 'dinsdag', datum: '2025-09-02', waar: 'Groenendaal 1/3', uren: '19-21u', groep: '16+', coach1: 'Seppe', coach2: 'Pieter' },
  { dag: 'woensdag', datum: '2025-09-03', waar: 'Bloemendaal Rood', uren: '14-16u', groep: 'Recrea Schoten WOE', coach1: 'Cara' },
  { dag: 'woensdag', datum: '2025-09-03', waar: 'Groenendaal 1/3', uren: '16-18u', groep: 'Recrea Merksem', coach1: 'Alexander', coach2: 'Kerstin' },
  { dag: 'zaterdag', datum: '2025-09-06', waar: 'Bloemendaal Rood', uren: '11-13u', groep: 'Recrea Schoten ZA', coach1: 'Jolien', coach2: 'Sam' },
  { dag: 'zaterdag', datum: '2025-09-06', waar: 'Ibex', uren: '11-13u', groep: 'Recrea Deurne', coach1: 'Alexander' },
  { dag: 'zaterdag', datum: '2025-09-06', waar: 'Groenendaal 1/3', uren: '10-12u', groep: "Mini's", coach1: 'Elise', coach2: 'Jona' },
  { dag: 'zaterdag', datum: '2025-09-06', waar: 'Groenendaal 2/3', uren: '9.30-12u', groep: 'Beloften', coach1: 'Maarten', coach2: 'Ine' },
  { dag: 'zondag', datum: '2025-09-07', waar: 'Zeurt 1/3', uren: '19-21u', groep: 'Demo', coach1: 'Jona', coach2: 'Elise' },
  // Voorbeeld data voor vakantie/geen training
  { dag: 'maandag', datum: '2025-10-27', opmerking: 'GEEN TRAINING - Herfstvakantie', status: 'vrij' },
  { dag: 'zaterdag', datum: '2025-11-01', opmerking: 'Allerheiligen - Geen training', status: 'vrij' },
  { dag: 'zaterdag', datum: '2026-02-14', opmerking: 'Valentijn - BOTS wedstrijd', status: 'wedstrijd', groep: 'Beloften' },
  { dag: 'zaterdag', datum: '2026-06-27', waar: 'Zeurt 3/3', uren: '13-22u', groep: 'Antwerp ropes activiteit', opmerking: 'Eindspel + Gala' },
];

// Helper om unieke waarden te krijgen
const getUnique = (arr, key) => [...new Set(arr.map(item => item[key]).filter(Boolean))].sort();

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8, 1)); // Start sept 2025
  const [filterGroup, setFilterGroup] = useState('Alle');
  const [filterCoach, setFilterCoach] = useState('Alle');
  const [searchTerm, setSearchTerm] = useState('');

  const groups = useMemo(() => ['Alle', ...getUnique(RAW_DATA, 'groep')], []);
  const coaches = useMemo(() => {
    const allCoaches = RAW_DATA.flatMap(d => [d.coach1, d.coach2, d.coach3]).filter(Boolean);
    return ['Alle', ...new Set(allCoaches)].sort();
  }, []);

  const filteredData = useMemo(() => {
    return RAW_DATA.filter(item => {
      const matchGroup = filterGroup === 'Alle' || item.groep === filterGroup;
      const matchCoach = filterCoach === 'Alle' || [item.coach1, item.coach2, item.coach3].includes(filterCoach);
      const matchSearch = searchTerm === '' || 
        Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
      return matchGroup && matchCoach && matchSearch;
    });
  }, [filterGroup, filterCoach, searchTerm]);

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const monthName = currentMonth.toLocaleString('nl-NL', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">Antwerp Ropes</h1>
            <p className="text-slate-500 italic">Jaaroverzicht Planning 2025-2026</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold min-w-[140px] text-center capitalize">{monthName}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-slate-400" size={18} />
            <select 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
            >
              <option disabled>Filter op groep</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <select 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
              value={filterCoach}
              onChange={(e) => setFilterCoach(e.target.value)}
            >
              <option disabled>Filter op coach</option>
              {coaches.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Zoek op locatie, datum..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="text-indigo-600" size={20} />
              Geplande Activiteiten
            </h2>
            
            {filteredData.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400">
                Geen resultaten gevonden voor deze filters.
              </div>
            ) : (
              filteredData.map((item, idx) => (
                <div key={idx} className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 transition-all hover:shadow-md ${
                  item.status === 'vrij' ? 'border-red-400 opacity-75' : 
                  item.status === 'wedstrijd' ? 'border-amber-400' : 'border-indigo-500'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-400">{item.dag} {item.datum}</span>
                      <h3 className="text-lg font-bold text-slate-800">{item.groep || (item.status === 'vrij' ? 'VAKANTIE' : 'Special Event')}</h3>
                    </div>
                    {item.uren && (
                      <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-sm font-medium">
                        <Clock size={14} />
                        {item.uren}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
                    {item.waar && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin size={16} className="text-slate-400" />
                        {item.waar}
                      </div>
                    )}
                    {(item.coach1 || item.coach2) && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <User size={16} className="text-slate-400" />
                        <span>{item.coach1}{item.coach2 ? `, ${item.coach2}` : ''}</span>
                      </div>
                    )}
                  </div>

                  {item.opmerking && (
                    <div className="mt-3 p-2 bg-slate-50 rounded-lg text-sm text-slate-500 flex items-start gap-2 border border-slate-100 italic">
                      <Info size={14} className="mt-0.5 shrink-0" />
                      {item.opmerking}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Stats & Sidebar */}
          <div className="space-y-6">
            <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold mb-4">Seizoen Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-indigo-800 pb-2">
                  <span className="text-indigo-200">Totaal sessies</span>
                  <span className="text-xl font-bold">{RAW_DATA.filter(d => !d.status).length}</span>
                </div>
                <div className="flex justify-between items-center border-b border-indigo-800 pb-2">
                  <span className="text-indigo-200">Wedstrijden</span>
                  <span className="text-xl font-bold">{RAW_DATA.filter(d => d.status === 'wedstrijd').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-200">Vrije dagen</span>
                  <span className="text-xl font-bold">{RAW_DATA.filter(d => d.status === 'vrij').length}</span>
                </div>
              </div>
              <div className="mt-6 p-3 bg-white/10 rounded-xl text-xs text-indigo-100">
                Let op: Controleer altijd de factuur kolom in het Excel bestand voor definitieve bevestiging van zalen.
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                Snelkoppelingen
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors" onClick={() => {setFilterGroup("Mini's"); setSearchTerm('')}}>Bekijk Mini's</li>
                <li className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors" onClick={() => {setFilterGroup("Beloften"); setSearchTerm('')}}>Bekijk Beloften</li>
                <li className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors" onClick={() => {setSearchTerm('Groenendaal')}}>Locatie: Groenendaal</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
              <h3 className="text-lg font-bold text-amber-800 mb-2 flex items-center gap-2">
                <AlertCircle size={18} />
                Coach info
              </h3>
              <p className="text-sm text-amber-700">
                Sommige sessies hebben nog een coach-tekort (aangegeven met ?? in Excel). 
                Controleer de wekelijkse updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
