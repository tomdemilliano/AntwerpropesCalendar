import React, { useState, useEffect } from 'react';
import { X, User, Euro } from 'lucide-react';

const CoachModal = ({ show, onClose, onSubmit, editingItem }) => {
  const [formData, setFormData] = useState({
    voornaam: '',
    achternaam: '',
    uurtarief: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        voornaam: editingItem.voornaam || '',
        achternaam: editingItem.achternaam || '',
        uurtarief: editingItem.uurtarief || ''
      });
    } else {
      setFormData({ voornaam: '', achternaam: '', uurtarief: '' });
    }
  }, [editingItem, show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // We sturen ook een samengevoegd 'naam' veld mee voor de tabelweergave 
    // als je tabel dat veld gebruikt voor de 'hoofd'kolom.
    const submissionData = {
      ...formData,
      naam: `${formData.voornaam} ${formData.achternaam}`.trim()
    };
    onSubmit(e, submissionData);
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Voornaam</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.voornaam}
                onChange={e => setFormData({...formData, voornaam: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Achternaam</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.achternaam}
                onChange={e => setFormData({...formData, achternaam: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Uurtarief (€)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Euro size={16}/></span>
              <input 
                type="number" 
                step="0.01"
                className="w-full p-3 pl-10 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.uurtarief}
                onChange={e => setFormData({...formData, uurtarief: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all mt-4">
            {editingItem ? 'Wijzigingen Opslaan' : 'Coach Toevoegen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CoachModal;
