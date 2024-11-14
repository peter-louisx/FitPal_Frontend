"use client";

import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkAuth: () => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  checkAuth: () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false);
        setUser(user);
      } else {
        setLoading(false);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAuth = () => {
    if (!user) {
      return false;
    } else {
      return true;
    }
  };

  return (
    <AuthContext.Provider value={{ user, checkAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
