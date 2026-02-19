import React from 'react';
import { Filter, PlusCircle, CalendarX, Plus, Edit2, Trash2, Building2 } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}-${month}-${year}`;
};

const ZaalPlanningTable = ({ 
  zaalTab, 
  setZaalTab, 
  data, 
  seizoenen,
  activeSeasonId,
  setActiveSeasonId,
  locaties,
  openEditModal,
  setUitzonderingType, // Nieuw: nodig om type te zetten voor de modal
  deleteDoc,
  doc,
  db
}) => {

  const getLocatieNaam = (id) => locaties.find(l => l.id === id)?.naam || 'Onbekend';

  return (
    <div className="w-full space-y-6">
      {/* Header sectie met Tabs en Knoppen */}
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <Building2 size={20} /> Zaalplanning
          </h2>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 ml-4">
            <button 
              onClick={() => setZaalTab('weekplanning')} 
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${zaalTab === 'weekplanning' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Vaste Weekplanning
            </button>
            <button 
              onClick={() => setZaalTab('uitzonderingen')} 
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${zaalTab === 'uitzonderingen' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Uitzonderingen
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Filter size={14} className="text-slate-400" />
            <select 
              className="text-xs font-bold text-slate-600 outline-none bg-transparent"
              value={activeSeasonId}
              onChange={(e) => setActiveSeasonId(e.target.value)}
            >
              <option value="">Alle seizoenen</option>
              {seizoenen.map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
            </select>
          </div>
          
          {/* Conditionele knoppen op basis van de actieve tab */}
          {zaalTab === 'weekplanning' ? (
            <button 
              onClick={() => openEditModal(null)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            ><Plus size={16}/> Zaal plannen</button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => { setUitzonderingType('extra'); openEditModal(null, 'extra'); }}
                className="bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-emerald-100 transition-all border border-emerald-100"
              >
                <PlusCircle size={16} /> Extra reservatie
              </button>
              <button 
                onClick={() => { setUitzonderingType('onbeschikbaar'); openEditModal(null, 'onbeschikbaar'); }}
                className="bg-red-50 text-red-600 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100"
              >
                <CalendarX size={16} /> Zaal onbeschikbaar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabel sectie */}
      <div className="px-6 pb-6">
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                {zaalTab === 'weekplanning' ? (
                  <>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Locatie</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zaaldelen</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weekdag</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Beginuur</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Einduur</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Huurprijs</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Datum</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Beginuur</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Einduur</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Locatie</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zaaldelen</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reden</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Huurprijs</th>
                  </>
                )}
                <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    {zaalTab === 'weekplanning' ? (
                      <>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">{getLocatieNaam(item.locatieId)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">{item.zaaldelen}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">{item.dag}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">{item.startUur}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">{item.eindUur}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">€ {item.huurprijs}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm font-semibold">
                          <span className="flex items-center gap-2">
                            {item.type === 'extra' ? (
                              <PlusCircle size={14} className="text-emerald-500" />
                            ) : (
                              <CalendarX size={14} className="text-red-500" />  
                            )}
                            {formatDate(item.datum)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.type === 'extra' ? 'Extra zaal' : 'Onbeschikbaar'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">{item.startUur}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">{item.eindUur}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">{getLocatieNaam(item.locatieId)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">{item.zaaldelen}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">{item.reden || '-'}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600 whitespace-nowrap">€ {item.huurprijs || '0'}</td>
                      </>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => {
                            if(zaalTab === 'uitzonderingen') setUitzonderingType(item.type);
                            openEditModal(item);
                          }} 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Edit2 size={16}/>
                        </button>
                        <button 
                          onClick={() => window.confirm("Verwijderen?") && deleteDoc(doc(db, zaalTab === 'weekplanning' ? 'beschikbareZalen' : 'zaalUitzonderingen', item.id))} 
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
                  <td colSpan="10" className="px-6 py-12 text-center text-slate-400 text-sm italic">Geen gegevens gevonden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ZaalPlanningTable;
