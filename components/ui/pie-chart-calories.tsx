"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/components/context/AuthContext";
import { Loader2Icon, Check, CircleAlert} from "lucide-react";
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
  ChartLegend,
  ChartLegendContent,

} from "@/components/ui/chart";

interface pie{
  name :  string,
  calories : number,
  fill : string
}

export function PieChartCalories({
  todayCalories,
  targetCalories,
  intakes,
  isLoading ,

}: {
  todayCalories: number;
  targetCalories: number;
  intakes: pie[];
  isLoading : boolean;

}) {

  const {user} = useContext(AuthContext);
  const [randomColor, setRandomColor] = useState<string>("");
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    calories:{
      label: "Calories"
    },
    target:{
      label: "Remaining Calories",
    }
  });
  
  // everytime intakes changes, update the chartConfig (the colored labels)
  useEffect(() => {
      setChartConfig((prev) => {
        const newConfig = {...prev};
        intakes.forEach((intake) => {
          newConfig[intake.name] = {
            label: intake.name
          }
        })
        return newConfig;
      })
    
  }, [intakes])
  

  // const caloriesChartConfig = {
  //   calories: {
  //     label: "Calories",
  //   },
  //   target: {
  //     label: "Calories Left",
  //     color: "f0f0f0",
  //   },
  // } satisfies ChartConfig;

  return (
    <Card className="flex flex-col flex-1">
      <CardHeader className="items-center pb-0">
      {!isLoading && <CardTitle>Total calories consumed today</CardTitle>}
      </CardHeader>

      {isLoading ?
       <CardContent className="flex flex-col flex-1 pb-0 items-center justify-center">
         <Loader2Icon color={"hsl(var(--chart-1))"} size={75} className="animate-spin" />
         <div className={`text-[hsl(var(--chart-1))]`}>Loading...</div>
      </CardContent>
      :
      <CardContent className="flex-1 flex flex-shrink-0 items-center">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[350px] w-10/12 "
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={
              todayCalories < targetCalories ?
              [...intakes, {
                  name: "target",
                  calories: todayCalories >= targetCalories ? 0 : targetCalories - todayCalories,
                  fill: "#f0f0f0",
                }
              ]
              : 
              [...intakes]
          }
            dataKey="calories"
            nameKey="name"
            innerRadius={65}
            strokeWidth={5}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >

                        {todayCalories.toLocaleString()}

                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Calories
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
          <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center text-black"
          />
        </PieChart>
      </ChartContainer>
    </CardContent>    
      }
      <CardFooter className="flex-col gap-2 text-sm">
      {!isLoading && 
        <>
          <div className="flex items-center gap-1.5 font-medium leading-none justify-center align-center">
          {todayCalories > targetCalories ? 
          <>
             <div>You have exceeded your daily calorie intake</div>
             <CircleAlert className="h-4  w-4" />
          </>
           : 
          <>
            <div>You're still within your daily calorie limit</div>
            <Check className="h-4  w-4" />
          </>
          }
          </div>
        <div className="leading-none text-muted-foreground">
          Showing total calories consumed today
        </div>
        </>
      }

      </CardFooter>
    </Card>
  );
}
