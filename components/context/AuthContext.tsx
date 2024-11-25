"use client";

import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkAuth: () => boolean;
  targetCalories: number | null;
  caloriesToday: number | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  checkAuth: () => false,
  targetCalories: null,
  caloriesToday: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [caloriesToday, setCaloriesToday] = useState<number | null>(null);
  const [targetCalories, setTargetCalories] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchUserData = async (user: User) => {
    await getDoc(doc(db, "user_calories", user?.uid ?? "")).then((doc) => {
      if (doc.exists()) {
        console.log(doc.data());
        setTargetCalories(doc.data().target_calories);
      } else {
        setTargetCalories(null);
      }
    });

    await getDocs(
      collection(db, "user_calories", user?.uid ?? "", "user_intakes")
    ).then((querySnapshot) => {
      let totalCalories = 0;
      querySnapshot.forEach((doc) => {
        totalCalories += +doc.data().calories.total_calories;
      });
      setCaloriesToday(totalCalories);
    });
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserData(user).then(() => {
          setLoading(false);
        });
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
    <AuthContext.Provider
      value={{ user, checkAuth, loading, targetCalories, caloriesToday }}
    >
      {children}
    </AuthContext.Provider>
  );
};
