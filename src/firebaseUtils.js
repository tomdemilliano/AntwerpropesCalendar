import { 
  collection, query, where, getDocs, writeBatch, doc, deleteDoc 
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Plant trainingen in bulk in voor een specifiek seizoen
 */
export const handleBulkSchedule = async (
  selectedSeasonId, 
  activeSeasonId, 
  selectedVasteIds, 
  seizoenen, 
  vasteTrainingen,
  trainingen
) => {
  const seasonIdToUse = selectedSeasonId || activeSeasonId;
  if (!seasonIdToUse || selectedVasteIds.length === 0) return;

  const seizoen = seizoenen.find(s => s.id === seasonIdToUse);
  const trainingStartStr = seizoen.startTrainingen || seizoen.startDatum;
  const trainingEindStr = seizoen.eindTrainingen || seizoen.eindDatum;

  if (!trainingStartStr || !trainingEindStr) {
    alert("Zorg dat de start- en einddatum van de trainingen zijn ingevuld.");
    return;
  }

  const start = new Date(trainingStartStr);
  const eind = new Date(trainingEindStr);
  const dagIndexen = { 'Zondag': 0, 'Maandag': 1, 'Dinsdag': 2, 'Woensdag': 3, 'Donderdag': 4, 'Vrijdag': 5, 'Zaterdag': 6 };

  const q = query(
    collection(db, "planning"), 
    where("datum", ">=", trainingStartStr),
    where("datum", "<=", trainingEindStr)
  );
  const existingDocs = await getDocs(q);
  const batch = writeBatch(db);

  for (const vasteId of selectedVasteIds) {
    const vaste = vasteTrainingen.find(v => v.id === vasteId);
    const targetDag = dagIndexen[vaste.dag];

    // Verwijder bestaande matches om dubbelingen te voorkomen
    existingDocs.forEach(docSnap => {
      const data = docSnap.data();
      const d = new Date(data.datum);
      if (data.groepId === vaste.groepId && d.getDay() === targetDag) {
        batch.delete(docSnap.ref);
      }
    });

    // Plan nieuwe momenten
    let loopDate = new Date(start);
    while (loopDate <= eind) {
      if (loopDate.getDay() === targetDag) {
        const formattedDate = loopDate.toISOString().split('T')[0];
        const newDocRef = doc(collection(db, "planning"));
        batch.set(newDocRef, {
          datum: formattedDate,
          groepId: vaste.groepId,
          locatieId: vaste.locatieId,
          uren: `${vaste.startUur}-${vaste.eindUur}`,
          coachId: vaste.coachIds?.[0] || '',
          coachIds: vaste.coachIds || []
        });
      }
      loopDate.setDate(loopDate.getDate() + 1);
    }
  }

  await batch.commit();
  alert(`Trainingsmomenten succesvol ingepland!`);
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

export const handleResolveUitzondering = async (uitzondering, actie, nieuweLocatieId = null) => {
  const batch = writeBatch(db);
  const uitzRef = doc(db, "planningUitzonderingen", uitzondering.id);

  // 1. Zoek de specifieke training in de kalender (planning collectie)
  const q = query(
    collection(db, "planning"),
    where("datum", "==", uitzondering.datum),
    where("groepId", "==", uitzondering.groepId)
  );
  const snap = await getDocs(q);

  if (actie === 'annuleren') {
    batch.update(uitzRef, { status: 'geannuleerd' });
    snap.forEach(d => {
      batch.update(d.ref, { status: 'GEANNULEERD', label: '❌ Geannuleerd' });
    });
  } else if (actie === 'verplaatsen') {
    batch.update(uitzRef, { 
      status: 'verplaatst', 
      locatieId: nieuweLocatieId 
    });
    snap.forEach(d => {
      batch.update(d.ref, { 
        locatieId: nieuweLocatieId,
        status: 'GEWIJZIGD',
        opmerking: 'Zaalwijziging via beheer'
      });
    });
  }

  await batch.commit();
};
