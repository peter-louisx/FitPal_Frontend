import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import AppNavbar from "@/components/ui/app-navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className=" w-full">
        <div>
          <AppNavbar />
        </div>
        <div>
          {" "}
          <div className="p-4 pt-6 ">{children}</div>
        </div>
      </main>
    </SidebarProvider>
  );
}
