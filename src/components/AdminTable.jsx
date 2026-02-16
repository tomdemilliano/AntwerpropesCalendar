import React from 'react';
import { Filter, CalendarCheck, PlusCircle, CalendarX, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const AdminTable = ({ 
  adminSection, currentSection, activeSeasonId, setActiveSeasonId, seizoenen, 
  zaalTab, setZaalTab, vasteTab, setVasteTab, setEditingItem, setUitzonderingType, setShowAdminModal, 
  setShowBulkScheduleModal, setSelectedCoachIds, setTempVasteTraining, 
  openEditModal, handleDeleteVasteTraining, trainingen, groepen, coaches, locaties, vasteTrainingen, beschikbareZalen,
  db, deleteDoc, doc
}) => {

  const isIngepland = (vaste) => {
    return trainingen.some(t => t.groepId === vaste.groepId && t.uren === `${vaste.startUur}-${vaste.eindUur}`);
  };

  const renderCellContent = (item, field) => {
    const value = item[field.name];
    
    // Relaties mappen naar namen
    if (field.name === 'groepId') return groepen.find(g => g.id === value)?.naam || 'Onbekend';
    if (field.name === 'locatieId') return locaties.find(l => l.id === value)?.naam || 'Onbekend';
    
    // Vaste training lookup voor de afwijkingen grid
    if (field.name === 'vasteId') {
        const v = vasteTrainingen.find(vt => vt.id === value);
        if (!v) return 'Onbekend';
        const g = groepen.find(gr => gr.id === v.groepId);
        return `${g?.naam || 'Groep'} (${v.dag} ${v.startUur})`;
    }

    // Specifieke weergave voor de datum kolom in Zaaluitzonderingen met icoontjes
    if (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' && field.name === 'datum') {
      return (
        <span className="flex items-center gap-2">
          {item.type === 'extra' ? (
            <PlusCircle size={14} className="text-emerald-500" />
          ) : (
            <CalendarX size={14} className="text-red-500" />
          )}
          {value}
        </span>
      );
    }

    // Status weergave (voor afwijkingen/trainingen)
    if (field.type === 'status') {
      const status = value || 'te behandelen';
      const styles = {
        'goedgekeurd': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'afgekeurd': 'bg-red-50 text-red-700 border-red-100',
        'te behandelen': 'bg-amber-50 text-amber-700 border-amber-100'
      };
      const icons = {
        'goedgekeurd': <CheckCircle2 size={12}/>,
        'afgekeurd': <XCircle size={12}/>,
        'te behandelen': <AlertCircle size={12}/>
      };
      return (
        <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider w-fit ${styles[status]}`}>
          {icons[status]} {status}
        </span>
      );
    }

    // Valuta weergave
    if (field.type === 'number' && (field.name === 'uurtarief' || field.name === 'huurprijs')) {
      return value ? `€ ${value}` : '€ 0';
    }

    // Fallback voor lege optionele velden zoals 'reden'
    if (field.name === 'reden' && !value) return <span className="text-slate-300 italic">Geen reden</span>;

    return value;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      {/* Header sectie van de tabel */}
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
            {currentSection.icon}
            {currentSection.title}
          </h2>

          {/* Tab switch voor de Zaalplanning */}
          {adminSection === 'beschikbareZalen' && (
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 ml-4">
              <button onClick={() => setZaalTab('weekplanning')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${zaalTab === 'weekplanning' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Vaste Weekplanning</button>
              <button onClick={() => setZaalTab('uitzonderingen')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${zaalTab === 'uitzonderingen' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Uitzonderingen</button>
            </div>
          )}

          {/* Tab switch voor Vaste Trainingen / Afwijkingen */}
          {adminSection === 'vasteTrainingen' && (
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 ml-4">
              <button onClick={() => setVasteTab('vaste-planning')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${vasteTab === 'vaste-planning' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Vaste Planning</button>
              <button onClick={() => setVasteTab('afwijkingen')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${vasteTab === 'afwijkingen' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Afwijkingen / Inhaallessen</button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Seizoensfilter */}
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

          {/* Actie knoppen */}
          {adminSection === 'vasteTrainingen' && vasteTab === 'vaste-planning' && (
            <button 
              onClick={() => setShowBulkScheduleModal(true)}
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
            >
              <CalendarCheck size={16}/> Bulk Inplanning
            </button>
          )}

          {adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' ? (
            <div className="flex gap-2">
              <button 
                onClick={() => { setUitzonderingType('extra'); setEditingItem(null); setShowAdminModal(true); }}
                className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
              >
                <PlusCircle size={16}/> Extra Reservatie
              </button>
              <button 
                onClick={() => { setUitzonderingType('onbeschikbaar'); setEditingItem(null); setShowAdminModal(true); }}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
              >
                <CalendarX size={16}/> Zaal Onbeschikbaar
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setEditingItem(null); setShowAdminModal(true); }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={16}/> Nieuw Toevoegen
            </button>
          )}
        </div>
      </div>

      {/* Tabel Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              {currentSection.fields.map((f, i) => {
                if (f.isRow) return f.fields.map(sub => <th key={sub.name} className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub.label}</th>);
                return <th key={f.name || i} className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</th>;
              })}
              <th className="px-4 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentSection.data.length > 0 ? (
              currentSection.data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  {currentSection.fields.map((f, i) => {
                    if (f.isRow) return f.fields.map(sub => (
                      <td key={sub.name} className="px-4 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
                        {renderCellContent(item, sub)}
                      </td>
                    ));
                    return (
                      <td key={f.name || i} className="px-4 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
                        {renderCellContent(item, f)}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button 
                        onClick={() => openEditModal(item)} 
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={14}/>
                      </button>
                      <button 
                        onClick={() => {
                          if (adminSection === 'vasteTrainingen' && vasteTab === 'vaste-planning') {
                            handleDeleteVasteTraining(item, trainingen, isIngepland);
                          } else if (window.confirm("Weet u zeker dat u dit item wilt verwijderen?")) {
                            deleteDoc(doc(db, currentSection.collection, item.id));
                          }
                        }} 
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="100%" className="px-4 py-12 text-center text-slate-400 text-sm italic">
                  Geen gegevens gevonden voor deze selectie.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
