import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDbGjgJiqQMOqRsMmSrZGJtWKw0GXRBESM",
  authDomain: "propipegemini.firebaseapp.com",
  projectId: "propipegemini",
  storageBucket: "propipegemini.firebasestorage.app",
  messagingSenderId: "409234416676",
  appId: "1:409234416676:web:2e1f4ca51fd7876aff24b1",
  measurementId: "G-EQ2D62YE6W",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
