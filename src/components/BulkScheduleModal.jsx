import React, { useState } from 'react';
import { X, CalendarCheck, CheckCircle2 } from 'lucide-react';

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
  setSelectedVasteIds,
  includeAfwijkingen, // Nieuwe prop
  setIncludeAfwijkingen // Nieuwe prop
}) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <CalendarCheck size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Bulk Inplanning</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20}/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Kies Seizoen</label>
            <select 
              value={selectedSeasonId || activeSeasonId} 
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              {seizoenen.map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2 px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecteer Trainingsmomenten</label>
              <button 
                type="button"
                onClick={() => setSelectedVasteIds(selectedVasteIds.length === vasteTrainingen.length ? [] : vasteTrainingen.map(v => v.id))}
                className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
              >
                {selectedVasteIds.length === vasteTrainingen.length ? 'Selectie opheffen' : 'Selecteer alles'}
              </button>
            </div>
            <div className="grid gap-2">
              {vasteTrainingen.map(v => (
                <label 
                  key={v.id} 
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                    selectedVasteIds.includes(v.id) 
                      ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedVasteIds.includes(v.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-400'
                  }`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={selectedVasteIds.includes(v.id)}
                      onChange={(e) => {
                        if(e.target.checked) setSelectedVasteIds([...selectedVasteIds, v.id]);
                        else setSelectedVasteIds(selectedVasteIds.filter(id => id !== v.id));
                      }}
                    />
                    {selectedVasteIds.includes(v.id) && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-700">{v.groepNaam}</span>
                    <span className="text-xs text-slate-500 font-semibold">{v.dag} • {v.startUur} - {v.eindUur}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors">
              <input 
                type="checkbox" 
                checked={includeAfwijkingen}
                onChange={(e) => setIncludeAfwijkingen(e.target.checked)}
                className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-amber-900">Afwijkingen inplannen</span>
                <span className="text-[10px] text-amber-700 font-medium">Houd rekening met annulaties en verplaatsingen</span>
              </div>
            </label>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-[0.98]">
            Start Bulk Inplanning
          </button>
        </form>
      </div>
    </div>
  );
};

export default BulkScheduleModal;
