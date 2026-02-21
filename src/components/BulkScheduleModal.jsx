import React from 'react';
import { X, CalendarCheck, CheckCircle2 } from 'lucide-react';

const BulkScheduleModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  seizoenen, 
  activeSeasonId, // We gebruiken enkel nog het actieve seizoen
  vasteTrainingen, 
  selectedVasteIds, 
  setSelectedVasteIds,
  includeAfwijkingen,
  setIncludeAfwijkingen
}) => {
  if (!show) return null;

  // Huidig seizoen ophalen voor de titel/context
  const huidigSeizoen = seizoenen.find(s => s.id === activeSeasonId);

  // Hulpvariabele voor sorteren op weekdag (Maandag eerst)
  const dagVolgorde = { 'Maandag': 1, 'Dinsdag': 2, 'Woensdag': 3, 'Donderdag': 4, 'Vrijdag': 5, 'Zaterdag': 6, 'Zondag': 7 };

  // Sorteer de vaste trainingen: eerst op dag, dan op beginuur
  const gesorteerdeTrainingen = [...vasteTrainingen].sort((a, b) => {
    if (dagVolgorde[a.dag] !== dagVolgorde[b.dag]) {
      return dagVolgorde[a.dag] - dagVolgorde[b.dag];
    }
    return a.startUur.localeCompare(b.startUur);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <CalendarCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">Bulk Inplanning</h2>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">
                Seizoen: {huidigSeizoen?.naam || 'Geen seizoen geselecteerd'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20}/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Trainingsmomenten Lijst */}
          <div>
            <div className="flex justify-between items-end mb-3 px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecteer Trainingsmomenten</label>
              <button 
                type="button"
                onClick={() => {
                  if (selectedVasteIds.length === gesorteerdeTrainingen.length) {
                    setSelectedVasteIds([]);
                  } else {
                    setSelectedVasteIds(gesorteerdeTrainingen.map(v => v.id));
                  }
                }}
                className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
              >
                {selectedVasteIds.length === gesorteerdeTrainingen.length ? 'Wis selectie' : 'Selecteer alles'}
              </button>
            </div>
            
            <div className="grid gap-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
              {gesorteerdeTrainingen.map(v => (
                <label 
                  key={v.id} 
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                    selectedVasteIds.includes(v.id) 
                      ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedVasteIds.includes(v.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-400'
                  }`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={selectedVasteIds.includes(v.id)}
                      onChange={(e) => {
                        if(e.target.checked) setSelectedVasteIds([...selectedVasteIds, v.id]);
                        else setSelectedVasteIds(selectedVasteIds.filter(id => id !== v.id));
                      }}
                    />
                    {selectedVasteIds.includes(v.id) && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  
                  <div className="flex flex-col">
                    {/* Trainingsgroep is nu prominent aanwezig */}
                    <span className="text-sm font-black text-slate-700 leading-tight">
                      {v.groepNaam}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                      {v.dag} • {v.startUur} - {v.eindUur}
                    </span>
                  </div>
                </label>
              ))}
              {gesorteerdeTrainingen.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">Geen vaste trainingsmomenten gevonden voor dit seizoen.</p>
              )}
            </div>
          </div>

          {/* Optie voor Afwijkingen */}
          <div className="pt-2">
            <label className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
              includeAfwijkingen ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
            }`}>
              <input 
                type="checkbox" 
                checked={includeAfwijkingen}
                onChange={(e) => setIncludeAfwijkingen(e.target.checked)}
                className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-amber-900 leading-tight">Jaarplanning toepassen</span>
                <span className="text-[10px] text-amber-700 font-medium uppercase tracking-tighter mt-0.5">
                  Inclusief schrappingen & wijzigingen
                </span>
              </div>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={selectedVasteIds.length === 0}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Planning Genereren
          </button>
        </form>
      </div>
    </div>
  );
};

export default BulkScheduleModal;
