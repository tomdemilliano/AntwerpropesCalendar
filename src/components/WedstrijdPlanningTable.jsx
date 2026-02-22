import React from 'react';
import { Edit2, Trash2, MapPin, Trophy, Users, Calendar } from 'lucide-react';

const WedstrijdPlanningTable = ({ wedstrijden, groepen, onEdit, onDelete }) => {
  
  // Helper om de groepsnamen op te halen op basis van IDs
  const getGroepsNamen = (groepIds) => {
    if (!groepIds || groepIds.length === 0) return 'Geen groepen';
    return groepIds
      .map(id => groepen.find(g => g.id === id)?.naam)
      .filter(Boolean)
      .join(', ');
  };

  if (wedstrijden.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="text-indigo-600" size={24} />
        </div>
        <h3 className="text-slate-800 font-bold">Geen wedstrijden gevonden</h3>
        <p className="text-slate-400 text-sm mt-1">Voeg een nieuwe wedstrijd toe om de planning te starten.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Datum & Naam</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Locatie & Adres</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Groepen</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {wedstrijden.map((wedstrijd) => (
              <tr key={wedstrijd.id} className="hover:bg-slate-50/50 transition-colors group">
                {/* Datum & Naam */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                      <Calendar size={14} />
                      <span className="text-xs font-bold uppercase">{wedstrijd.datum}</span>
                    </div>
                    <span className="font-bold text-slate-800">{wedstrijd.naam}</span>
                  </div>
                </td>

                {/* Locatie & Adres Concatenatie */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{wedstrijd.locatieNaam}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {wedstrijd.straat} {wedstrijd.huisnummer}, {wedstrijd.postcode} {wedstrijd.gemeente}
                    </span>
                  </div>
                </td>

                {/* Groepen als Tags */}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {wedstrijd.groepIds && wedstrijd.groepIds.length > 0 ? (
                      wedstrijd.groepIds.map(id => {
                        const groep = groepen.find(g => g.id === id);
                        return (
                          <span key={id} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            {groep?.naam || 'Onbekend'}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-300 italic">Geen groepen</span>
                    )}
                  </div>
                </td>

                {/* Acties */}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(wedstrijd)}
                      className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(wedstrijd)}
                      className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WedstrijdPlanningTable;
