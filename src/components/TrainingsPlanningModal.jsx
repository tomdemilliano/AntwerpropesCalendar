import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, User, Search, Plus } from 'lucide-react';

const TrainingsPlanningModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  editingItem, 
  vasteTab, 
  groepen, 
  locaties, 
  coaches,
  vasteTrainingen, 
  activeSeasonId 
}) => {
  const [formData, setFormData] = useState({});
  const [coachSearch, setCoachSearch] = useState('');
  const [showCoachDropdown, setShowCoachDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const dagen = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

  // Sluit dropdown als je buiten het veld klikt
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCoachDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'groepId') {
      const geselecteerdeGroep = groepen.find(g => g.id === value);
      setFormData(prev => ({ 
        ...prev, 
        groepId: value,
        coachIds: geselecteerdeGroep?.coachIds || [] 
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
    setFormData(prev => ({
      ...prev,
      coachIds: prev.coachIds.filter(id => id !== coachId)
    }));
  };

  const filteredCoaches = coaches.filter(coach => 
    coach.naam.toLowerCase().includes(coachSearch.toLowerCase()) &&
    !formData.coachIds?.includes(coach.id)
  );

  const relevanteVasteTrainingen = useMemo(() => {
    if (!formData.datum) return [];
    const dagNamen = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    const dagIndex = new Date(formData.datum).getDay();
    return vasteTrainingen.filter(v => v.dag === dagNamen[dagIndex]);
  }, [formData.datum, vasteTrainingen]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800">
             {vasteTab === 'vaste-planning' ? 'Trainingsmoment' : 'Afwijking'} {editingItem ? 'Aanpassen' : 'Toevoegen'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(e, formData); }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-left">
          
          {vasteTab === 'vaste-planning' ? (
            <>
              {/* GROEP SELECTIE */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Groep</label>
                <select name="groepId" value={formData.groepId} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20 mt-1">
                  <option value="">Selecteer groep...</option>
                  {groepen.map(g => <option key={g.id} value={g.id}>{g.naam}</option>)}
                </select>
              </div>

              {/* COACHES ZOEK EN TAGS (Gelijk aan GroepenModal) */}
              <div className="relative" ref={dropdownRef}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1">Coaches</label>
                
                {/* Geselecteerde Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.coachIds?.map(id => {
                    const coach = coaches.find(c => c.id === id);
                    return (
                      <span key={id} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-100">
                        {coach?.naam}
                        <button type="button" onClick={() => removeCoach(id)} className="hover:text-indigo-900">
                          <X size={14} />
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* Zoekveld */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Zoek coach..." 
                    value={coachSearch}
                    onChange={(e) => { setCoachSearch(e.target.value); setShowCoachDropdown(true); }}
                    onFocus={() => setShowCoachDropdown(true)}
                    className="w-full bg-slate-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 ring-indigo-500/20"
                  />
                </div>

                {/* Dropdown Resultaten */}
                {showCoachDropdown && coachSearch && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto p-2">
                    {filteredCoaches.length > 0 ? (
                      filteredCoaches.map(coach => (
                        <button
                          key={coach.id}
                          type="button"
                          onClick={() => addCoach(coach.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-sm text-slate-700 font-medium"
                        >
                          <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <User size={14} />
                          </div>
                          {coach.naam}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-slate-400 italic text-center">Geen coaches gevonden</div>
                    )}
                  </div>
                )}
              </div>

              {/* DAG & ZAAL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dag</label>
                  <select name="dag" value={formData.dag} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1">
                    {dagen.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Zaal</label>
                  <select name="locatieId" value={formData.locatieId} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1">
                    <option value="">Kies zaal...</option>
                    {locaties.map(l => <option key={l.id} value={l.id}>{l.naam}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Startuur</label>
                  <input type="time" name="startUur" value={formData.startUur} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Einduur</label>
                  <input type="time" name="eindUur" value={formData.eindUur} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>
            </>
          ) : (
            /* AFWIJKINGEN SECTIE (ongewijzigd) */
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Datum</label>
                <input type="date" name="datum" value={formData.datum} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1" />
              </div>
              {/* ... de rest van de afwijkingen velden uit de vorige code ... */}
            </>
          )}

          <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all mt-4">
            Opslaan
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrainingsPlanningModal;
