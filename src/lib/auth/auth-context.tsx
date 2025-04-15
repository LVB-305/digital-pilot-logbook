"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Dynamically import Firebase auth to ensure it only runs on the client
    const initializeAuth = async () => {
      try {
        const { getAuth, onAuthStateChanged } = await import("firebase/auth");
        const { app } = await import("@/lib/firebase");

        const auth = getAuth(app);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
        });

        setAuthInitialized(true);

        return () => unsubscribe();
      } catch (error) {
        console.error("Error initializing Firebase Auth:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
