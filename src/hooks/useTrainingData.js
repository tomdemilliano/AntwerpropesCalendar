import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

export const useTrainingData = () => {
  const [trainingen, setTrainingen] = useState([]);
  const [groepen, setGroepen] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [locaties, setLocaties] = useState([]);
  const [seizoenen, setSeizoenen] = useState([]);
  const [vasteTrainingen, setVasteTrainingen] = useState([]);
  const [beschikbareZalen, setBeschikbareZalen] = useState([]);
  const [zaalUitzonderingen, setZaalUitzonderingen] = useState([]);
  const [activeSeasonId, setActiveSeasonId] = useState('');

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
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSeizoenen(data);
      
      const today = new Date().toISOString().split('T')[0];
      const huidigSeizoen = data.find(s => today >= s.startDatum && today <= s.eindDatum);
      if (huidigSeizoen && !activeSeasonId) {
        setActiveSeasonId(huidigSeizoen.id);
      } else if (data.length > 0 && !activeSeasonId) {
        setActiveSeasonId(data[0].id);
      }
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
  }, [activeSeasonId]);

  return {
    trainingen, groepen, coaches, locaties, seizoenen, 
    vasteTrainingen, beschikbareZalen, zaalUitzonderingen,
    activeSeasonId, setActiveSeasonId
  };
};
