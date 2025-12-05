import { initializeApp } from 'firebase/app';
// @ts-ignore - React Native specific import
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config - propipegemini projesi
const firebaseConfig = {
  apiKey: "AIzaSyDbGjgJiqQMOqRsMmSrZGJtWKw0GXRBESM",
  authDomain: "propipegemini.firebaseapp.com",
  projectId: "propipegemini",
  storageBucket: "propipegemini.firebasestorage.app",
  messagingSenderId: "409234416676",
  appId: "1:409234416676:web:2e1f4ca51fd7876aff24b1",
  measurementId: "G-EQ2D62YE6W"
};

// Firebase App
const app = initializeApp(firebaseConfig);

// Auth with AsyncStorage persistence for React Native
// @ts-ignore - React Native specific initialization
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Firestore
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);

export default app;
