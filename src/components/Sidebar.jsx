import React from 'react';

const Sidebar = ({ sections, adminSection, setAdminSection, setSelectedCoachIds, setTempVasteTraining, setWedstrijden }) => {
  
  // Definieer de groepen en welke keys daaronder vallen
  const groups = [
    {
      header: 'Algemeen',
      items: ['seizoenen', 'locaties', 'coaches']
    },
    {
      header: 'Seizoensplanning',
      items: ['groepen', 'beschikbareZalen', 'vasteTrainingen', 'wedstrijden']
    }
  ];

  const handleSectionClick = (key) => {
    setAdminSection(key);
    setSelectedCoachIds([]);
    setTempVasteTraining({ dag: '', startUur: '', eindUur: '' });
  };

  return (
    <aside className="w-64 border-r border-slate-100 p-4 flex flex-col gap-1 bg-slate-50/50">
      {groups.map((group, groupIdx) => (
        <React.Fragment key={groupIdx}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-6 first:mt-2">
            {group.header}
          </p>
          {group.items.map((key) => {
            const sec = sections[key];
            if (!sec) return null;
            return (
              <button
                key={key}
                onClick={() => handleSectionClick(key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  adminSection === key 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                {sec.icon} {sec.title}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </aside>
  );
};

export default Sidebar;
