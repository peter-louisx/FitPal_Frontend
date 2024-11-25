"use client";

import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkAuth: () => boolean;
  targetCalories: number | null;
  caloriesToday: number | null;
  fetchUserData: (user: User) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  checkAuth: () => false,
  targetCalories: null,
  caloriesToday: null,
  fetchUserData: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [caloriesToday, setCaloriesToday] = useState<number | null>(null);
  const [targetCalories, setTargetCalories] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchUserData = async (user: User) => {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    await getDoc(doc(db, "user_calories", user?.uid ?? "")).then((doc) => {
      if (doc.exists()) {
        setTargetCalories(doc.data().calories);
      } else {
        setTargetCalories(null);
      }
    });

    await getDocs(
      query(
        collection(db, "user_calories", user?.uid ?? "", "user_intakes"),
        where("date", ">=", startTimestamp),
        where("date", "<", endTimestamp)
      )
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
      value={{
        user,
        checkAuth,
        loading,
        targetCalories,
        caloriesToday,
        fetchUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
