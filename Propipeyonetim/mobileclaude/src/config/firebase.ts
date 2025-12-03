import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDbGjgJiqQMOqRsMmSrZGJtWKw0GXRBESM",
  authDomain: "propipegemini.firebaseapp.com",
  projectId: "propipegemini",
  storageBucket: "propipegemini.firebasestorage.app",
  messagingSenderId: "409234416676",
  appId: "1:409234416676:web:2e1f4ca51fd7876aff24b1",
  measurementId: "G-EQ2D62YE6W"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
