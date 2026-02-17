import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CalendarDays } from 'lucide-react';

const SeizoenModal = ({ show, onClose, onSubmit, editingItem, handleDeleteAllPlanned }) => {
  const [formData, setFormData] = useState({
    naam: '',
    startDatum: '',
    eindDatum: '',
    startTrainingen: '',
    eindTrainingen: ''
  });

  // Synchroniseer formulier als we gaan bewerken
  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({ naam: '', startDatum: '', eindDatum: '', startTrainingen: '', eindTrainingen: '' });
    }
  }, [editingItem, show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-indigo-600" size={20} />
            <h2 className="text-lg font-black text-slate-800">
              {editingItem ? 'Seizoen Bewerken' : 'Nieuw Seizoen'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Naam Seizoen</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.naam}
              onChange={e => setFormData({...formData, naam: e.target.value})}
              placeholder="bv. 2025-2026"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Startdatum</label>
              <input 
                type="date" 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl"
                value={formData.startDatum}
                onChange={e => setFormData({...formData, startDatum: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Einddatum</label>
              <input 
                type="date" 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl"
                value={formData.eindDatum}
                onChange={e => setFormData({...formData, eindDatum: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Trainingen</label>
              <input 
                type="date" 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl"
                value={formData.startTrainingen}
                onChange={e => setFormData({...formData, startTrainingen: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Einde Trainingen</label>
              <input 
                type="date" 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl"
                value={formData.eindTrainingen}
                onChange={e => setFormData({...formData, eindTrainingen: e.target.value})}
              />
            </div>
          </div>

          {editingItem && (
            <div className="pt-4 mt-4 border-t border-slate-50">
               <button 
                type="button"
                onClick={() => handleDeleteAllPlanned(editingItem)}
                className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
              >
                <AlertTriangle size={16}/> Verwijder alle planningen
              </button>
            </div>
          )}

          <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
            {editingItem ? 'Wijzigingen Opslaan' : 'Seizoen Toevoegen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SeizoenModal;
