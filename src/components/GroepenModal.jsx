import React, { useState, useEffect } from 'react';
import { X, Users, hash } from 'lucide-react';

const GroepenModal = ({ show, onClose, onSubmit, editingItem, coaches }) => {
  const [formData, setFormData] = useState({
    naam: '',
    type: '',
    aantalSpringers: '',
    coachIds: []
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        naam: editingItem.naam || '',
        type: editingItem.type || '',
        aantalSpringers: editingItem.aantalSpringers || '',
        coachIds: editingItem.coachIds || []
      });
    } else {
      setFormData({ naam: '', type: '', aantalSpringers: '', coachIds: [] });
    }
  }, [editingItem, show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, formData);
  };

  const toggleCoach = (coachId) => {
    setFormData(prev => ({
      ...prev,
      coachIds: prev.coachIds.includes(coachId)
        ? prev.coachIds.filter(id => id !== coachId)
        : [...prev.coachIds, coachId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800">
            {editingItem ? 'Groep bewerken' : 'Nieuwe groep toevoegen'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={20}/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Naam Groep</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600"
              value={formData.naam}
              onChange={e => setFormData({...formData, naam: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="">Selecteer type...</option>
              <option value="Recreatief">Recreatief</option>
              <option value="Wedstrijd">Wedstrijd</option>
              <option value="Demo">Demo</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Aantal Springers</label>
            <input 
              type="number" 
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600"
              value={formData.aantalSpringers}
              onChange={e => setFormData({...formData, aantalSpringers: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Coaches</label>
            <div className="grid grid-cols-2 gap-2">
              {coaches.map(coach => (
                <div 
                  key={coach.id}
                  onClick={() => toggleCoach(coach.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                    formData.coachIds.includes(coach.id)
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${formData.coachIds.includes(coach.id) ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                  <span className="text-xs font-bold truncate">{coach.naam}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all mt-4">
            {editingItem ? 'Wijzigingen Opslaan' : 'Groep Toevoegen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroepenModal;
