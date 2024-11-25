"use client";

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";

export default function AppNavbar() {
  const { targetCalories, caloriesToday, loading } = useContext(AuthContext);

  return (
    <div className="flex justify-between  w-full p-4">
      <div>
        {" "}
        <SidebarTrigger />
      </div>

      <div className="flex items-center">
        {targetCalories != null && !loading && (
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
        )}

        {targetCalories == null && !loading && (
          <div className="flex justify-center items-center gap-2">
            <h1>You have not setup your calories</h1>
            <Link
              href="/calculator"
              className="border-black border p-1 rounded-xl hover:bg-slate-300  transition"
            >
              Set up your calories
            </Link>
          </div>
        )}
        {loading && <Loader2Icon size={32} className="animate-spin" />}
      </div>
    </div>
  );
}
