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
    
    // Specifieke weergave voor de Zaalplanning Uitzonderingen Grid
    if (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen') {
      if (field.name === 'datum') {
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
      if (field.name === 'reden') return value || <span className="text-slate-300">-</span>;
      if (field.name === 'huurprijs') return value ? `€ ${value}` : '€ 0';
    }

    // Bestaande weergave logica
    if (field.name === 'groepId') return groepen.find(g => g.id === value)?.naam || 'Onbekend';
    if (field.name === 'locatieId') return locaties.find(l => l.id === value)?.naam || 'Onbekend';
    if (field.name === 'vasteId') {
        const v = vasteTrainingen.find(vt => vt.id === value);
        if (!v) return 'Onbekend';
        const g = groepen.find(gr => gr.id === v.groepId);
        return `${g?.naam} (${v.dag})`;
    }
    if (field.name === 'coachIds') {
        if (!value || value.length === 0) return 'Geen coach';
        return value.map(id => coaches.find(c => c.id === id)?.naam).filter(Boolean).join(', ');
    }
    if (field.type === 'status') {
      const isOk = value === 'goedgekeurd' || value === 'aanwezig' || value === 'actief';
      const isPending = value === 'te behandelen' || value === 'gepland';
      
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isOk ? 'bg-emerald-50 text-emerald-600' : isPending ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
        }`}>
          {isOk ? <CheckCircle2 size={12}/> : isPending ? <AlertCircle size={12}/> : <XCircle size={12}/>}
          {value}
        </span>
      );
    }
    return value;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
            {currentSection.icon}
            {currentSection.title}
          </h2>
          
          {adminSection === 'seizoenen' && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 ml-4">
              {seizoenen.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setActiveSeasonId(s.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSeasonId === s.id ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {s.naam}
                </button>
              ))}
            </div>
          )}

          {adminSection === 'vasteTrainingen' && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 ml-4">
              <button 
                onClick={() => setVasteTab('vaste-planning')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${vasteTab === 'vaste-planning' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Vaste Planning
              </button>
              <button 
                onClick={() => setVasteTab('afwijkingen')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${vasteTab === 'afwijkingen' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Uitzonderingen
              </button>
            </div>
          )}

          {adminSection === 'beschikbareZalen' && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 ml-4">
              <button 
                onClick={() => setZaalTab('weekplanning')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${zaalTab === 'weekplanning' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Weekplanning
              </button>
              <button 
                onClick={() => setZaalTab('uitzonderingen')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${zaalTab === 'uitzonderingen' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Uitzonderingen
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {adminSection === 'vasteTrainingen' && vasteTab === 'vaste-planning' && (
            <button 
              onClick={() => setShowBulkScheduleModal(true)}
              className="bg-amber-50 text-amber-600 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-amber-100 transition-all border border-amber-100"
            >
              <CalendarCheck size={18}/> Bulk Inplanning
            </button>
          )}

          {adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' ? (
            <>
              <button 
                onClick={() => { setUitzonderingType('extra'); setEditingItem(null); setShowAdminModal(true); }}
                className="bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-100 transition-all border border-emerald-100"
              >
                <PlusCircle size={18}/> Extra reservatie
              </button>
              <button 
                onClick={() => { setUitzonderingType('onbeschikbaar'); setEditingItem(null); setShowAdminModal(true); }}
                className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100"
              >
                <CalendarX size={18}/> Zaal onbeschikbaar
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                setEditingItem(null);
                setSelectedCoachIds([]);
                setTempVasteTraining({ dag: '', startUur: '', eindUur: '' });
                setShowAdminModal(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={18}/> Toevoegen
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              {currentSection.fields.filter(f => !f.hideInTable).map((f, i) => {
                if (f.isRow) {
                  return f.fields.map(subField => (
                    <th key={subField.name} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {subField.label}
                    </th>
                  ));
                }
                return (
                  <th key={f.name || i} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {f.label}
                  </th>
                );
              })}
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentSection.data.length > 0 ? (
              currentSection.data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  {currentSection.fields.filter(f => !f.hideInTable).map((f, i) => {
                    if (f.isRow) {
                      return f.fields.map(subField => (
                        <td key={subField.name} className="px-4 py-3 text-sm text-slate-600 font-medium">
                          {renderCellContent(item, subField)}
                        </td>
                      ));
                    }
                    return (
                      <td key={f.name || i} className="px-4 py-3 text-sm text-slate-600 font-medium">
                        {renderCellContent(item, f)}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
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
                          } else {
                            if (window.confirm("Weet u zeker dat u dit item wilt verwijderen?")) {
                              deleteDoc(doc(db, currentSection.collection, item.id));
                            }
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
                  Geen gegevens gevonden...
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
