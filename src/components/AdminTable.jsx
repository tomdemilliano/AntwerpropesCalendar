import React from 'react';
import { Filter, CalendarCheck, PlusCircle, CalendarX, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString; // Fallback als het geen YYYY-MM-DD is
  return `${day}-${month}-${year}`;
};

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

    if (field.type === 'date' && value) {
      return formatDate(value);
    }
    
    // Behoud originele logica voor ID lookups
    if (field.name === 'groepId') return groepen.find(g => g.id === value)?.naam || 'Onbekend';
    if (field.name === 'locatieId') return locaties.find(l => l.id === value)?.naam || 'Onbekend';
    
    // Behoud originele logica voor Coach namen (voorkomt tonen van keys)
    if (field.name === 'coachIds' && Array.isArray(value)) {
      return value.map(id => coaches.find(c => c.id === id)?.naam).filter(Boolean).join(', ') || 'Geen';
    }

    if (field.name === 'vasteId') {
        const v = vasteTrainingen.find(vt => vt.id === value);
        if (!v) return 'Onbekend';
        const g = groepen.find(gr => gr.id === v.groepId);
        return `${g?.naam || 'Groep'} (${v.dag} ${v.startUur})`;
    }

    // NIEUW: Specifieke weergave voor de datum kolom in Zaaluitzonderingen met icoontjes
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

    // BEHOUD ORIGINELE STATUS LOGICA (Kleine icoontjes voor vaste planning ipv grote tags)
    if (field.type === 'status') {
      if (adminSection === 'vasteTrainingen' && vasteTab === 'vaste-planning') {
        return isIngepland(item) ? 
          <CheckCircle2 size={18} className="text-emerald-500" /> : 
          <AlertCircle size={18} className="text-amber-500" />;
      }
      // Status voor afwijkingen
      const status = value || 'te behandelen';
      const styles = {
        'goedgekeurd': 'bg-emerald-50 text-emerald-700',
        'afgekeurd': 'bg-red-50 text-red-700',
        'te behandelen': 'bg-amber-50 text-amber-700'
      };
      return (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${styles[status]}`}>
          {status}
        </span>
      );
    }

    if (field.type === 'number' && (field.name === 'uurtarief' || field.name === 'huurprijs')) return `€ ${value}`;
    
    return value;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden w-full">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
            {currentSection.icon}
            {currentSection.title}
          </h2>

          {adminSection === 'beschikbareZalen' && (
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 ml-4">
              <button onClick={() => setZaalTab('weekplanning')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${zaalTab === 'weekplanning' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Vaste Weekplanning</button>
              <button onClick={() => setZaalTab('uitzonderingen')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${zaalTab === 'uitzonderingen' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Uitzonderingen</button>
            </div>
          )}

          {adminSection === 'vasteTrainingen' && (
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 ml-4">
              <button onClick={() => setVasteTab('vaste-planning')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${vasteTab === 'vaste-planning' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Vaste Planning</button>
              <button onClick={() => setVasteTab('afwijkingen')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${vasteTab === 'afwijkingen' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Afwijkingen / Inhaallessen</button>
            </div>
          )}
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
                    if (f.isRow) return f.fields.map(sub => <td key={sub.name} className="px-4 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">{renderCellContent(item, sub)}</td>);
                    return <td key={f.name || i} className="px-4 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">{renderCellContent(item, f)}</td>;
                  })}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit2 size={14}/></button>
                      <button onClick={() => adminSection === 'vasteTrainingen' && vasteTab === 'vaste-planning' ? handleDeleteVasteTraining(item, trainingen, isIngepland) : (window.confirm("Verwijderen?") && deleteDoc(doc(db, currentSection.collection, item.id)))} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="100%" className="px-4 py-12 text-center text-slate-400 text-sm italic">Geen gegevens gevonden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
