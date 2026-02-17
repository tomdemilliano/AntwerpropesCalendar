import React, { useState, useEffect } from 'react';
import { X, MapPin, Euro } from 'lucide-react';

const LocatieModal = ({ show, onClose, onSubmit, editingItem }) => {
  const [formData, setFormData] = useState({
    naam: '',
    straat: '',
    huisnummer: '',
    gemeente: '',
    uurtarief: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        naam: editingItem.naam || '',
        straat: editingItem.straat || '',
        huisnummer: editingItem.huisnummer || '',
        gemeente: editingItem.gemeente || '',
        uurtarief: editingItem.uurtarief || ''
      });
    } else {
      setFormData({ naam: '', straat: '', huisnummer: '', gemeente: '', uurtarief: '' });
    }
  }, [editingItem, show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // We sturen de data exact door zoals de database het verwacht
    onSubmit(e, formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <MapPin className="text-indigo-600" size={20} />
            <h2 className="text-lg font-black text-slate-800">
              {editingItem ? 'Locatie Bewerken' : 'Nieuwe Locatie'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Naam Locatie</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.naam}
              onChange={e => setFormData({...formData, naam: e.target.value})}
              placeholder="bv. Sporthal De Ring"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Straat</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                value={formData.straat}
                onChange={e => setFormData({...formData, straat: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nr.</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                value={formData.huisnummer}
                onChange={e => setFormData({...formData, huisnummer: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gemeente</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
              value={formData.gemeente}
              onChange={e => setFormData({...formData, gemeente: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Huurprijs per uur (€)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Euro size={16}/></span>
              <input 
                type="number" 
                step="0.01"
                className="w-full p-3 pl-10 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                value={formData.uurtarief}
                onChange={e => setFormData({...formData, uurtarief: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all mt-4">
            {editingItem ? 'Wijzigingen Opslaan' : 'Locatie Toevoegen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocatieModal;
