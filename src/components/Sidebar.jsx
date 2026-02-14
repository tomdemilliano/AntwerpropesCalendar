import React from 'react';

const Sidebar = ({ sections, adminSection, setAdminSection, setSelectedCoachIds, setTempVasteTraining }) => {
  return (
    <aside className="w-64 border-r border-slate-100 p-4 flex flex-col gap-1 bg-slate-50/50">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-4">Database</p>
      {Object.entries(sections).map(([key, sec]) => (
        <button 
          key={key} 
          onClick={() => { 
            setAdminSection(key); 
            setSelectedCoachIds([]); 
            setTempVasteTraining({dag:'', startUur:'', eindUur:''}); 
          }} 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${adminSection === key ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
        >
          {sec.icon} {sec.title}
        </button>
      ))}
    </aside>
  );
};

export default Sidebar;
