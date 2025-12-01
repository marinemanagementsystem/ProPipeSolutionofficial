import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('username', '==', username)));
      if (snap.empty) throw new Error('Kullanıcı bulunamadı');
      const docSnap = snap.docs[0];
      const data = docSnap.data();
      if (data.password !== password) throw new Error('Şifre hatalı');
      const logged = { id: docSnap.id, ...data };
      setUser(logged);
      return logged;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAdmin: user?.role === 'admin', login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
