import { createContext, useContext, useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('propipe_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(query(usersRef, where('username', '==', username)));
    if (snap.empty) throw new Error('Kullanıcı bulunamadı');
    const docSnap = snap.docs[0];
    const data = docSnap.data();
    if (data.password !== password) throw new Error('Şifre hatalı');
    const logged = { id: docSnap.id, ...data };
    setUser(logged);
    localStorage.setItem('propipe_user', JSON.stringify(logged));
    return logged;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('propipe_user');
  };

  const value = {
    user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
