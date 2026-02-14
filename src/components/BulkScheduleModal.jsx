import React from 'react';
import { X, CalendarCheck } from 'lucide-react';

const BulkScheduleModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  seizoenen, 
  selectedSeasonId, 
  setSelectedSeasonId, 
  activeSeasonId, 
  vasteTrainingen, 
  selectedVasteIds, 
  setSelectedVasteIds 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CalendarCheck size={24} />
            <h2 className="text-lg font-black uppercase tracking-tight">Bulk Inplanning</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Kies Seizoen</label>
            <select 
              value={selectedSeasonId || activeSeasonId} 
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              {seizoenen.map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Selecteer Wekelijkse Trainingen</label>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {vasteTrainingen.map(v => (
                <label key={v.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedVasteIds.includes(v.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedVasteIds.includes(v.id)}
                    onChange={(e) => {
                      if(e.target.checked) setSelectedVasteIds([...selectedVasteIds, v.id]);
                      else setSelectedVasteIds(selectedVasteIds.filter(id => id !== v.id));
                    }}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{v.groepNaam}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{v.dag} • {v.startUur}-{v.eindUur}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
            GENEREER PLANNING
          </button>
        </form>
      </div>
    </div>
  );
};

export default BulkScheduleModal;
