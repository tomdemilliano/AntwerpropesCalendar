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

    // Specifieke logica voor Zaalplanning Uitzonderingen Grid consistentie
    if (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen') {
      // Zoek de gekoppelde zaal op als het een annulatie is op basis van een zaalId
      const linkedZaal = item.zaalId ? beschikbareZalen.find(z => z.id === item.zaalId) : null;

      if (field.name === 'datum') {
        return (
          <div className="flex items-center gap-2">
            {item.type === 'extra' ? (
              <PlusCircle size={16} className="text-emerald-500" />
            ) : (
              <CalendarX size={16} className="text-rose-500" />
            )}
            <span className="font-bold">{value}</span>
          </div>
        );
      }

      if (field.name === 'startUur') return value || linkedZaal?.startUur || '-';
      if (field.name === 'eindUur') return value || linkedZaal?.eindUur || '-';
      if (field.name === 'zaaldelen') return value || linkedZaal?.zaaldelen || '-';
      if (field.name === 'locatieId') {
        const locId = value || linkedZaal?.locatieId;
        return locaties.find(l => l.id === locId)?.naam || 'Onbekend';
      }
      if (field.name === 'reden') return value || (item.type === 'onbeschikbaar' ? 'Zaal onbeschikbaar' : '-');
    }

    // Standaard weergave logica voor andere secties
    if (field.name === 'groepId') return groepen.find(g => g.id === value)?.naam || 'Onbekend';
    if (field.name === 'locatieId') return locaties.find(l => l.id === value)?.naam || 'Onbekend';
    
    if (field.name === 'vasteId') {
        const v = vasteTrainingen.find(vt => vt.id === value);
        if (!v) return 'Onbekend';
        const g = groepen.find(gr => gr.id === v.groepId);
        return `${g?.naam || 'Groep'} (${v.dag})`;
    }

    if (field.name === 'coachIds') {
      if (!value || value.length === 0) return 'Geen coaches';
      return value.map(id => coaches.find(c => c.id === id)?.naam).filter(Boolean).join(', ');
    }

    if (field.name === 'status') {
      const isOk = isIngepland(item);
      return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          isOk ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
        }`}>
          {isOk ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
          {isOk ? 'Ingepland' : 'Niet ingepland'}
        </span>
      );
    }

    if (field.name === 'kleur') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: value }}></div>
          <span className="text-xs font-mono">{value}</span>
        </div>
      );
    }

    return value;
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
            {currentSection.icon}
            {currentSection.title}
          </h2>
          
          {adminSection === 'beschikbareZalen' && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setZaalTab('weekplanning')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${zaalTab === 'weekplanning' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Vaste Planning
              </button>
              <button 
                onClick={() => setZaalTab('uitzonderingen')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${zaalTab === 'uitzonderingen' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Uitzonderingen
              </button>
            </div>
          )}

          {adminSection === 'vasteTrainingen' && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setVasteTab('vaste-planning')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${vasteTab === 'vaste-planning' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Wekelijkse Planning
              </button>
              <button 
                onClick={() => setVasteTab('afwijkingen')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${vasteTab === 'afwijkingen' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Afwijkingen
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {adminSection === 'vasteTrainingen' && vasteTab === 'vaste-planning' && (
            <button 
              onClick={() => setShowBulkScheduleModal(true)}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
            >
              <CalendarCheck size={18}/> Bulk Inplanning
            </button>
          )}

          {adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' ? (
            <div className="flex gap-2">
              <button 
                onClick={() => { setUitzonderingType('extra'); setEditingItem(null); setShowAdminModal(true); }}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                <PlusCircle size={18}/> Extra Reservatie
              </button>
              <button 
                onClick={() => { setUitzonderingType('onbeschikbaar'); setEditingItem(null); setShowAdminModal(true); }}
                className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
              >
                <CalendarX size={18}/> Zaal Onbeschikbaar
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setEditingItem(null); setSelectedCoachIds([]); setTempVasteTraining({ dag: '', startUur: '', eindUur: '' }); setShowAdminModal(true); }}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <Plus size={18}/> Toevoegen
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              {currentSection.fields.map((f, i) => {
                if (f.isRow) return f.fields.map(sub => <th key={sub.name} className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub.label}</th>);
                return <th key={f.name || i} className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</th>;
              })}
              <th className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentSection.data.length > 0 ? (
              currentSection.data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  {currentSection.fields.map((f, i) => {
                    if (f.isRow) return f.fields.map(sub => <td key={sub.name} className="px-4 py-3 text-sm text-slate-600 font-medium">{renderCellContent(item, sub)}</td>);
                    return <td key={f.name || i} className="px-4 py-3 text-sm text-slate-600 font-medium">{renderCellContent(item, f)}</td>;
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
              <tr><td colSpan="100%" className="px-4 py-12 text-center text-slate-400 font-medium italic">Geen gegevens gevonden...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
