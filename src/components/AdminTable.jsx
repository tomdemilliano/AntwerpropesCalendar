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
    if (field.name === 'groepId') return groepen.find(g => g.id === value)?.naam || 'Onbekend';
    if (field.name === 'locatieId') return locaties.find(l => l.id === value)?.naam || 'Onbekend';
    if (field.name === 'vasteId') {
        const v = vasteTrainingen.find(vt => vt.id === value);
        if (!v) return 'Onbekend';
        const g = groepen.find(gr => gr.id === v.groepId);
        return `${g?.naam} (${v.dag} ${v.startUur})`;
    }
    if (field.name === 'zaalId') {
        const z = beschikbareZalen.find(bz => bz.id === value);
        if (!z) return 'Onbekend';
        return `${locaties.find(l => l.id === z.locatieId)?.naam} (${z.dag})`;
    }
    if (field.name === 'coachIds' && Array.isArray(value)) {
      return value.map(id => coaches.find(c => c.id === id)?.voornaam).join(', ');
    }
    if (field.type === 'number' && (field.name === 'uurtarief' || field.name === 'huurprijs')) return `€ ${value}`;
    
    // Status voor Vaste Trainingen
    if (field.type === 'status' && adminSection === 'vasteTrainingen') {
      return isIngepland(item) ? (
        <span className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase"><CheckCircle2 size={14}/> Ja</span>
      ) : (
        <span className="text-slate-300 font-bold text-[10px] uppercase">Nee</span>
      );
    }

    // Status voor Afwijkingen
    if (field.name === 'status' && adminSection === 'afwijkingen') {
        if (value === 'geannuleerd') return <span className="flex items-center gap-1 text-red-600 font-bold text-[10px] uppercase"><XCircle size={14}/> Geannuleerd</span>;
        if (value === 'gewijzigd') return <span className="flex items-center gap-1 text-indigo-600 font-bold text-[10px] uppercase"><Edit2 size={14}/> Gewijzigd</span>;
        return <span className="flex items-center gap-1 text-amber-500 font-bold text-[10px] uppercase"><AlertCircle size={14}/> Te behandelen</span>;
    }

    if (adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' && field.name === 'datum') {
      return <span>{item.type === 'extra' ? '➕ ' : '🚫 '} {value}</span>;
    }
    return value;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{currentSection.title}</h2>
          {(adminSection === 'vasteTrainingen' || adminSection === 'groepen' || adminSection === 'beschikbareZalen' || adminSection === 'afwijkingen') && (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Filter size={14} className="text-indigo-600" />
              <span>Actief seizoen:</span>
              <select value={activeSeasonId} onChange={(e) => setActiveSeasonId(e.target.value)} className="bg-transparent font-bold text-indigo-600 outline-none border-b border-indigo-200">
                {seizoenen.map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {adminSection === 'vasteTrainingen' && vasteTab === 'vaste-planning' && (
            <button onClick={() => setShowBulkScheduleModal(true)} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-200 transition text-sm font-bold">
              <CalendarCheck size={16}/> Trainingsmomenten inplannen
            </button>
          )}
          {adminSection === 'beschikbareZalen' && zaalTab === 'uitzonderingen' ? (
            <>
              <button onClick={() => { setEditingItem(null); setUitzonderingType('extra'); setShowAdminModal(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition text-sm font-bold"><PlusCircle size={16}/> Extra reservatie</button>
              <button onClick={() => { setEditingItem(null); setUitzonderingType('onbeschikbaar'); setShowAdminModal(true); }} className="bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-red-700 transition text-sm font-bold"><CalendarX size={16}/> Zaal onbeschikbaar</button>
            </>
          ) : (
            <button onClick={() => { setEditingItem(null); setSelectedCoachIds([]); setTempVasteTraining({dag:'', startUur:'', eindUur:'', datum:''}); setShowAdminModal(true); }} className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-600 transition text-sm font-bold"><Plus size={16}/> Toevoegen</button>
          )}
        </div>
      </div>

      {adminSection === 'vasteTrainingen' && (
        <div className="flex gap-4 mb-6 border-b border-slate-100">
          <button onClick={() => setVasteTab('vaste-planning')} className={`pb-2 px-4 text-sm font-bold transition-all ${vasteTab === 'vaste-planning' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>Vaste planning</button>
          <button onClick={() => setVasteTab('afwijkingen')} className={`pb-2 px-4 text-sm font-bold transition-all ${vasteTab === 'afwijkingen' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>Afwijkingen</button>
        </div>
      )}

      {adminSection === 'beschikbareZalen' && (
        <div className="flex gap-4 mb-6 border-b border-slate-100">
          <button onClick={() => setZaalTab('weekplanning')} className={`pb-2 px-4 text-sm font-bold transition-all ${zaalTab === 'weekplanning' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>Vaste planning</button>
          <button onClick={() => setZaalTab('uitzonderingen')} className={`pb-2 px-4 text-sm font-bold transition-all ${zaalTab === 'uitzonderingen' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>Uitzonderingen</button>
        </div>
      )}

      <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {currentSection.fields.map((f, i) => {
                if (f.isRow) return f.fields.map(sub => <th key={sub.name} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sub.label}</th>);
                return <th key={f.name || i} className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.label}</th>;
              })}
              <th className="px-4 py-3 text-right"></th>
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
              <tr><td colSpan="100%" className="px-4 py-12 text-center text-slate-400 text-sm">Geen gegevens gevonden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
