"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";

export default function SignOut() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div onClick={() => signOut(auth)} className="cursor-pointer">
            <LogOut />
            <span>Logout</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
