import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { UserProfile } from '../types/Expense';

interface AuthContextType {
      currentUserAuth: User | null;
      currentUserProfile: UserProfile | null;
      loading: boolean;
      login: (email: string, password: string) => Promise<void>;
      logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) {
            throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
};

interface AuthProviderProps {
      children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
      const [currentUserAuth, setCurrentUserAuth] = useState<User | null>(null);
      const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
      const [loading, setLoading] = useState(true);

      // Race condition'ı önlemek için son user uid'ini takip et
      const currentUserIdRef = useRef<string | null>(null);
      // Component mount durumunu takip et
      const isMountedRef = useRef(true);

      // User profile fetch fonksiyonu - race condition korumalı
      const fetchUserProfile = useCallback(async (user: User) => {
            const userId = user.uid;
            // Bu user'ın hala aktif user olup olmadığını kontrol et
            if (currentUserIdRef.current !== userId) {
                  return; // Farklı bir user aktif, bu işlemi iptal et
            }

            try {
                  const userDocRef = doc(db, 'users', userId);
                  const userDoc = await getDoc(userDocRef);

                  // Async işlem sonrası tekrar kontrol et
                  if (!isMountedRef.current || currentUserIdRef.current !== userId) {
                        return; // Component unmount olmuş veya user değişmiş
                  }

                  if (userDoc.exists()) {
                        setCurrentUserProfile(userDoc.data() as UserProfile);
                  } else {
                        // Fallback if profile doesn't exist
                        console.warn('User profile not found for uid:', userId);
                        setCurrentUserProfile({
                              id: userId,
                              email: user.email || '',
                              displayName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
                              role: 'ORTAK', // Default role
                              createdAt: {} as any, // Placeholder
                              updatedAt: {} as any // Placeholder
                        });
                  }
            } catch (error) {
                  // Hata durumunda da kontrol et
                  if (!isMountedRef.current || currentUserIdRef.current !== userId) {
                        return;
                  }
                  console.error('Error fetching user profile:', error);
                  setCurrentUserProfile(null);
            }
      }, []);

      useEffect(() => {
            isMountedRef.current = true;

            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                  if (!isMountedRef.current) return;

                  // Önce current user id'yi güncelle (race condition koruması)
                  currentUserIdRef.current = user?.uid || null;

                  setCurrentUserAuth(user);

                  if (user) {
                        await fetchUserProfile(user);
                  } else {
                        setCurrentUserProfile(null);
                  }

                  if (isMountedRef.current) {
                        setLoading(false);
                  }
            });

            return () => {
                  isMountedRef.current = false;
                  unsubscribe();
            };
      }, [fetchUserProfile]);

      const login = async (email: string, password: string) => {
            await signInWithEmailAndPassword(auth, email, password);
      };

      const logout = async () => {
            await signOut(auth);
      };

      const value = {
            currentUserAuth,
            currentUserProfile,
            loading,
            login,
            logout
      };

      return (
            <AuthContext.Provider value={value}>
                  {!loading && children}
            </AuthContext.Provider>
      );
};
