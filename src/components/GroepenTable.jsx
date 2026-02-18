import React from 'react';
import { Edit2, Trash2, Plus, Users } from 'lucide-react';

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
    <div className="w-full space-y-6">
      {/* Header Sectie - Exacte kopie van de AdminTable layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Links: Titel en Icoon */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Trainingsgroepen</h1>
            <p className="text-slate-500 text-sm font-medium">Beheer groepen en toegewezen coaches</p>
          </div>
        </div>

        {/* Rechts: Seizoen en Toevoegen */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
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
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all whitespace-nowrap"
          >
            <Plus size={18} /> Toevoegen
          </button>
        </div>
      </div>

      {/* Tabel Sectie */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                <th className="px-6 py-4">Naam</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-center">Springers</th>
                <th className="px-6 py-4">Coaches</th>
                <th className="px-6 py-4 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {groepen.length > 0 ? (
                groepen.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                      {item.naam}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium text-center whitespace-nowrap">
                      {item.aantalSpringers}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {renderCoaches(item.coachIds)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button 
                          onClick={() => openEditModal(item)} 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Edit2 size={16}/>
                        </button>
                        <button 
                          onClick={() => window.confirm("Groep verwijderen?") && deleteDoc(doc(db, 'groepen', item.id))} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm italic">
                    Geen groepen gevonden.
                  </td>
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
