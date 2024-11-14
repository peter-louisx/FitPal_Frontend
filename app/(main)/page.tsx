"use client";

import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/components/context/AuthContext";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [targetCalorie, setTargetCalorie] = useState<number>(0);

  const getTargetCalorie = async () => {
    const docRef = doc(db, "user_calories", user?.uid ?? "");
    const docSnap = await getDoc(docRef).then((doc) => {
      console.log(doc.data());
    });
  };

  const getAllTodayIntakes = async () => {
    //Get all documents in a collection
    const querySnapshot = await getDocs(
      collection(db, "user_calories", user?.uid ?? "", "user_intakes")
    ).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
      });
    });
  };

  useEffect(() => {
    if (user) {
      getTargetCalorie();
      getAllTodayIntakes();
    }
  }, [user]);

  return <div></div>;
}
