import React from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';

const GroepenTable = ({ 
  groepen, 
  coaches, 
  openEditModal, 
  deleteDoc, 
  db, 
  doc,
  seizoenen,
  activeSeasonId,
  setActiveSeasonId,
  setShowAdminModal,
  setEditingItem
}) => {
  
  const renderCoaches = (coachIds) => {
    if (!Array.isArray(coachIds)) return 'Geen';
    return coachIds
      .map(id => coaches.find(c => c.id === id)?.naam)
      .filter(Boolean)
      .join(', ') || 'Geen';
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Sectie - Nu exact zoals in AdminTable */}
      <div className="flex justify-end items-center gap-3">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          <select 
            value={activeSeasonId}
            onChange={(e) => setActiveSeasonId(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-600 px-4 py-2 outline-none"
          >
            {seizoenen.map(s => (
              <option key={s.id} value={s.id}>Seizoen {s.naam}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => { setEditingItem(null); setShowAdminModal(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} /> Toevoegen
        </button>
      </div>

      {/* Tabel Sectie - Volledige breedte en aangepaste font-weight */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Naam</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Springers</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coaches</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {groepen.length > 0 ? (
                groepen.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    {/* font-bold verwijderd, nu font-medium net als de rest */}
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{item.naam}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{item.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{item.aantalSpringers}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{renderCoaches(item.coachIds)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button 
                          onClick={() => openEditModal(item)} 
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 size={16}/>
                        </button>
                        <button 
                          onClick={() => window.confirm("Groep verwijderen?") && deleteDoc(doc(db, 'groepen', item.id))} 
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm italic">Geen groepen gevonden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GroepenTable;
