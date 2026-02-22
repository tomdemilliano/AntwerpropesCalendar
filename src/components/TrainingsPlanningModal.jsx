import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

const TrainingsPlanningModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  editingItem, 
  vasteTab, 
  groepen, 
  locaties, 
  vasteTrainingen, 
  activeSeasonId 
}) => {
  const [formData, setFormData] = useState({});
  const dagen = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

  // Initialisatie van het formulier
  useEffect(() => {
    if (show) {
      if (editingItem) {
        setFormData(editingItem);
      } else {
        setFormData({
          seizoenId: activeSeasonId,
          groepId: '',
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Logica voor 'Afwijkingen': Filter de vaste trainingen op basis van de gekozen datum
  const relevanteVasteTrainingen = useMemo(() => {
    if (!formData.datum) return [];
    
    const datumObj = new Date(formData.datum);
    const dagIndex = datumObj.getDay(); // 0 is zondag
    const dagNamenDertussen = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    const geselecteerdeDagNaam = dagNamenDertussen[dagIndex];

    return vasteTrainingen.filter(v => v.dag === geselecteerdeDagNaam);
  }, [formData.datum, vasteTrainingen]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800">
            {editingItem ? 'Planning Aanpassen' : (vasteTab === 'vaste-planning' ? 'Nieuwe Vaste Training' : 'Nieuwe Afwijking')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(e, formData); }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {vasteTab === 'vaste-planning' ? (
            /* VASTE PLANNING VELDEN */
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Groep</label>
                <select name="groepId" value={formData.groepId} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20">
                  <option value="">Selecteer groep...</option>
                  {groepen.map(g => <option key={g.id} value={g.id}>{g.naam}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Dag</label>
                <select name="dag" value={formData.dag} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20">
                  {dagen.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Startuur</label>
                  <input type="time" name="startUur" value={formData.startUur} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Einduur</label>
                  <input type="time" name="eindUur" value={formData.eindUur} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Zaal</label>
                <select name="locatieId" value={formData.locatieId} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20">
                  <option value="">Selecteer zaal...</option>
                  {locaties.map(l => <option key={l.id} value={l.id}>{l.naam}</option>)}
                </select>
              </div>
            </>
          ) : (
            /* AFWIJKINGEN VELDEN */
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Datum</label>
                <input type="date" name="datum" value={formData.datum} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Oorspronkelijke Training</label>
                <select 
                  name="vasteTrainingId" 
                  value={formData.vasteTrainingId} 
                  onChange={handleChange} 
                  required 
                  disabled={!formData.datum}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20 disabled:opacity-50"
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reden (optioneel)</label>
                <input type="text" name="reden" value={formData.reden} onChange={handleChange} placeholder="bv. Feestdag, coach afwezig..." className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20" />
              </div>

              <div className="pt-2 border-t border-slate-50 mt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status / Actie</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-indigo-600 focus:ring-2 ring-indigo-500/20 mt-1">
                  <option value="te behandelen">Nog te behandelen</option>
                  <option value="geannuleerd">Training annuleren</option>
                  <option value="gewijzigd">Verplaatsen naar andere zaal/uur</option>
                </select>
              </div>

              {formData.status === 'gewijzigd' && (
                <div className="bg-indigo-50/50 p-4 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Nieuwe Zaal</label>
                    <select name="nieuweLocatieId" value={formData.nieuweLocatieId} onChange={handleChange} required className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20">
                      <option value="">Selecteer nieuwe zaal...</option>
                      {locaties.map(l => <option key={l.id} value={l.id}>{l.naam}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Nieuw Startuur</label>
                      <input type="time" name="nieuwStartUur" value={formData.nieuwStartUur} onChange={handleChange} required className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Nieuw Einduur</label>
                      <input type="time" name="nieuwEindUur" value={formData.nieuwEindUur} onChange={handleChange} required className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all mt-4 transform active:scale-[0.98]">
            {editingItem ? 'Wijzigingen Opslaan' : 'Toevoegen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrainingsPlanningModal;
