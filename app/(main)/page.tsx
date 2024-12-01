"use client";

import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/components/context/AuthContext";
import { BarChartCalories } from "@/components/ui/bar-chart-calories";
import { PieChartCalories } from "@/components/ui/pie-chart-calories";

export default function Home() {
  const { user, caloriesToday, targetCalories, loading } =
    useContext(AuthContext);
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

  return (
    <div>
      <div className="max-md:w-full py-4">
        <div className="w-[90%] max-md:w-full m-auto flex justify-between  gap-10">
          {caloriesToday == null || targetCalories == null ? (
            <div>Loading...</div>
          ) : (
            <PieChartCalories
              todayCalories={caloriesToday}
              targetCalories={targetCalories}
            />
          )}

          <BarChartCalories />
        </div>
      </div>
    </div>
  );
}
