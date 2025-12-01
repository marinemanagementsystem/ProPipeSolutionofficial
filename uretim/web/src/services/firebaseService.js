import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// USERS
export const getUsers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createUser = (data) => addDoc(collection(db, 'users'), { ...data, createdAt: serverTimestamp() });
export const updateUser = (id, data) => updateDoc(doc(db, 'users', id), data);
export const deleteUser = (id) => deleteDoc(doc(db, 'users', id));

// TERSANE
export const getTersaneler = async () => {
  const snapshot = await getDocs(collection(db, 'tersaneler'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const createTersane = (data) => addDoc(collection(db, 'tersaneler'), { ...data, createdAt: serverTimestamp() });
export const updateTersane = (id, data) => updateDoc(doc(db, 'tersaneler', id), data);
export const deleteTersane = (id) => deleteDoc(doc(db, 'tersaneler', id));

// PROJELER
export const getProjeler = async (tersaneId = null) => {
  const ref = collection(db, 'projeler');
  const snap = tersaneId ? await getDocs(query(ref, where('tersaneId', '==', tersaneId))) : await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const createProje = (data) => addDoc(collection(db, 'projeler'), { ...data, createdAt: serverTimestamp() });
export const updateProje = (id, data) => updateDoc(doc(db, 'projeler', id), data);
export const deleteProje = (id) => deleteDoc(doc(db, 'projeler', id));

// DEPARTMAN
export const getDepartmanlar = async (projeId = null) => {
  const ref = collection(db, 'departmanlar');
  const snap = projeId ? await getDocs(query(ref, where('projeId', '==', projeId))) : await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const createDepartman = (data) => addDoc(collection(db, 'departmanlar'), { ...data, createdAt: serverTimestamp() });
export const deleteDepartman = (id) => deleteDoc(doc(db, 'departmanlar', id));

// TECHIZ
export const getTechizIsler = async (departmanId) => {
  const snap = await getDocs(query(collection(db, 'techizIsler'), where('departmanId', '==', departmanId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const createTechizIs = (data) => addDoc(collection(db, 'techizIsler'), { ...data, createdAt: serverTimestamp() });
export const updateTechizIs = (id, data) => updateDoc(doc(db, 'techizIsler', id), { ...data, updatedAt: serverTimestamp() });
export const deleteTechizIs = (id) => deleteDoc(doc(db, 'techizIsler', id));

// BORU
export const getBoruIsler = async (departmanId) => {
  const snap = await getDocs(query(collection(db, 'boruIsler'), where('departmanId', '==', departmanId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const createBoruIs = (data) => addDoc(collection(db, 'boruIsler'), { ...data, createdAt: serverTimestamp() });
export const updateBoruIs = (id, data) => updateDoc(doc(db, 'boruIsler', id), { ...data, updatedAt: serverTimestamp() });
export const deleteBoruIs = (id) => deleteDoc(doc(db, 'boruIsler', id));

// USTALAR
export const getUstalar = async () => {
  const snap = await getDocs(collection(db, 'ustalar'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const createUsta = (data) => addDoc(collection(db, 'ustalar'), { ...data, createdAt: serverTimestamp() });
export const updateUsta = (id, data) => updateDoc(doc(db, 'ustalar', id), data);
export const deleteUsta = (id) => deleteDoc(doc(db, 'ustalar', id));

// UTILITIES
export const cleanupAllData = async () => {
  const collections = ['tersaneler', 'projeler', 'departmanlar', 'techizIsler', 'boruIsler', 'ustalar'];
  for (const name of collections) {
    const snap = await getDocs(collection(db, name));
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(doc(db, name, d.id)));
    await batch.commit();
  }
};

export const seedInitialData = async () => {
  const tersaneSnap = await getDocs(collection(db, 'tersaneler'));
  if (!tersaneSnap.empty) return;

  const sanmar = await addDoc(collection(db, 'tersaneler'), { name: 'Sanmar', createdAt: serverTimestamp() });
  const sefine = await addDoc(collection(db, 'tersaneler'), { name: 'Sefine', createdAt: serverTimestamp() });

  const projeler = ['383', '367', '368', '387', '404'];
  for (const projeNo of projeler) {
    const ref = await addDoc(collection(db, 'projeler'), {
      name: projeNo,
      tersaneId: sanmar.id,
      tersaneName: 'Sanmar',
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'departmanlar'), {
      name: 'Boru',
      type: 'boru',
      projeId: ref.id,
      projeName: projeNo,
      tersaneId: sanmar.id,
      tersaneName: 'Sanmar',
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'departmanlar'), {
      name: 'Teçhiz',
      type: 'techiz',
      projeId: ref.id,
      projeName: projeNo,
      tersaneId: sanmar.id,
      tersaneName: 'Sanmar',
      createdAt: serverTimestamp(),
    });
  }

  const ustalar = ['İdris Palabüyük', 'Mehmet Durmaz', 'Ali Yılmaz', 'Ahmet Kaya'];
  for (const u of ustalar) {
    await addDoc(collection(db, 'ustalar'), { name: u, createdAt: serverTimestamp() });
  }

  await addDoc(collection(db, 'users'), {
    username: 'admin',
    password: 'admin123',
    name: 'Admin',
    role: 'admin',
    createdAt: serverTimestamp(),
  });
};
