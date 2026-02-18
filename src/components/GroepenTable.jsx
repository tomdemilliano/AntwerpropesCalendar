import React from 'react';
import { Edit2, Trash2, Users } from 'lucide-react';

const GroepenTable = ({ 
  groepen, 
  coaches, 
  openEditModal, 
  deleteDoc, 
  db, 
  doc 
}) => {
  
  const renderCoaches = (coachIds) => {
    if (!Array.isArray(coachIds)) return 'Geen';
    return coachIds
      .map(id => coaches.find(c => c.id === id)?.naam)
      .filter(Boolean)
      .join(', ') || 'Geen';
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden w-full">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
          <Users size={18} /> Trainingsgroepen
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Naam</th>
              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Springers</th>
              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coaches</th>
              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {groepen.length > 0 ? (
              groepen.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-800 font-bold">{item.naam}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 font-medium">{item.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 font-medium">{item.aantalSpringers}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 font-medium">{renderCoaches(item.coachIds)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-indigo-600">
                        <Edit2 size={14}/>
                      </button>
                      <button 
                        onClick={() => window.confirm("Groep verwijderen?") && deleteDoc(doc(db, 'groepen', item.id))} 
                        className="p-1.5 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-12 text-center text-slate-400 text-sm italic">Geen groepen gevonden.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroepenTable;
