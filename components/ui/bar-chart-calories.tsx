"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { collection, getDocs , Timestamp, where, query} from "firebase/firestore";
import { db } from "@/firebase";
import { useState, useContext, useEffect } from "react";
import { format } from "date-fns";
import { Loader2Icon ,  Flame } from "lucide-react";


function getCurrentWeekInterval() { 
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
  
  // always start from monday
  let start = new Date(today);
  if (dayOfWeek == 0) start.setDate(today.getDate() - 6);   
  else if (dayOfWeek > 1) start.setDate(today.getDate() - (dayOfWeek - 1));
  start.setHours(0, 0, 0, 0);

  // always end on sunday
  let end = new Date(start);
  if (dayOfWeek == 0) end.setDate(today.getDate());
  else end.setDate(today.getDate() + 6 - (dayOfWeek - 1));
  end.setHours(23, 59, 59, 999); 

  return { start, end };
}

const {start,end} = getCurrentWeekInterval();


const convertToDay = (date : Timestamp) => {
  const arr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = date.toDate().getDay();
  return arr[day];
}

interface Bar{
  day :  string,
  calories : number,
}

export function BarChartCalories({
  userId
}: {userId? : string}) {

  
  const [intakes, setIntakes] = useState<Bar []>([]);
  const arrIntakes: Bar[] = [];
  const [startTrackedDay, setStartTrackedDay] = useState<string>("");
  const [endTrackedDay, setEndTrackedDay] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [weeklyCalories, setWeeklyCalories] = useState<number>(0);

  const getWeeklyCalories = async () =>{
    setIsLoading(true);
    await getDocs(query(collection(db, "user_calories", userId ?? "", "user_intakes"),
    where("date", ">=", start),
    where("date", "<=", end)
  ))
    .then((resp) => {
      resp.forEach(element => {
        // console.log("hari: ",element.data().date, "calories: ", element.data().calories.total_calories)
        const index = arrIntakes.findIndex((intake) => intake.day === convertToDay(element.data().date));
        // if that food was eaten on that day, add the calories to the existing calories
        if (index !== -1) arrIntakes[index].calories += element.data().calories.total_calories;
        else arrIntakes.push({day: convertToDay(element.data().date), calories: element.data().calories.total_calories}) 
        setWeeklyCalories((cal) => cal + element.data().calories.total_calories);
      });
    })
    .finally(() => {
      setIntakes(arrIntakes);
      setIsLoading(false);
    });
  } 
  
  
  useEffect (() => {
    if (userId) getWeeklyCalories();
  }, [userId]);

  useEffect (() => {
    setStartTrackedDay(intakes[0]?.day);
    setEndTrackedDay(intakes[intakes.length - 1]?.day);
    // console.log('intakes bar', intakes);
    // console.log("start", start);
    // console.log("end", end);
  }, [intakes]);


  const chartConfig = {
    calories: {
      label: "Calories",
      // color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;
  
  const now = new Date();


  return (
    <Card className="flex-1">
      <CardHeader>
        {!isLoading && <>
          <CardTitle>Total calories consumed per day</CardTitle>
          <CardDescription>{startTrackedDay} - {endTrackedDay}, {format(now, "MMMM y")}</CardDescription>
        </> } 
      </CardHeader>

      <CardContent>
        {isLoading ? 
          <div className="flex flex-col flex-1 pb-0 items-center justify-center">
            <Loader2Icon color={"hsl(var(--chart-2))"} size={75} className="animate-spin" />
            <div className="text-[hsl(var(--chart-2))]">Loading...</div>
          </div>
          :
          <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={intakes}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="calories" fill="hsl(var(--chart-1))" radius={8} />
          </BarChart>
        </ChartContainer>
        }

      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        {!isLoading &&
        <>
          <div className="flex font-medium leading-none align-center items-center justify-center">
          Total of <span className="mx-1 font-bold">{weeklyCalories.toLocaleString()}</span> calories have been consumed<Flame className="mx-1.5 h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total calories consumed for the last {intakes.length} days
        </div>
        </>
        }
      </CardFooter>
    </Card>
  );
}
