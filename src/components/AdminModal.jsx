import React from 'react';
import { X, AlertTriangle, Search } from 'lucide-react';

const AdminModal = ({ 
  show, 
  onClose, 
  title, 
  onSubmit, 
  editingItem, 
  fields, 
  renderInputField,
  handleDeleteAllPlanned,
  adminSection
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {fields.filter(f => f.type !== 'status').map((field, idx) => {
            if (field.isRow) {
              return (
                <div key={idx} className={`grid ${field.fields.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                  {field.fields.map(subField => (
                    <div key={subField.name}>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{subField.label}</label>
                      {renderInputField(subField)}
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <div key={field.name || idx}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                {renderInputField(field)}
              </div>
            );
          })}

          {adminSection === 'seizoenen' && editingItem && (
            <div className="pt-4 mt-4 border-t border-slate-50">
               <button 
                type="button"
                onClick={() => handleDeleteAllPlanned(editingItem)}
                className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
              >
                <AlertTriangle size={16}/> Verwijder alle ingeplande momenten
              </button>
            </div>
          )}

          <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all mt-4">
            {editingItem ? 'Wijzigingen Opslaan' : 'Toevoegen'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;
