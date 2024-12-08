"use client";

import { doc, setDoc, getDoc, collection, getDocs , Timestamp, where, query} from "firebase/firestore";
import { db } from "@/firebase";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/components/context/AuthContext";
import { BarChartCalories } from "@/components/ui/bar-chart-calories";
import { PieChartCalories } from "@/components/ui/pie-chart-calories";
import { startOfDay, endOfDay, set } from 'date-fns';

interface Intake{
  name :  string,
  calories : number,
  fill : string
}

export default function Home() {
  const { user, caloriesToday, targetCalories, loading } = useContext(AuthContext);
  const [targetCalorie, setTargetCalorie] = useState<number>(0);
  const [intakes, setIntakes] = useState<Intake []>([]);
  const arrIntakes: Intake[] = [];


  let next = 1;
  const getColor = () => {
    if (next > 10) next = 1;
    return `hsl(var(--chart-${next++}))`;
  };

  // for some reason when i fetch the data directly in piechart, it duplicates the data
  const getAllTodayIntakes = async () => {

    const startTimestamp = Timestamp.fromDate(startOfDay(new Date()));
    const endTimestamp = Timestamp.fromDate(endOfDay(new Date()));

    await getDocs(
     query( collection(db, "user_calories", user?.uid ?? "", "user_intakes"), 
     where("date", ">=", startTimestamp), 
     where("date", "<", endTimestamp) 
    ))
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data().food_name, " => ", doc.data().calories.total_calories);
        const index = arrIntakes.findIndex((intake) => intake.name === doc.data().food_name);
        if (index !== -1){
          arrIntakes[index].calories += doc.data().calories.total_calories;
        }else{
          // setIntakes((prev) => { [...prev, {name:doc.data().food_name, calories: doc.data().calories.total_calories, fill: getRandomColor()}]})
          arrIntakes.push({name:doc.data().food_name, calories: doc.data().calories.total_calories, fill: getColor()})
        }
      });
    })
    .finally(() => setIntakes(arrIntakes))
      

};

  // const getTargetCalorie = async () => {
  //   const docRef = doc(db, "user_calories", user?.uid ?? "");
  //   const docSnap = await getDoc(docRef).then((doc) => {
  //     console.log(doc.data());
  //   });
  // };

  // const getAllTodayIntakes = async () => {
  //   //Get all documents in a collection
  //   const querySnapshot = await getDocs(
  //     collection(db, "user_calories", user?.uid ?? "", "user_intakes")
  //   ).then((querySnapshot) => {
  //     querySnapshot.forEach((doc) => {
  //       console.log(doc.id, " => ", doc.data());
  //     });
  //   });
  // };

  // useEffect(() => {
  //   console.log("bruh " , intakes);
  // }, [intakes]);


  useEffect(() => {
    if (user) {
    //   getTargetCalorie();
      getAllTodayIntakes();
    }
  }, [user]);

  return (
    <div>
      <div className="max-md:w-full py-4">
        <div className="w-[90%] max-md:w-full flex-col xl:flex-row m-auto flex justify-between gap-10">
            <PieChartCalories 
              isLoading={caloriesToday == null || targetCalories == null}
              intakes={intakes!}
              todayCalories={caloriesToday!}
              targetCalories={targetCalories!}
            />
          
          <BarChartCalories userId={user?.uid}/>
        </div>
      </div>
    </div>
  );
}
