import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';

const CoachModal = ({ show, onClose, onSubmit, editingItem }) => {
  const [formData, setFormData] = useState({
    naam: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({ naam: '' });
    }
  }, [editingItem, show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="text-indigo-600" size={20} />
            <h2 className="text-lg font-black text-slate-800">
              {editingItem ? 'Coach Bewerken' : 'Nieuwe Coach'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Volledige Naam</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.naam}
              onChange={e => setFormData({...formData, naam: e.target.value})}
              placeholder="bv. Jan Janssen"
              required
            />
          </div>

          {/* Je kunt hier later makkelijk velden toevoegen zoals email of gsm */}

          <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all mt-4">
            {editingItem ? 'Wijzigingen Opslaan' : 'Coach Toevoegen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CoachModal;
