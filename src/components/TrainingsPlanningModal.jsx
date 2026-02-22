import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, User, Search, Calendar, Clock, MapPin } from 'lucide-react';

const TrainingsPlanningModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  editingItem, 
  vasteTab, 
  groepen, 
  locaties, 
  beschikbareZalen, // De items uit de vaste zaalplanning
  coaches,
  vasteTrainingen, 
  activeSeasonId 
}) => {
  const [formData, setFormData] = useState({});
  const [coachSearch, setCoachSearch] = useState('');
  const [showCoachDropdown, setShowCoachDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const dagen = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

  // Klik buiten dropdown sluiten
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCoachDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formulier initialiseren
  useEffect(() => {
    if (show) {
      if (editingItem) {
        setFormData({ ...editingItem, coachIds: editingItem.coachIds || [] });
      } else {
        setFormData({
          seizoenId: activeSeasonId,
          groepId: '',
          coachIds: [],
          dag: 'Maandag',
          startUur: '',
          eindUur: '',
          locatieId: '',
          datum: '',
          vasteTrainingId: '',
          reden: '',
          status: 'te behandelen',
          nieuweLocatieId: '',
          nieuwStartUur: '',
          nieuwEindUur: ''
        });
      }
      setCoachSearch('');
    }
  }, [show, editingItem, activeSeasonId]);

  // LOGICA: Beschikbare zalen filteren op basis van geselecteerde dag (Vaste Planning)
  const relevanteZalen = useMemo(() => {
    if (vasteTab !== 'vaste-planning') return [];
    return beschikbareZalen.filter(z => z.dag === formData.dag);
  }, [formData.dag, beschikbareZalen, vasteTab]);

  // LOGICA: Vaste trainingen filteren op basis van de gekozen datum (Afwijkingen)
  const relevanteVasteTrainingen = useMemo(() => {
    if (vasteTab !== 'afwijkingen' || !formData.datum) return [];
    const datumObj = new Date(formData.datum);
    const dagNamen = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    const geselecteerdeDagNaam = dagNamen[datumObj.getDay()];
    return vasteTrainingen.filter(v => v.dag === geselecteerdeDagNaam);
  }, [formData.datum, vasteTrainingen, vasteTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'groepId') {
      const geselecteerdeGroep = groepen.find(g => g.id === value);
      setFormData(prev => ({ 
        ...prev, 
        groepId: value,
        coachIds: geselecteerdeGroep?.coachIds || [] 
      }));
    } else if (name === 'locatieId' && vasteTab === 'vaste-planning') {
      const gekozenZaalMoment = relevanteZalen.find(z => z.locatieId === value);
      setFormData(prev => ({
        ...prev,
        locatieId: value,
        startUur: gekozenZaalMoment?.startUur || prev.startUur,
        eindUur: gekozenZaalMoment?.eindUur || prev.eindUur
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addCoach = (coachId) => {
    if (!formData.coachIds?.includes(coachId)) {
      setFormData(prev => ({ ...prev, coachIds: [...(prev.coachIds || []), coachId] }));
    }
    setCoachSearch('');
    setShowCoachDropdown(false);
  };

  const removeCoach = (coachId) => {
    setFormData(prev => ({ ...prev, coachIds: prev.coachIds.filter(id => id !== coachId) }));
  };

  const filteredCoaches = coaches.filter(coach => 
    coach.naam.toLowerCase().includes(coachSearch.toLowerCase()) &&
    !formData.coachIds?.includes(coach.id)
  );

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="text-lg font-black text-slate-800">
             {vasteTab === 'vaste-planning' ? 'Vaste Training' : 'Afwijking'} {editingItem ? 'Aanpassen' : 'Toevoegen'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(e, formData); }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-left">
          
          {vasteTab === 'vaste-planning' ? (
            /* VASTE PLANNING LAYOUT */
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Groep</label>
                <select name="groepId" value={formData.groepId} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20 mt-1">
                  <option value="">Selecteer groep...</option>
                  {groepen.map(g => <option key={g.id} value={g.id}>{g.naam}</option>)}
                </select>
              </div>

              {/* COACH SELECTIE (TAGS) */}
              <div className="relative" ref={dropdownRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1">Coaches</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.coachIds?.map(id => (
                    <span key={id} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-indigo-100">
                      {coaches.find(c => c.id === id)?.naam}
                      <button type="button" onClick={() => removeCoach(id)} className="hover:text-indigo-900"><X size={14} /></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Coach toevoegen..." 
                    value={coachSearch}
                    onChange={(e) => { setCoachSearch(e.target.value); setShowCoachDropdown(true); }}
                    onFocus={() => setShowCoachDropdown(true)}
                    className="w-full bg-slate-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 ring-indigo-500/20"
                  />
                  {showCoachDropdown && coachSearch && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto p-2">
                      {filteredCoaches.map(c => (
                        <button key={c.id} type="button" onClick={() => addCoach(c.id)} className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl text-sm font-medium">{c.naam}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dag</label>
                  <select name="dag" value={formData.dag} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1">
                    {dagen.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Zaal (uit Zaalplanning)</label>
                  <select name="locatieId" value={formData.locatieId} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1">
                    <option value="">Kies moment...</option>
                    {relevanteZalen.map(z => (
                      <option key={z.id} value={z.locatieId}>
                        {locaties.find(l => l.id === z.locatieId)?.naam} ({z.startUur}-{z.eindUur})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Training</label>
                  <input type="time" name="startUur" value={formData.startUur} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Eind Training</label>
                  <input type="time" name="eindUur" value={formData.eindUur} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>
            </>
          ) : (
            /* AFWIJKINGEN LAYOUT */
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Datum Afwijking</label>
                <input type="date" name="datum" value={formData.datum} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1 focus:ring-2 ring-indigo-500/20" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Oorspronkelijke Training</label>
                <select 
                  name="vasteTrainingId" 
                  value={formData.vasteTrainingId} 
                  onChange={handleChange} 
                  required 
                  disabled={!formData.datum}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1 disabled:opacity-50"
                >
                  <option value="">{formData.datum ? 'Kies training...' : 'Kies eerst een datum'}</option>
                  {relevanteVasteTrainingen.map(v => (
                    <option key={v.id} value={v.id}>
                      {groepen.find(g => g.id === v.groepId)?.naam} ({v.startUur}-{v.eindUur})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reden</label>
                <input type="text" name="reden" value={formData.reden} onChange={handleChange} placeholder="bv. Zaal onbeschikbaar, feestdag..." className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1" />
              </div>

              <div className="pt-2 border-t border-slate-50 mt-2">
                <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest ml-1">Actie / Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-indigo-50/50 border-none rounded-xl px-4 py-3 text-sm font-bold text-indigo-700 mt-1">
                  <option value="te behandelen">Nog te behandelen</option>
                  <option value="geannuleerd">Training annuleren</option>
                  <option value="gewijzigd">Verplaatsen naar andere zaal/uur</option>
                </select>
              </div>

              {formData.status === 'gewijzigd' && (
                <div className="bg-slate-50 p-4 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nieuwe Zaal</label>
                    <select name="nieuweLocatieId" value={formData.nieuweLocatieId} onChange={handleChange} required className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-sm mt-1">
                      <option value="">Selecteer zaal...</option>
                      {locaties.map(l => <option key={l.id} value={l.id}>{l.naam}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="time" name="nieuwStartUur" value={formData.nieuwStartUur} onChange={handleChange} required className="bg-white border-none rounded-xl px-4 py-2.5 text-sm" />
                    <input type="time" name="nieuwEindUur" value={formData.nieuwEindUur} onChange={handleChange} required className="bg-white border-none rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                </div>
              )}
            </>
          )}

          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mt-6 transform active:scale-[0.98]">
            {editingItem ? 'Wijzigingen Opslaan' : 'Toevoegen aan Planning'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrainingsPlanningModal;
