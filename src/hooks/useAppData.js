import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export const useAppData = () => {
  const [trainingen, setTrainingen] = useState([]);
  const [groepen, setGroepen] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [locaties, setLocaties] = useState([]);
  const [seizoenen, setSeizoenen] = useState([]);
  const [vasteTrainingen, setVasteTrainingen] = useState([]);
  const [beschikbareZalen, setBeschikbareZalen] = useState([]);
  const [zaalUitzonderingen, setZaalUitzonderingen] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes = [
      onSnapshot(query(collection(db, "planning"), orderBy("datum", "asc")), (s) => 
        setTrainingen(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, "groepen"), (s) => 
        setGroepen(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, "coaches"), (s) => 
        setCoaches(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, "locaties"), (s) => 
        setLocaties(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, "seizoenen"), orderBy("startDatum", "desc")), (s) => 
        setSeizoenen(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, "vasteTrainingen"), (s) => 
        setVasteTrainingen(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, "beschikbareZalen"), (s) => 
        setBeschikbareZalen(s.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, "zaalUitzonderingen"), (s) => 
        setZaalUitzonderingen(s.docs.map(d => ({ id: d.id, ...d.data() }))))
    ];

    setLoading(false);
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  return { trainingen, groepen, coaches, locaties, seizoenen, vasteTrainingen, beschikbareZalen, zaalUitzonderingen, loading };
};
