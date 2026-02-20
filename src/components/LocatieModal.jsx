import React, { useState, useEffect } from 'react';
import { X, MapPin, Plus, Trash2, Mail, Info, AlignLeft, Building2 } from 'lucide-react';

const LocatieModal = ({ show, onClose, onSubmit, editingItem }) => {
  const [activeTab, setActiveTab] = useState('algemeen');
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
    setActiveTab('algemeen'); // Reset naar eerste tab bij openen
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

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
        activeTab === id 
          ? 'bg-indigo-600 text-white shadow-md' 
          : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <MapPin size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {editingItem ? 'Locatie bewerken' : 'Nieuwe locatie'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigatie */}
        <div className="flex gap-2 p-4 bg-slate-50/50 border-b border-slate-100">
          <TabButton id="algemeen" label="Algemeen" icon={Info} />
          <TabButton id="reservatie" label="Reservatie" icon={AlignLeft} />
          <TabButton id="zalen" label={`Zalen (${formData.trainingslocaties.length})`} icon={Building2} />
        </div>

        <form onSubmit={(e) => onSubmit(e, formData)} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 min-h-[350px]">
            
            {/* TAB 1: ALGEMEEN */}
            {activeTab === 'algemeen' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nr.</label>
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mailadres contactpersoon</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={16}/></span>
                      <input type="email" className="w-full p-3 pl-10 bg-slate-50 border border-slate-100 rounded-xl outline-none" 
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RESERVATIE */}
            {activeTab === 'reservatie' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reservatie via (procedure)</label>
                  <textarea className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl h-32 outline-none resize-none focus:border-indigo-500" 
                    placeholder="Bv. via online portaal van de gemeente, of via mail naar sportdienst..."
                    value={formData.reservatieVia} onChange={e => setFormData({...formData, reservatieVia: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Extra Opmerkingen</label>
                  <textarea className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl h-32 outline-none resize-none focus:border-indigo-500" 
                    placeholder="Sleutelbeheer, lichtknoppen, etc..."
                    value={formData.opmerkingen} onChange={e => setFormData({...formData, opmerkingen: e.target.value})} />
                </div>
              </div>
            )}

{/* TAB 3: ZALEN */}
{activeTab === 'zalen' && (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div className="flex justify-between items-center mb-2">
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight">Beheer Zalen</h4>
        <p className="text-[10px] text-slate-500 italic">Eén rij per trainingsruimte</p>
      </div>
      <button 
        type="button" 
        onClick={addSubLocatie} 
        className="flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-all border border-indigo-100 shadow-sm"
      >
        <Plus size={14}/> Zaal toevoegen
      </button>
    </div>
    
    <div className="space-y-2">
      {/* Kolomtitels voor de lijst (optioneel, maar handig voor overzicht) */}
      {formData.trainingslocaties.length > 0 && (
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_40px] gap-2 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="ml-1">Naam</span>
          <span>Type/Grootte</span>
          <span>Afmeting</span>
          <span>Tarief (€)</span>
          <span></span>
        </div>
      )}

      {formData.trainingslocaties.map((loc) => (
        <div key={loc.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_40px] gap-2 items-center bg-slate-50 p-1.5 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all">
          
          {/* Naam */}
          <input 
            placeholder="bv. Grote Zaal" 
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400" 
            value={loc.naam} 
            onChange={e => updateSubLocatie(loc.id, 'naam', e.target.value)} 
          />

          {/* Type/Zaaldeel */}
          <select 
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 appearance-none"
            value={loc.zaaldeel} 
            onChange={e => updateSubLocatie(loc.id, 'zaaldeel', e.target.value)}
          >
            <option>Volledige zaal</option>
            <option>1/2de zaal</option>
            <option>1/3de zaal</option>
            <option>2/3de zaal</option>
          </select>

          {/* Afmeting */}
          <input 
            placeholder="20x40" 
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 text-center" 
            value={loc.afmeting} 
            onChange={e => updateSubLocatie(loc.id, 'afmeting', e.target.value)} 
          />

          {/* Tarief */}
          <input 
            type="number" 
            step="0.01" 
            placeholder="0.00"
            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 text-center" 
            value={loc.uurtarief} 
            onChange={e => updateSubLocatie(loc.id, 'uurtarief', e.target.value)} 
          />

          {/* Verwijderknop */}
          <button 
            type="button" 
            onClick={() => removeSubLocatie(loc.id)} 
            className="flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16}/>
          </button>
        </div>
      ))}

      {/* Lege staat */}
      {formData.trainingslocaties.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 bg-slate-50/30">
          <Building2 size={24} className="mx-auto mb-2 opacity-20" />
          <p className="text-xs">Klik op 'Zaal toevoegen' om trainingsruimtes toe te voegen.</p>
        </div>
      )}
    </div>
  </div>
)}
          </div>

          {/* Footer acties */}
          <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">
              Annuleren
            </button>
            <button type="submit" className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
              {editingItem ? 'Locatie bijwerken' : 'Locatie opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocatieModal;
