import React from 'react';
import { Calendar, Edit2, Trash2, CheckCircle2, AlertCircle, Plus, CalendarCheck } from 'lucide-react';

const TrainingsPlanningTable = ({ 
  vasteTab, 
  setVasteTab, 
  vasteTrainingen, 
  afwijkingen,
  seizoenen,
  activeSeasonId,
  setActiveSeasonId,
  groepen,
  locaties,
  trainingen, // Voor de 'ingepland' check
  openEditModal,
  deleteDoc,
  doc,
  db,
  setShowBulkScheduleModal
}) => {

  const isIngepland = (vaste) => {
    return trainingen.some(t => t.groepId === vaste.groepId && t.uren === `${vaste.startUur}-${vaste.eindUur}`);
  };

  const getGroepNaam = (id) => groepen.find(g => g.id === id)?.naam || 'Onbekend';
  const getLocatieNaam = (id) => locaties.find(l => l.id === id)?.naam || 'Onbekend';

  return (
    <div className="w-full space-y-6">
      {/* Header met Tabs en Seizoenselectie */}
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <Calendar size={20} className="text-indigo-600" /> Trainingsplanning
          </h2>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 ml-4">
            <button 
              onClick={() => setVasteTab('vaste-planning')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${vasteTab === 'vaste-planning' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Vaste planning
            </button>
            <button 
              onClick={() => setVasteTab('afwijkingen')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${vasteTab === 'afwijkingen' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Afwijkingen
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={activeSeasonId} 
            onChange={(e) => setActiveSeasonId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl outline-none focus:ring-2 ring-indigo-500/20"
          >
            {seizoenen.map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
          </select>
          
          <button 
            onClick={() => setShowBulkScheduleModal(true)}
            className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold border border-amber-100 hover:bg-amber-100 transition-all"
          >
            <CalendarCheck size={14} /> Bulk planning
          </button>

          <button 
            onClick={() => openEditModal(null)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <Plus size={14} /> Nieuwe Toevoegen
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {vasteTab === 'vaste-planning' ? (
                  <>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Groep</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dag</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uren</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zaal</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingepland</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Datum</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Oorspronkelijk</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reden</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status/Actie</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nieuwe Zaal/Uren</th>
                  </>
                )}
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {(vasteTab === 'vaste-planning' ? vasteTrainingen : afwijkingen).map((item) => (
                <tr key={item.id} className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  {vasteTab === 'vaste-planning' ? (
                    <>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{getGroepNaam(item.groepId)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.dag}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.startUur} - {item.eindUur}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{getLocatieNaam(item.locatieId)}</td>
                      <td className="px-6 py-4">
                        {isIngepland(item) ? 
                          <CheckCircle2 size={18} className="text-emerald-500" /> : 
                          <AlertCircle size={18} className="text-slate-300" />
                        }
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{item.datum}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{getGroepNaam(item.groepId)}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 italic">{item.reden || '-'}</td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                           item.status === 'geannuleerd' ? 'bg-red-50 text-red-600' : 
                           item.status === 'gewijzigd' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                         }`}>
                           {item.status || 'te behandelen'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.status === 'gewijzigd' ? `${getLocatieNaam(item.locatieId)} (${item.startUur}-${item.eindUur})` : '-'}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEditModal(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Edit2 size={16}/>
                      </button>
                      <button 
                        onClick={() => window.confirm("Verwijderen?") && deleteDoc(doc(db, vasteTab === 'vaste-planning' ? 'vasteTrainingen' : 'afwijkingen', item.id))}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainingsPlanningTable;
