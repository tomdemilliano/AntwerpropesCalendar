import React, { useState } from 'react';
import { X, CalendarCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  includeExceptions, // Nieuwe prop
  setIncludeExceptions // Nieuwe prop
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <CalendarCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-tight leading-none">Bulk Inplanning</h2>
              <p className="text-indigo-100 text-xs mt-1 font-medium">Genereer kalender op basis van vaste uren</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X size={24}/>
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-8 space-y-8">
          {/* Seizoen Selectie */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-indigo-500" />
              Kies Seizoen
            </label>
            <select 
              value={selectedSeasonId || activeSeasonId} 
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-semibold text-slate-700 focus:border-indigo-500 focus:ring-0 outline-none transition-all appearance-none cursor-pointer"
            >
              {seizoenen.map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
            </select>
          </div>

          {/* Trainingsmomenten Lijst */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <AlertCircle size={14} className="text-indigo-500" />
              Selecteer Wekelijkse Trainingen
            </label>
            <div className="max-h-72 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {vasteTrainingen.map(v => (
                <label key={v.id} className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedVasteIds.includes(v.id) ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={selectedVasteIds.includes(v.id)}
                      onChange={(e) => {
                        if(e.target.checked) setSelectedVasteIds([...selectedVasteIds, v.id]);
                        else setSelectedVasteIds(selectedVasteIds.filter(id => id !== v.id));
                      }}
                      className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className={`text-sm font-bold ${selectedVasteIds.includes(v.id) ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {v.groepNaam}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md font-bold uppercase tracking-wider">{v.dag}</span>
                      <span className="text-[11px] font-semibold text-slate-400">{v.startUur} - {v.eindUur}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Afwijkingen Checkbox */}
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
             <input 
                type="checkbox" 
                id="exceptions"
                checked={includeExceptions}
                onChange={(e) => setIncludeExceptions(e.target.checked)}
                className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
             />
             <label htmlFor="exceptions" className="text-sm font-bold text-amber-800 cursor-pointer select-none">
                Ook afwijkingen (geschrapt/gewijzigd) inplannen
             </label>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.25rem] font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:translate-y-[-2px] active:translate-y-[0px] transition-all uppercase tracking-widest">
            GENEREER PLANNING
          </button>
        </form>
      </div>
    </div>
  );
};

export default BulkScheduleModal;
