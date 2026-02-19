import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ZaalPlanningModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  editingItem, 
  zaalTab, 
  uitzonderingType, 
  locaties,
  beschikbareZalen // We hebben de vaste planning nodig om te kunnen koppelen bij onbeschikbaarheid
}) => {
  const [formData, setFormData] = useState({});

  const zaalDeelOpties = ['Volledige zaal', '1/3de zaal', '2/3de zaal', '1/2de zaal'];
  const dagen = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

  // Reset/Initialisatie logica
  useEffect(() => {
    if (show) {
      if (editingItem) {
        setFormData(editingItem);
      } else {
        // Alles leeg laten zoals gevraagd (leeg object of lege strings)
        setFormData({
          locatieId: '',
          zaaldelen: '',
          dag: '',
          startUur: '',
          eindUur: '',
          huurprijs: '',
          datum: '',
          type: uitzonderingType, // 'extra' of 'onbeschikbaar'
          reden: '',
          gekoppeldeVasteId: '' // Voor de dropdown logica
        });
      }
    }
  }, [show, editingItem, uitzonderingType]);

  // Logica voor de dropdown "Ingeplande momenten" bij onbeschikbaarheid
  const getRelevanteVasteMomenten = () => {
    if (!formData.datum) return [];
    const datumObj = new Date(formData.datum);
    const dagNaam = dagen[(datumObj.getDay() + 6) % 7]; // Correcte dagnaam bepalen (Maandag=0)
    
    return beschikbareZalen.filter(zaal => zaal.dag === dagNaam);
  };

  const handleVasteMomentSelectie = (id) => {
    const gekozenVaste = beschikbareZalen.find(v => v.id === id);
    if (gekozenVaste) {
      setFormData(prev => ({
        ...prev,
        gekoppeldeVasteId: id,
        locatieId: gekozenVaste.locatieId,
        zaaldelen: gekozenVaste.zaaldelen,
        startUur: gekozenVaste.startUur,
        eindUur: gekozenVaste.eindUur,
        huurprijs: gekozenVaste.huurprijs
      }));
    }
  };

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Automatische koppeling als datum verandert bij onbeschikbaarheid
    if (name === 'datum' && uitzonderingType === 'onbeschikbaar') {
      // De useEffect of getRelevanteVasteMomenten zorgt dat de lijst update.
      // We kunnen hier eventueel de eerste automatisch selecteren als er maar 1 is.
    }
  };

  const getTitel = () => {
    if (editingItem) return 'Planning bewerken';
    if (zaalTab === 'weekplanning') return 'Vaste zaalplanning toevoegen';
    return uitzonderingType === 'extra' ? 'Extra zaal' : 'Zaal onbeschikbaar';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800">{getTitel()}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* DATUM / DAG SECTIE */}
          {zaalTab === 'weekplanning' ? (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Weekdag</label>
              <select name="dag" value={formData.dag} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20">
                <option value="">Selecteer dag...</option>
                {dagen.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Datum</label>
              <input type="date" name="datum" value={formData.datum} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20" />
            </div>
          )}

          {/* SPECIFIEK VOOR ONBESCHIKBAARHEID: DE KOPPELING */}
          {zaalTab === 'uitzonderingen' && uitzonderingType === 'onbeschikbaar' && formData.datum && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ingeplande momenten (op deze dag)</label>
              <select 
                value={formData.gekoppeldeVasteId} 
                onChange={(e) => handleVasteMomentSelectie(e.target.value)}
                className="w-full bg-indigo-50/50 border-indigo-100 border rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20"
              >
                <option value="">Selecteer een vast moment...</option>
                {getRelevanteVasteMomenten().map(v => (
                  <option key={v.id} value={v.id}>{locaties.find(l => l.id === v.locatieId)?.naam} ({v.startUur}-{v.eindUur})</option>
                ))}
              </select>
            </div>
          )}

          {/* LOCATIE & ZAALDELEN */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Locatie</label>
              <select name="locatieId" value={formData.locatieId} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20">
                <option value="">Kies locatie...</option>
                {locaties.map(l => <option key={l.id} value={l.id}>{l.naam}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Zaaldelen</label>
              <select name="zaaldelen" value={formData.zaaldelen} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20">
                <option value="">Kies deel...</option>
                {zaalDeelOpties.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* UREN OP 1 LIJN */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Beginuur</label>
              <input type="time" name="startUur" value={formData.startUur} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Einduur</label>
              <input type="time" name="eindUur" value={formData.eindUur} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20" />
            </div>
          </div>

          {/* REDEN (enkel bij uitzonderingen) */}
          {zaalTab === 'uitzonderingen' && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reden</label>
              <input name="reden" value={formData.reden} onChange={handleChange} placeholder="bv. Carnaval, Feestdag..." className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20" />
            </div>
          )}

          {/* HUURPRIJS */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Huurprijs (€)</label>
            <input type="number" name="huurprijs" value={formData.huurprijs} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-indigo-500/20" />
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all mt-4">
            {editingItem ? 'Wijzigingen Opslaan' : 'Toevoegen aan planning'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ZaalPlanningModal;
