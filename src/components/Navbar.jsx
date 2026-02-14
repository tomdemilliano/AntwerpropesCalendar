import React from 'react';
import { Calendar as CalendarIcon, LayoutGrid, Settings } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white border-b border-slate-200 px-8 py-3 flex justify-between items-center sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><CalendarIcon size={20} /></div>
        <h1 className="text-lg font-black tracking-tighter">TRAINING<span className="text-indigo-600">PLAN</span></h1>
      </div>
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button 
          onClick={() => setActiveTab('kalender')} 
          className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'kalender' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500'}`}
        >
          <LayoutGrid size={16}/> Kalender
        </button>
        <button 
          onClick={() => setActiveTab('beheer')} 
          className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'beheer' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500'}`}
        >
          <Settings size={16}/> Beheer
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
