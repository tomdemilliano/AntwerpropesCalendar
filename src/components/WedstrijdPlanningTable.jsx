import React from 'react';
import { Trophy, Calendar, MapPin, Edit2, Trash2, Plus } from 'lucide-react';

const WedstrijdPlanningTable = ({ 
  wedstrijden, 
  groepen, 
  onEdit, 
  onDelete,
  openAddModal // Functie om de modal te openen voor een nieuw item
}) => {

  const getGroepNaam = (id) => groepen.find(g => g.id === id)?.naam || 'Onbekend';

  return (
    <div className="w-full space-y-6">
      {/* Header sectie - Exacte styling van TrainingsPlanningTable */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <Trophy size={24} className="text-indigo-600" />
              Wedstrijdplanning
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => openAddModal()}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Plus size={18}/>
              Wedstrijd Toevoegen
            </button>
          </div>
        </div>

        {/* Tabel Sectie */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Datum & Wedstrijd</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Locatie & Adres</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deelnemende Groepen</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {wedstrijden.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">
                    Geen wedstrijden gepland voor dit seizoen.
                  </td>
                </tr>
              ) : (
                wedstrijden.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-all">
                    {/* Datum & Naam */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                          <Calendar size={14} />
                          <span className="text-[11px] font-black uppercase">{item.datum}</span>
                        </div>
                        <span className="font-bold text-slate-800">{item.naam}</span>
                      </div>
                    </td>

                    {/* Locatie & Adres */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
                          <MapPin size={14} className="text-slate-400" />
                          <span className="text-sm">{item.locatieNaam}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 leading-tight">
                          {item.straat} {item.huisnummer},<br />
                          {item.postcode} {item.gemeente}
                        </span>
                      </div>
                    </td>

                    {/* Groepen Tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.groepIds && item.groepIds.length > 0 ? (
                          item.groepIds.map(gId => (
                            <span key={gId} className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-indigo-100">
                              {getGroepNaam(gId)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-300 italic">Geen groepen</span>
                        )}
                      </div>
                    </td>

                    {/* Acties - Zelfde hover effect als TrainingsPlanningTable */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => onEdit(item)} 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Edit2 size={16}/>
                        </button>
                        <button 
                          onClick={() => onDelete(item)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WedstrijdPlanningTable;
