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
  uitzonderingType
) => ({
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
  beschikbareZalen: {
    title: 'Beschikbare zalen',
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
    ] : (uitzonderingType === 'onbeschikbaar' ? [
      { name: 'datum', label: 'Datum', type: 'date' },
      { name: 'zaalId', label: 'Betreffende Vaste Planning', type: 'select', options: filteredBeschikbareZalen.map(z => ({ value: z.id, label: `${locaties.find(l => l.id === z.locatieId)?.naam} (${z.dag} ${z.startUur}-${z.eindUur})` })) },
      { name: 'reden', label: 'Reden van onbeschikbaarheid', type: 'text', placeholder: 'bv. Schoolfeest, onderhoud...' }
    ] : [
      { name: 'datum', label: 'Datum', type: 'date' },
      { isRow: true, fields: [{ name: 'startUur', label: 'Beginuur', type: 'time' }, { name: 'eindUur', label: 'Einduur', type: 'time' }] },
      { name: 'locatieId', label: 'Locatie', type: 'select', options: locaties.map(l => ({ value: l.id, label: l.naam })) },
      { name: 'zaaldelen', label: 'Zaaldelen', type: 'select', options: ['Volledige zaal', '1/2de zaal', '1/3de zaal', '2/3de zaal'] },
      { name: 'huurprijs', label: 'Huurprijs (€)', type: 'number', placeholder: '0.00' }
    ])
  },
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
  vasteTrainingen: { 
    title: 'Wekelijkse Trainingen', 
    collection: 'vasteTrainingen', 
    icon: <Clock size={18} />, 
    data: filteredVasteTrainingen, 
    fields: [
      { name: 'groepId', label: 'Groep', type: 'select', options: filteredGroepen.map(g => ({ value: g.id, label: g.naam })) },
      { isRow: true, fields: [
        { name: 'dag', label: 'Weekdag', type: 'select', options: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'] },
        { name: 'startUur', label: 'Start', type: 'time' },
        { name: 'eindUur', label: 'Einde', type: 'time' }
      ]},
      { name: 'coachIds', label: 'Coaches toewijzen', type: 'tag-input' },
      { name: 'locatieId', label: 'Locatie', type: 'select', isDynamic: true, options: [] }, 
      { name: 'ingepland', label: 'Ingepland', type: 'status' }
    ]
  }
});
