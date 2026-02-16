
import React from 'react';
import { Users, User, MapPin, Building2, CalendarDays, Clock } from 'lucide-react';

export const getSectionsConfig = (
  filteredGroepen, 
  coaches, 
  locaties, 
  filteredBeschikbareZalen, 
  filteredUitzonderingen, 
  seizoenen, 
  filteredVasteTrainingen,
  zaalTab,
  uitzonderingType,
  filteredAfwijkingen, 
  vasteTab
) => ({
  seizoenen: { 
    title: 'Seizoenen', 
    collection: 'seizoenen', 
    icon: <CalendarDays size={18} />, 
    data: seizoenen, 
    fields: [
      { name: 'naam', label: 'Naam Seizoen', type: 'text', placeholder: 'bv. 2025-2026' },
      { isRow: true, fields: [{ name: 'startDatum', label: 'Startdatum Seizoen', type: 'date' }, { name: 'eindDatum', label: 'Einddatum Seizoen', type: 'date' }] },
      { isRow: true, fields: [{ name: 'startTrainingen', label: 'Start Trainingen', type: 'date' }, { name: 'eindTrainingen', label: 'Einde Trainingen', type: 'date' }] }
    ]
  },
  locaties: { 
    title: 'Locaties', 
    collection: 'locaties', 
    icon: <MapPin size={18} />, 
    data: locaties, 
    fields: [
      { name: 'naam', label: 'Naam Locatie', type: 'text', placeholder: 'bv. Sporthal De Dreef' },
      { name: 'straat', label: 'Straat', type: 'text' },
      { name: 'huisnummer', label: 'Nr.', type: 'text' },
      { name: 'gemeente', label: 'Gemeente', type: 'text' },
      { name: 'uurtarief', label: 'Huur/uur (€)', type: 'number', placeholder: '0.00' }
    ]
  },
  coaches: { 
    title: 'Coaches', 
    collection: 'coaches', 
    icon: <User size={18} />, 
    data: coaches, 
    fields: [
      { name: 'voornaam', label: 'Voornaam', type: 'text', placeholder: 'Jan' },
      { name: 'achternaam', label: 'Achternaam', type: 'text', placeholder: 'Janssen' },
      { name: 'uurtarief', label: 'Uurtarief (€)', type: 'number', placeholder: '0.00' }
    ]
  },
  groepen: { 
    title: 'Trainingsgroepen', 
    collection: 'groepen', 
    icon: <Users size={18} />, 
    data: filteredGroepen, 
    fields: [
      { name: 'naam', label: 'Naam Groep', type: 'text', placeholder: 'bv. Selectie A' },
      { name: 'type', label: 'Type', type: 'select', options: ['Recrea', 'Volwassenen', 'Competitie'] },
      { name: 'aantalSpringers', label: 'Springers', type: 'number', placeholder: '0' },
      { name: 'coachIds', label: 'Vaste Coaches', type: 'tag-input' }
    ]
  },

  beschikbareZalen: {
    title: 'Zaalplanning',
    collection: zaalTab === 'weekplanning' ? 'beschikbareZalen' : 'zaalUitzonderingen',
    icon: <Building2 size={18} />,
    data: zaalTab === 'weekplanning' ? filteredBeschikbareZalen : filteredUitzonderingen,
    fields: zaalTab === 'weekplanning' ? [
      { name: 'locatieId', label: 'Locatie', type: 'select', options: locaties.map(l => ({ value: l.id, label: l.naam })) },
      { name: 'zaaldelen', label: 'Zaaldelen', type: 'select', options: ['Volledige zaal', '1/2de zaal', '1/3de zaal', '2/3de zaal'] },
      { isRow: true, fields: [
        { name: 'dag', label: 'Weekdag', type: 'select', options: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'] },
        { name: 'startUur', label: 'Beginuur', type: 'time' },
        { name: 'eindUur', label: 'Einduur', type: 'time' }
      ]},
      { name: 'huurprijs', label: 'Huurprijs (€)', type: 'number', placeholder: '0.00' }
    ] : [
      { name: 'datum', label: 'Datum', type: 'date' },
      { isRow: true, fields: [
        { name: 'startUur', label: 'Beginuur', type: 'time' },
        { name: 'eindUur', label: 'Einduur', type: 'time' }
      ]},
      { name: 'locatieId', label: 'Locatie', type: 'select', options: locaties.map(l => ({ value: l.id, label: l.naam })) },
      { name: 'zaaldelen', label: 'Zaaldelen', type: 'select', options: ['Volledige zaal', '1/2de zaal', '1/3de zaal', '2/3de zaal'] },
      { name: 'reden', label: 'Reden', type: 'text', placeholder: 'bv. Schoolfeest, onderhoud...' },
      { name: 'huurprijs', label: 'Huurprijs (€)', type: 'number', placeholder: '0.00' },
      // Verborgen veld voor de dropdown logica in de modal
      { name: 'zaalId', label: 'Betreffende Vaste Planning', type: 'select', options: filteredBeschikbareZalen.map(z => ({ value: z.id, label: `${locaties.find(l => l.id === z.locatieId)?.naam} (${z.dag} ${z.startUur}-${z.eindUur})` })), hideInTable: true }
    ]
  },

vasteTrainingen: {
      title: 'Jaarplanning',
      collection: vasteTab === 'vaste-planning' ? 'vasteTrainingen' : 'afwijkingen',
      icon: <Clock size={18} />,    
      data: vasteTab === 'vaste-planning' ? filteredVasteTrainingen : filteredAfwijkingen,
      fields: vasteTab === 'vaste-planning' ? [
        { name: 'groepId', label: 'Groep', type: 'select', options: filteredGroepen.map(g => ({ value: g.id, label: g.naam })) },
        { name: 'dag', label: 'Dag', type: 'select', options: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'] },
        { isRow: true, fields: [
          { name: 'startUur', label: 'Start', type: 'time' },
          { name: 'eindUur', label: 'Einde', type: 'time' }
        ]},
        { name: 'locatieId', label: 'Zaal', type: 'select', options: [] }, // Wordt dynamisch gevuld in App.jsx
        { name: 'status', label: 'Ingepland', type: 'status' }
      ] : [
        // VELDEN VOOR AFWIJKINGEN
        { name: 'vasteId', label: 'Oorspronkelijke Training', type: 'select', options: filteredVasteTrainingen.map(v => {
            const g = filteredGroepen.find(gr => gr.id === v.groepId);
            return { value: v.id, label: `${g?.naam} (${v.dag} ${v.startUur})` };
        })},
        { name: 'datum', label: 'Datum Afwijking', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: [
            { value: 'te behandelen', label: 'Te behandelen' },
            { value: 'geannuleerd', label: 'Geannuleerd' },
            { value: 'gewijzigd', label: 'Gewijzigd' }
        ]},
        { name: 'locatieId', label: 'Nieuwe Zaal (indien gewijzigd)', type: 'select', options: [] }, // Dynamisch
        { name: 'reden', label: 'Reden', type: 'text', placeholder: 'Optioneel' }
      ]
    }
});
