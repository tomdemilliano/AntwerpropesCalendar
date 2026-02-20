import React, { useState, useEffect } from 'react';
import { X, MapPin, Euro, Plus, Trash2, Mail, Info, AlignLeft } from 'lucide-react';

const LocatieModal = ({ show, onClose, onSubmit, editingItem }) => {
  const [formData, setFormData] = useState({
    naam: '',
    straat: '',
    huisnummer: '',
    postcode: '',
    gemeente: '',
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
        naam: '', straat: '', huisnummer: '', postcode: '', gemeente: '', 
        email: '', reservatieVia: '', opmerkingen: '', trainingslocaties: [] 
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
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header met sluitknop */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <MapPin size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {editingItem ? 'Locatie bewerken' : 'Nieuwe locatie toevoegen'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => onSubmit(e, formData)} className="p-6 space-y-5">
          {/* Algemene Info */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Naam Locatie</label>
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-indigo-500" 
                value={formData.naam} onChange={e => setFormData({...formData, naam: e.target.value})} required />
            </div>

            <div className="col-span-8">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Straat</label>
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" 
                value={formData.straat} onChange={e => setFormData({...formData, straat: e.target.value})} />
            </div>
            <div className="col-span-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Huisnummer</label>
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" 
                value={formData.huisnummer} onChange={e => setFormData({...formData, huisnummer: e.target.value})} />
            </div>

            <div className="col-span-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Postcode</label>
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" 
                value={formData.postcode} onChange={e => setFormData({...formData, postcode: e.target.value})} />
            </div>
            <div className="col-span-8">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gemeente</label>
              <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" 
                value={formData.gemeente} onChange={e => setFormData({...formData, gemeente: e.target.value})} />
            </div>

            <div className="col-span-12">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mailadres</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={16}/></span>
                <input type="email" className="w-full p-3 pl-10 bg-slate-50 border border-slate-100 rounded-xl outline-none" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reservatie via</label>
              <textarea className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl h-24 outline-none resize-none" 
                value={formData.reservatieVia} onChange={e => setFormData({...formData, reservatieVia: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Opmerkingen</label>
              <textarea className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl h-24 outline-none resize-none" 
                value={formData.opmerkingen} onChange={e => setFormData({...formData, opmerkingen: e.target.value})} />
            </div>
          </div>

          {/* Trainingslocaties Sectie */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest">Trainingslocaties / Zalen</h3>
              <button type="button" onClick={addSubLocatie} className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">
                <Plus size={14}/> Zaal toevoegen
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.trainingslocaties.map((loc) => (
                <div key={loc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                  <button type="button" onClick={() => removeSubLocatie(loc.id)} className="absolute -top-2 -right-2 bg-white text-slate-300 hover:text-red-500 shadow-sm border border-slate-100 rounded-full p-1.5 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Naam zaal" className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none" 
                      value={loc.naam} onChange={e => updateSubLocatie(loc.id, 'naam', e.target.value)} />
                    <select className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                      value={loc.zaaldeel} onChange={e => updateSubLocatie(loc.id, 'zaaldeel', e.target.value)}>
                      <option>Volledige zaal</option>
                      <option>1/2de zaal</option>
                      <option>1/3de zaal</option>
                      <option>2/3de zaal</option>
                    </select>
                    <input placeholder="Afmeting (bv. 20x40)" className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none" 
                      value={loc.afmeting} onChange={e => updateSubLocatie(loc.id, 'afmeting', e.target.value)} />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">€</span>
                      <input type="number" step="0.01" placeholder="Uurtarief" className="w-full p-2.5 pl-7 bg-white border border-slate-200 rounded-xl text-sm outline-none" 
                        value={loc.uurtarief} onChange={e => updateSubLocatie(loc.id, 'uurtarief', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              {formData.trainingslocaties.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs italic">
                  Nog geen specifieke zalen toegevoegd
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">
              Annuleren
            </button>
            <button type="submit" className="flex-[2] bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
              {editingItem ? 'Wijzigingen opslaan' : 'Locatie aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocatieModal;
