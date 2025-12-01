import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyApOmJUX2keAH9hS8nqwHOEKJpNuOArLsE",
  authDomain: "propipeuretimtakip.firebaseapp.com",
  projectId: "propipeuretimtakip",
  storageBucket: "propipeuretimtakip.firebasestorage.app",
  messagingSenderId: "798305722230",
  appId: "1:798305722230:web:5aa88dee572db9b2402457"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
