import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { GROEP_TYPES } from '../adminConfig';

const GroepenModal = ({ show, onClose, onSubmit, editingItem, coaches }) => {
  const [formData, setFormData] = useState({
    naam: '',
    type: '',
    aantalSpringers: '',
    coachIds: [],
    kleur: '#6366f1' // Standaard indigo kleur
  });
  const [searchQuery, setSearchQuery] = useState('');
  const colorOptions = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981', 
    '#3b82f6', '#8b5cf6', '#ef4444', '#64748b'
  ];

  useEffect(() => {
    if (editingItem) {
      setFormData({
        naam: editingItem.naam || '',
        type: editingItem.type || '',
        aantalSpringers: editingItem.aantalSpringers || '',
        coachIds: editingItem.coachIds || [],
        kleur: editingItem.kleur || '#6366f1'
      });
    } else {
      setFormData({ naam: '', type: '', aantalSpringers: '', coachIds: [], kleur: '#6366f1' });
    }
    setSearchQuery('');
  }, [editingItem, show]);

  if (!show) return null;

  // Filter coaches op basis van zoekopdracht en sluit coaches uit die al geselecteerd zijn
  const availableCoaches = coaches.filter(c => 
    c && c.naam &&
    c.naam.toLowerCase().includes(searchQuery.toLowerCase()) && 
    !formData.coachIds.includes(c.id)
  );

  const addCoach = (id) => {
    setFormData(prev => ({ ...prev, coachIds: [...prev.coachIds, id] }));
    setSearchQuery('');
  };

  const removeCoach = (id) => {
    setFormData(prev => ({ ...prev, coachIds: prev.coachIds.filter(cId => cId !== id) }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-left">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="text-lg font-black text-slate-800">
            {editingItem ? 'Groep bewerken' : 'Nieuwe groep'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20}/>
          </button>
        </div>
        
        <form onSubmit={(e) => onSubmit(e, formData)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Basis Velden */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Naam Groep</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600 transition-all"
                value={formData.naam}
                onChange={e => setFormData({...formData, naam: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600 cursor-pointer"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="">Kies...</option>
                  {GROEP_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Springers</label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600"
                  value={formData.aantalSpringers}
                  onChange={e => setFormData({...formData, aantalSpringers: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kleur Label</label>
              <div className="flex flex-wrap gap-3 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({...formData, kleur: color})}
                    className={`w-8 h-8 rounded-full transition-all ${formData.kleur === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Coach Tag Input Sectie */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Coaches</label>
            
            {/* Geselecteerde Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.coachIds.map(id => {
                const coach = coaches.find(c => c.id === id);
                return (
                  <span key={id} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-100">
                    {coach?.naam}
                    <button type="button" onClick={() => removeCoach(id)} className="hover:text-indigo-900">
                      <X size={14} />
                    </button>
                  </span>
                );
              })}
              {formData.coachIds.length === 0 && (
                <span className="text-xs text-slate-400 italic">Nog geen coaches geselecteerd</span>
              )}
            </div>

            {/* Zoekveld voor coaches */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Zoek coach om toe te voegen..."
                className="w-full p-3 pl-10 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Zoekresultaten dropdown */}
            {searchQuery && (
              <div className="mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-40 overflow-y-auto z-10 relative">
                {availableCoaches.length > 0 ? (
                  availableCoaches.map(coach => (
                    <button
                      key={coach.id}
                      type="button"
                      onClick={() => addCoach(coach.id)}
                      className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-600">{coach.naam}</span>
                      <UserPlus size={14} className="text-slate-300 group-hover:text-indigo-500" />
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-400 italic text-center">Geen coaches gevonden</div>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-6">
            {editingItem ? 'Wijzigingen Opslaan' : 'Groep Toevoegen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroepenModal;
