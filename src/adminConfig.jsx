import React from 'react';
import { Users, User, MapPin, Building2, CalendarDays, Clock, Calendar, Trophy } from 'lucide-react';

const dagenWeek = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
export const GROEP_TYPES = [
  { value: 'Competitie', label: 'Competitie' },
  { value: 'Recrea', label: 'Recrea' },
  { value: 'Volwassenen', label: 'Volwassenen' },
  { value: 'Demo', label: 'Demo' }
];

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
  vasteTab,
  tempVasteTraining,
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
      { name: 'naam', label: 'Naam Locatie', type: 'text' },
      { name: 'straat', label: 'Straat', type: 'text' },
      { name: 'huisnummer', label: 'Nr.', type: 'text' },
      { name: 'gemeente', label: 'Gemeente', type: 'text' },
      { name: 'email', label: 'E-mail', type: 'text' },
      { name: 'subLocatiesCount', label: 'Zalen', type: 'number' } // Handig voor overzicht
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
      { name: 'type', label: 'Type', type: 'select', options: GROEP_TYPES.map(t => t.value) },
      { name: 'aantalSpringers', label: 'Springers', type: 'number', placeholder: '0' },
      { name: 'coachIds', label: 'Vaste Coaches', type: 'tag-input' }
    ]
  },
  
  wedstrijden: {
    title: 'Wedstrijdplanning',
    collection: 'wedstrijden', 
    icon: <Trophy size={18} />, 
    columns: [
      { key: 'datum', label: 'Datum' },
      { key: 'naam', label: 'Naam Wedstrijd' },
      { key: 'locatieNaam', label: 'Locatie' },
      { 
        key: 'adres', 
        label: 'Adres',
        render: (item) => `${item.straat} ${item.huisnummer}, ${item.postcode} ${item.gemeente}`
      },
      {
        key: 'groepen', 
        label: 'Groep(en)',
        render: (item, { groepen }) => {
          return item.groepIds?.map(id => groepen.find(g => g.id === id)?.naam).join(', ') || '-';
        }
      }
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
  ] : (uitzonderingType === 'extra' ? [
      { name: 'datum', label: 'Datum', type: 'date' },
      { name: 'type', label: 'Type', type: 'text', hideInModal: true },
      { isRow: true, fields: [
        { name: 'startUur', label: 'Beginuur', type: 'time' }, 
        { name: 'eindUur', label: 'Einduur', type: 'time' }
      ]},
      { name: 'locatieId', label: 'Locatie', type: 'select', options: locaties.map(l => ({ value: l.id, label: l.naam })) },
      { name: 'zaaldelen', label: 'Zaaldelen', type: 'select', options: ['Volledige zaal', '1/2de zaal', '1/3de zaal', '2/3de zaal'] },
      { name: 'reden', label: 'Reden', type: 'text', placeholder: 'Optioneel (bv. Schoolfeest, extra training...)' },
      { name: 'huurprijs', label: 'Huurprijs (€)', type: 'number', placeholder: '0.00' }
    ] : [
      // VELDEN VOOR ONBESCHIKBAAR
      { name: 'datum', label: 'Datum', type: 'date' },
      { 
        name: 'weekplanningId', 
        label: 'Geplande training', 
        type: 'select', 
        options: [], // Wordt dynamisch gevuld in App.jsx
        hideInTable: true // Zorgt dat het niet in de grid komt
      },
      { name: 'type', label: 'Type', type: 'text', hideInModal: true },
      { isRow: true, fields: [
        { name: 'startUur', label: 'Start', type: 'time' },
        { name: 'eindUur', label: 'Einde', type: 'time' }
      ]},
      { name: 'locatieId', label: 'Locatie', type: 'select', options: locaties.map(l => ({ value: l.id, label: l.naam })) },
      { name: 'zaaldelen', label: 'Zaaldelen', type: 'select', options: ['Volledige zaal', '1/2de zaal', '1/3de zaal', '2/3de zaal'] },
      { name: 'reden', label: 'Reden', type: 'text', required: false, placeholder: 'Optioneel (bv. Schoolfeest, extra training...)' },
      { name: 'huurprijs', label: 'Huurprijs (€)', type: 'number', placeholder: '0.00' }
    ])  
},

vasteTrainingen: {
      title: 'Trainingsplanning',
      collection: vasteTab === 'vaste-planning' ? 'vasteTrainingen' : 'afwijkingen',
      icon: <Calendar size={18} />,    
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
  // 1. Informatieve velden (readonly in de modal via hideInModal indien gewenst, 
  // maar hier laten we ze staan zodat de planner ziet wat hij bewerkt)
        { name: 'datum', label: 'Datum Afwijking', type: 'date' },
        { 
          name: 'vasteId', 
          label: 'Oorspronkelijke Training', 
          type: 'select', 
          options: (() => {
            // 1. Haal de geselecteerde datum op uit de huidige form data 
            // (Je moet zorgen dat 'formData' beschikbaar is in deze scope, zie stap B)
           // const geselecteerdeDatum = currentFormData?.datum; 
            const geselecteerdeDatum = tempVasteTraining.datum; 
            let lijst = filteredVasteTrainingen;
            if (geselecteerdeDatum) {
              const datumObj = new Date(geselecteerdeDatum);
              const dagNaam = dagenWeek[datumObj.getDay()];
              // 2. Filter de vaste trainingen op deze dag
              lijst = filteredVasteTrainingen.filter(v => v.dag === dagNaam);
            }
            return lijst.map(v => {
              const g = filteredGroepen.find(gr => gr.id === v.groepId);
              return { value: v.id, label: `${g?.naam} (${v.dag} ${v.startUur})` };
            });
          })()
        },
        { name: 'reden', label: 'Reden (waarom onbeschikbaar)', type: 'text', required: false },

  // 2. De Actie-velden
        { 
          name: 'status', 
          label: 'Status/Actie', 
          type: 'select', 
          options: [
            { value: 'te behandelen', label: 'Nog te behandelen' },
            { value: 'geannuleerd', label: 'Training annuleren' },
            { value: 'gewijzigd', label: 'Verplaatsen naar andere zaal/uur' }
          ]
        },

  // 3. Velden voor de wijziging (enkel in te vullen als status 'gewijzigd' is)
        { 
          name: 'nieuweLocatieId', 
          label: 'Nieuwe zaal', 
          type: 'select', 
          required: false,
          options: locaties.map(l => ({ value: l.id, label: l.naam })) 
        },
        { 
    isRow: true, 
          fields: [
            { name: 'aangepastStartUur', label: 'Nieuw Beginuur', type: 'time', required: false },
            { name: 'aangepastEindUur', label: 'Nieuw Einduur', type: 'time', required: false }
          ]
        }
      ]
    }
});
