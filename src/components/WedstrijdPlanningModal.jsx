import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Trophy, MapPin } from 'lucide-react';

const WedstrijdModal = ({ show, onClose, onSubmit, editingItem, groepen, activeSeasonId }) => {
  const [formData, setFormData] = useState({});
  const [groupSearch, setGroupSearch] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (show) {
      if (editingItem) {
        setFormData({ ...editingItem, groepIds: editingItem.groepIds || [] });
      } else {
        setFormData({
          seizoenId: activeSeasonId,
          datum: '',
          naam: '',
          locatieNaam: '',
          straat: '',
          huisnummer: '',
          postcode: '',
          gemeente: '',
          groepIds: []
        });
      }
    }
  }, [show, editingItem, activeSeasonId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addGroup = (id) => {
    if (!formData.groepIds.includes(id)) {
      setFormData(prev => ({ ...prev, groepIds: [...prev.groepIds, id] }));
    }
    setGroupSearch('');
    setShowGroupDropdown(false);
  };

  const removeGroup = (id) => {
    setFormData(prev => ({ ...prev, groepIds: prev.groepIds.filter(gId => gId !== id) }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Trophy className="text-indigo-600" size={20}/>
            {editingItem ? 'Wedstrijd Aanpassen' : 'Wedstrijd Toevoegen'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(e, formData); }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Datum</label>
            <input type="date" name="datum" value={formData.datum} onChange={handleChange} required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Naam Wedstrijd</label>
            <input type="text" name="naam" value={formData.naam} onChange={handleChange} required placeholder="bv. Vlaams Kampioenschap" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1" />
          </div>

          <div className="pt-2 border-t border-slate-50">
            <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest ml-1">Locatie Details</label>
            <input type="text" name="locatieNaam" value={formData.locatieNaam} onChange={handleChange} required placeholder="Naam sporthal/stadion" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm mt-1" />
            
            <div className="grid grid-cols-3 gap-2 mt-2">
              <input type="text" name="straat" value={formData.straat} onChange={handleChange} placeholder="Straat" className="col-span-2 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
              <input type="text" name="huisnummer" value={formData.huisnummer} onChange={handleChange} placeholder="Nr" className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <input type="text" name="postcode" value={formData.postcode} onChange={handleChange} placeholder="Postcode" className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
              <input type="text" name="gemeente" value={formData.gemeente} onChange={handleChange} placeholder="Gemeente" className="col-span-2 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-1">Deelnemende Groepen</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.groepIds?.map(id => (
                <span key={id} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                  {groepen.find(g => g.id === id)?.naam}
                  <button type="button" onClick={() => removeGroup(id)}><X size={14} /></button>
                </span>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Zoek groep..." 
                value={groupSearch}
                onChange={(e) => { setGroupSearch(e.target.value); setShowGroupDropdown(true); }}
                onFocus={() => setShowGroupDropdown(true)}
                className="w-full bg-slate-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm"
              />
              {showGroupDropdown && groupSearch && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto p-2">
                  {groepen.filter(g => g.naam.toLowerCase().includes(groupSearch.toLowerCase()) && !formData.groepIds.includes(g.id)).map(g => (
                    <button key={g.id} type="button" onClick={() => addGroup(g.id)} className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl text-sm font-medium">{g.naam}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 transition-all mt-6">
            Wedstrijd Opslaan
          </button>
        </form>
      </div>
    </div>
  );
};

export default WedstrijdModal;
