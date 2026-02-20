import React, { useState, useEffect } from 'react';
import { X, MapPin, Euro, Plus, Trash2, Home, Mail, FileText, Info } from 'lucide-react';

const LocatieModal = ({ show, onClose, onSubmit, editingItem }) => {
  const [formData, setFormData] = useState({
    naam: '',
    adres: '',      // straat + nr
    stad: '',       // postcode + gemeente
    email: '',
    reservatieVia: '',
    opmerkingen: '',
    trainingslocaties: []
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        ...editingItem,
        trainingslocaties: editingItem.trainingslocaties || []
      });
    } else {
      setFormData({ 
        naam: '', adres: '', stad: '', email: '', 
        reservatieVia: '', opmerkingen: '', trainingslocaties: [] 
      });
    }
  }, [editingItem, show]);

  const addSubLocatie = () => {
    setFormData({
      ...formData,
      trainingslocaties: [
        ...formData.trainingslocaties,
        { id: Date.now(), naam: '', zaaldeel: 'Volledige zaal', afmeting: '', ondergrond: '', uurtarief: '' }
      ]
    });
  };

  const removeSubLocatie = (id) => {
    setFormData({
      ...formData,
      trainingslocaties: formData.trainingslocaties.filter(loc => loc.id !== id)
    });
  };

  const updateSubLocatie = (id, field, value) => {
    setFormData({
      ...formData,
      trainingslocaties: formData.trainingslocaties.map(loc => 
        loc.id === id ? { ...loc, [field]: value } : loc
      )
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header & Form zoals voorheen... */}
        <form onSubmit={(e) => onSubmit(e, formData)} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Naam Locatie</label>
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl" 
                value={formData.naam} onChange={e => setFormData({...formData, naam: e.target.value})} required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Straat en Huisnummer</label>
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl" 
                value={formData.adres} onChange={e => setFormData({...formData, adres: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Postcode en Gemeente</label>
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl" 
                value={formData.stad} onChange={e => setFormData({...formData, stad: e.target.value})} />
            </div>
          </div>

          <div>
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reservatie via (Multi-line)</label>
             <textarea className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl h-20" 
               value={formData.reservatieVia} onChange={e => setFormData({...formData, reservatieVia: e.target.value})} />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Trainingslocaties (Zalen)</h3>
              <button type="button" onClick={addSubLocatie} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">
                <Plus size={14}/> Zaal toevoegen
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.trainingslocaties.map((loc, index) => (
                <div key={loc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                  <button type="button" onClick={() => removeSubLocatie(loc.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16}/>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Naam zaal (bv. Grote Zaal)" className="p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                      value={loc.naam} onChange={e => updateSubLocatie(loc.id, 'naam', e.target.value)} />
                    <select className="p-2 bg-white border border-slate-200 rounded-lg text-sm"
                      value={loc.zaaldeel} onChange={e => updateSubLocatie(loc.id, 'zaaldeel', e.target.value)}>
                      <option>Volledige zaal</option>
                      <option>1/2de zaal</option>
                      <option>1/3de zaal</option>
                      <option>2/3de zaal</option>
                    </select>
                    <input placeholder="Afmeting (bv. 20x40m)" className="p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                      value={loc.afmeting} onChange={e => updateSubLocatie(loc.id, 'afmeting', e.target.value)} />
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">€</span>
                      <input type="number" placeholder="Uurtarief" className="w-full p-2 pl-6 bg-white border border-slate-200 rounded-lg text-sm" 
                        value={loc.uurtarief} onChange={e => updateSubLocatie(loc.id, 'uurtarief', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
            {editingItem ? 'Locatie Bijwerken' : 'Locatie Opslaan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocatieModal;
