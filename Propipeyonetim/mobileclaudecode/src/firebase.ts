import { initializeApp } from 'firebase/app';
// @ts-ignore - React Native specific import
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config - aynı web uygulamasıyla aynı
const firebaseConfig = {
  apiKey: "AIzaSyDxdKtlrQwW8LJSzCj5lHMSMjJCJsWFFg8",
  authDomain: "propipeyonetim.firebaseapp.com",
  projectId: "propipeyonetim",
  storageBucket: "propipeyonetim.firebasestorage.app",
  messagingSenderId: "988329137329",
  appId: "1:988329137329:web:19b18d518a09b6b47c9ff9"
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
