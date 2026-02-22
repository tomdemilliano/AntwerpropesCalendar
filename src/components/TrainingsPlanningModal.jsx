import React, { useState, useEffect, useMemo } from 'react';
import { X, User } from 'lucide-react';

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
  const dagen = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

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

  const toggleCoach = (coachId) => {
    const currentIds = formData.coachIds || [];
    const newIds = currentIds.includes(coachId)
      ? currentIds.filter(id => id !== coachId)
      : [...currentIds, coachId];
    setFormData(prev => ({ ...prev, coachIds: newIds }));
  };

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
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Groep</label>
                <select name="groepId" value={formData.groepId} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20 mt-1">
                  <option value="">Selecteer groep...</option>
                  {groepen.map(g => <option key={g.id} value={g.id}>{g.naam}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Coaches</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  {coaches.map(coach => (
                    <button key={coach.id} type="button" onClick={() => toggleCoach(coach.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.coachIds?.includes(coach.id) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200'}`}>
                      <User size={12} /> {coach.naam}
                    </button>
                  ))}
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Zaal</label>
                  <select name="locatieId" value={formData.locatieId} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1">
                    <option value="">Kies zaal...</option>
                    {locaties.map(l => <option key={l.id} value={l.id}>{l.naam}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="time" name="startUur" value={formData.startUur} onChange={handleChange} required className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
                <input type="time" name="eindUur" value={formData.eindUur} onChange={handleChange} required className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
              </div>
            </>
          ) : (
            /* Afwijkingen Sectie */
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Datum</label>
                <input type="date" name="datum" value={formData.datum} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Oorspronkelijke Training</label>
                <select name="vasteTrainingId" value={formData.vasteTrainingId} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1">
                  <option value="">Selecteer training...</option>
                  {relevanteVasteTrainingen.map(v => (
                    <option key={v.id} value={v.id}>{groepen.find(g => g.id === v.groepId)?.naam} ({v.startUur})</option>
                  ))}
                </select>
              </div>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-indigo-600 mt-2">
                <option value="te behandelen">Nog te behandelen</option>
                <option value="geannuleerd">Training annuleren</option>
                <option value="gewijzigd">Verplaatsen naar andere zaal/uur</option>
              </select>
              {formData.status === 'gewijzigd' && (
                <div className="bg-indigo-50/50 p-4 rounded-2xl space-y-3">
                   <select name="nieuweLocatieId" value={formData.nieuweLocatieId} onChange={handleChange} className="w-full rounded-xl border-none text-sm px-4 py-2">
                     <option value="">Nieuwe zaal...</option>
                     {locaties.map(l => <option key={l.id} value={l.id}>{l.naam}</option>)}
                   </select>
                   <div className="grid grid-cols-2 gap-2">
                     <input type="time" name="nieuwStartUur" value={formData.nieuwStartUur} onChange={handleChange} className="rounded-xl border-none text-sm" />
                     <input type="time" name="nieuwEindUur" value={formData.nieuwEindUur} onChange={handleChange} className="rounded-xl border-none text-sm" />
                   </div>
                </div>
              )}
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
