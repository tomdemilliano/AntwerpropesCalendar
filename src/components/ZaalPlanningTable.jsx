import React from 'react';
import { Filter, CalendarCheck, PlusCircle, CalendarX, Plus, Edit2, Trash2, Building2 } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}-${month}-${year}`;
};

const ZaalPlanningTable = ({ 
  zaalTab, 
  setZaalTab, 
  data, // filteredBeschikbareZalen of filteredUitzonderingen
  seizoenen,
  activeSeasonId,
  setActiveSeasonId,
  locaties,
  openEditModal, // Functie om de modal te openen (komt uit App.jsx)
  deleteDoc,
  doc,
  db
}) => {

  const renderCellContent = (item, fieldName) => {
    const value = item[fieldName];

    if (zaalTab === 'uitzonderingen' && fieldName === 'datum') {
      return (
        <span className="flex items-center gap-2 font-semibold">
          {item.type === 'extra' ? (
            <PlusCircle size={14} className="text-emerald-500" />
          ) : (
            <CalendarX size={14} className="text-red-500" />  
          )}
          {formatDate(value)}
        </span>
      );
    }

    if (fieldName === 'locatieId') {
      return locaties.find(l => l.id === value)?.naam || 'Onbekend';
    }

    if (fieldName === 'huurprijs') return `€ ${value}`;
    
    if (fieldName === 'type' && zaalTab === 'uitzonderingen') {
      return value === 'extra' ? 'Extra zaal' : 'Onbeschikbaar';
    }

    return value;
  };

  return (
    <div className="w-full space-y-6">
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
          <select 
            className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 ring-indigo-50"
            value={activeSeasonId}
            onChange={(e) => setActiveSeasonId(e.target.value)}
          >
            {seizoenen.map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
          </select>
          <button 
            onClick={() => openEditModal(null)}
            className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                {zaalTab === 'weekplanning' ? (
                  <>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dag</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uren</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Locatie</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Delen</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prijs</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Datum</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Locatie</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uren</th>
                  </>
                )}
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    {zaalTab === 'weekplanning' ? (
                      <>
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{item.dag}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.startUur} - {item.eindUur}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{renderCellContent(item, 'locatieId')}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.zaaldelen}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{renderCellContent(item, 'huurprijs')}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm text-slate-600">{renderCellContent(item, 'datum')}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{renderCellContent(item, 'type')}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{renderCellContent(item, 'locatieId')}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.startUur} - {item.eindUur}</td>
                      </>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEditModal(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
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
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm italic">Geen gegevens gevonden.</td>
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
