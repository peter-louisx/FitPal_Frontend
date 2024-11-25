"use client";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function AppNavbar() {
  const { user, targetCalories, caloriesToday } = useContext(AuthContext);

  return (
    <div className="flex justify-between  w-full p-4">
      <div>
        {" "}
        <SidebarTrigger />
      </div>

      <div className="flex items-center">
        <div
          className={cn(
            "mb-4",
            targetCalories && caloriesToday && targetCalories < caloriesToday
              ? "text-red-500"
              : ""
          )}
        >
          <div className="text-center">Calories</div>
          <div className="text-2xl font-bold">
            {caloriesToday} / {targetCalories}
          </div>
        </div>
      </div>
    </div>
  );
}
