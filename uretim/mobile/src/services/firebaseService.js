import { db } from '../config/firebase';
import { collection, doc, getDocs, query, where, updateDoc } from 'firebase/firestore';

export const getTersaneler = async () => {
  const snap = await getDocs(collection(db, 'tersaneler'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getProjeler = async (tersaneId) => {
  const ref = collection(db, 'projeler');
  const snap = tersaneId ? await getDocs(query(ref, where('tersaneId', '==', tersaneId))) : await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getDepartmanlar = async (projeId) => {
  const ref = collection(db, 'departmanlar');
  const snap = projeId ? await getDocs(query(ref, where('projeId', '==', projeId))) : await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getTechizIsler = async (departmanId) => {
  const snap = await getDocs(query(collection(db, 'techizIsler'), where('departmanId', '==', departmanId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getBoruIsler = async (departmanId) => {
  const snap = await getDocs(query(collection(db, 'boruIsler'), where('departmanId', '==', departmanId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateTechizIs = (id, data) => updateDoc(doc(db, 'techizIsler', id), data);
export const updateBoruIs = (id, data) => updateDoc(doc(db, 'boruIsler', id), data);
export const getUstalar = async () => {
  const snap = await getDocs(collection(db, 'ustalar'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
