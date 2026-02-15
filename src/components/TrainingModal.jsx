import React from 'react';
import { X, Calendar } from 'lucide-react';

const TrainingModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  newTraining, 
  setNewTraining, 
  groepen, 
  coaches, 
  locaties 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800">Training Toevoegen</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* DATUM VELD TOEGEVOEGD */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Datum</label>
            <input 
              type="date" 
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={newTraining.datum}
              onChange={e => setNewTraining({...newTraining, datum: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Groep</label>
            <select 
              required 
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
              value={newTraining.groepId}
              onChange={e => setNewTraining({...newTraining, groepId: e.target.value})}
            >
              <option value="">Kies groep...</option>
              {groepen.map(g => <option key={g.id} value={g.id}>{g.naam}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Coach</label>
              <select 
                required 
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                value={newTraining.coachId}
                onChange={e => setNewTraining({...newTraining, coachId: e.target.value})}
              >
                <option value="">Coach...</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.voornaam} {c.achternaam}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Uren</label>
              <input 
                type="text" 
                placeholder="bv. 14u-16u" 
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                value={newTraining.uren}
                onChange={e => setNewTraining({...newTraining, uren: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Locatie</label>
            <select 
              required 
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
              value={newTraining.locatieId}
              onChange={e => setNewTraining({...newTraining, locatieId: e.target.value})}
            >
              <option value="">Locatie...</option>
              {locaties.map(l => <option key={l.id} value={l.id}>{l.naam}</option>)}
            </select>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-2">
            Toevoegen aan kalender
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrainingModal;
