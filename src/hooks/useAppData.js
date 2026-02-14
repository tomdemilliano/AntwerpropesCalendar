import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase'; // Pas het pad aan indien nodig
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

export const useAppData = (activeSeasonId) => {
  const [trainingen, setTrainingen] = useState([]);
  const [groepen, setGroepen] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [locaties, setLocaties] = useState([]);
  const [seizoenen, setSeizoenen] = useState([]);
  const [vasteTrainingen, setVasteTrainingen] = useState([]);
  const [beschikbareZalen, setBeschikbareZalen] = useState([]);
  const [zaalUitzonderingen, setZaalUitzonderingen] = useState([]);

  useEffect(() => {
    const unsubTrainingen = onSnapshot(query(collection(db, "planning"), orderBy("datum", "asc")), (snapshot) => {
      setTrainingen(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubGroepen = onSnapshot(collection(db, "groepen"), (snapshot) => {
      setGroepen(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCoaches = onSnapshot(collection(db, "coaches"), (snapshot) => {
      setCoaches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubLocaties = onSnapshot(collection(db, "locaties"), (snapshot) => {
      setLocaties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubSeizoenen = onSnapshot(query(collection(db, "seizoenen"), orderBy("startDatum", "desc")), (snapshot) => {
      setSeizoenen(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubVasteTrainingen = onSnapshot(collection(db, "vasteTrainingen"), (snapshot) => {
      setVasteTrainingen(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubBeschikbareZalen = onSnapshot(collection(db, "beschikbareZalen"), (snapshot) => {
      setBeschikbareZalen(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubUitzonderingen = onSnapshot(collection(db, "zaalUitzonderingen"), (snapshot) => {
      setZaalUitzonderingen(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { 
      unsubTrainingen(); unsubGroepen(); unsubCoaches(); 
      unsubLocaties(); unsubSeizoenen(); unsubVasteTrainingen(); 
      unsubBeschikbareZalen(); unsubUitzonderingen();
    };
  }, []);

  // Filter logica (Derived State)
  const filteredGroepen = useMemo(() => {
    const actueelSeizoen = seizoenen.find(s => s.id === activeSeasonId);
    if (!actueelSeizoen) return [];
    return groepen.filter(g => g.seizoen === actueelSeizoen.naam || g.seizoenId === actueelSeizoen.id);
  }, [groepen, seizoenen, activeSeasonId]);

  const filteredVasteTrainingen = useMemo(() => {
    const groepIdsInSeizoen = filteredGroepen.map(g => g.id);
    return vasteTrainingen.filter(v => groepIdsInSeizoen.includes(v.groepId));
  }, [vasteTrainingen, filteredGroepen]);

  return {
    trainingen, groepen, coaches, locaties, seizoenen, 
    vasteTrainingen, beschikbareZalen, zaalUitzonderingen,
    filteredGroepen, filteredVasteTrainingen
  };
};
