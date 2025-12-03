import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { UserProfile } from "../types";

interface AuthContextType {
  currentUserAuth: User | null;
  currentUserProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUserAuth, setCurrentUserAuth] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUserIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMountedRef.current) return;

      if (user) {
        currentUserIdRef.current = user.id;
        setCurrentUserAuth(user);

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));

          if (!isMountedRef.current || currentUserIdRef.current !== user.uid) return;

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUserProfile({
              id: user.uid,
              email: userData.email || user.email || "",
              displayName: userData.displayName || user.displayName || "",
              role: userData.role || "ORTAK",
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
            });
          } else {
            setCurrentUserProfile({
              id: user.uid,
              email: user.email || "",
              displayName: user.displayName || user.email?.split("@")[0] || "",
              role: "ORTAK",
            });
          }
        } catch (error) {
          console.error("Kullanıcı profili yüklenemedi:", error);
          if (isMountedRef.current && currentUserIdRef.current === user.uid) {
            setCurrentUserProfile({
              id: user.uid,
              email: user.email || "",
              displayName: user.displayName || user.email?.split("@")[0] || "",
              role: "ORTAK",
            });
          }
        }
      } else {
        currentUserIdRef.current = null;
        setCurrentUserAuth(null);
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
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  const isAdmin = currentUserProfile?.role === "ADMIN" || currentUserProfile?.role === "super_admin";
  const isSuperAdmin = currentUserProfile?.role === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        currentUserAuth,
        currentUserProfile,
        loading,
        login,
        logout,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
