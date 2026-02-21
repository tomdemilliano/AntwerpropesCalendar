import { 
  collection, query, where, getDocs, writeBatch, doc, deleteDoc 
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Plant trainingen in bulk in voor een specifiek seizoen
 */
// Voeg 'afwijkingen' toe aan de parameters van de functie
export const handleBulkSchedule = async (
  selectedSeasonId, 
  activeSeasonId, 
  selectedVasteIds, 
  seizoenen, 
  vasteTrainingen,
  trainingen,
  afwijkingen, // Nieuwe parameter
  includeAfwijkingen // Nieuwe parameter
) => {
  const seasonIdToUse = selectedSeasonId || activeSeasonId;
  if (!seasonIdToUse || selectedVasteIds.length === 0) return;

  const seizoen = seizoenen.find(s => s.id === seasonIdToUse);
  const trainingStartStr = seizoen.startTrainingen || seizoen.startDatum;
  const trainingEindStr = seizoen.eindTrainingen || seizoen.eindDatum;

  const start = new Date(trainingStartStr);
  const eind = new Date(trainingEindStr);
  const dagIndexen = { 'Zondag': 0, 'Maandag': 1, 'Dinsdag': 2, 'Woensdag': 3, 'Donderdag': 4, 'Vrijdag': 5, 'Zaterdag': 6 };

  const batch = writeBatch(db);
  let count = 0;

  for (const vasteId of selectedVasteIds) {
    const vaste = vasteTrainingen.find(v => v.id === vasteId);
    const targetDag = dagIndexen[vaste.dag];

    let loopDatum = new Date(start);
    while (loopDatum <= eind) {
      if (loopDatum.getDay() === targetDag) {
        const datumStr = loopDatum.toISOString().split('T')[0];
        
        // Check voor afwijkingen als de gebruiker dit heeft aangevinkt
        const afwijking = includeAfwijkingen 
          ? afwijkingen.find(a => a.vasteId === vaste.id && a.datum === datumStr)
          : null;

        // Skip "te behandelen" afwijkingen
        if (afwijking && afwijking.status === 'te behandelen') {
          // Doe niets, behandel als normale training of skip (volgens jouw logica: nog niet meenemen)
        } 
        else if (afwijking && afwijking.status === 'geannuleerd') {
          // Wel toevoegen, maar met status 'geschrapt'
          const docRef = doc(collection(db, "planning"));
          batch.set(docRef, {
            ...vaste,
            id: docRef.id,
            datum: datumStr,
            status: 'geschrapt', // Voor weergave in kalender
            origineleVasteId: vaste.id
          });
          count++;
          
          // Markeer afwijking als ingepland
          batch.update(doc(db, "afwijkingen", afwijking.id), { ingepland: true });
        } 
        else if (afwijking && afwijking.status === 'gewijzigd') {
          // Gebruik de nieuwe locatie en/of uren uit de afwijking
          const docRef = doc(collection(db, "planning"));
          batch.set(docRef, {
            ...vaste,
            id: docRef.id,
            datum: datumStr,
            locatieId: afwijking.nieuweLocatieId || vaste.locatieId,
            uren: afwijking.nieuweUren || `${vaste.startUur}-${vaste.eindUur}`,
            status: 'gewijzigd',
            origineleVasteId: vaste.id
          });
          count++;

          // Markeer afwijking als ingepland
          batch.update(doc(db, "afwijkingen", afwijking.id), { ingepland: true });
        } 
        else {
          // Standaard inplanning
          const docRef = doc(collection(db, "planning"));
          batch.set(docRef, {
            ...vaste,
            id: docRef.id,
            datum: datumStr,
            uren: `${vaste.startUur}-${vaste.eindUur}`
          });
          count++;
        }
      }
      loopDatum.setDate(loopDatum.getDate() + 1);
    }
  }

  await batch.commit();
  alert(`${count} trainingen succesvol ingepland.`);
};

/**
 * Verwijder alle planningen voor een specifiek seizoen
 */
export const handleDeleteAllPlannedForSeason = async (seizoen) => {
  const confirmDelete = window.confirm(
    `Weet u zeker dat u ALLE trainingen voor "${seizoen.naam}" wilt verwijderen?`
  );

  if (confirmDelete) {
    const q = query(
      collection(db, "planning"),
      where("datum", ">=", seizoen.startDatum),
      where("datum", "<=", seizoen.eindDatum)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
    alert(`${querySnapshot.size} trainingen verwijderd.`);
  }
};

/**
 * Verwijder een wekelijkse training en optioneel de planning
 */
export const handleDeleteVasteTraining = async (item, trainingen, isIngeplandFn) => {
  const isScheduled = isIngeplandFn(item);
  
  if (isScheduled) {
    const confirmDelete = window.confirm(
      "Er zijn reeds trainingen ingepland. Alles verwijderen?"
    );
    
    if (confirmDelete) {
      const batch = writeBatch(db);
      const relevantTrainingen = trainingen.filter(t => 
        t.groepId === item.groepId && t.uren === `${item.startUur}-${item.eindUur}`
      );
      relevantTrainingen.forEach(t => {
        batch.delete(doc(db, "planning", t.id));
      });
      batch.delete(doc(db, "vasteTrainingen", item.id));
      await batch.commit();
    }
  } else {
    if(window.confirm("Verwijderen?")) {
      await deleteDoc(doc(db, "vasteTrainingen", item.id));
    }
  }
};
