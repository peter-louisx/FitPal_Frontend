import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className=" w-full">
        <SidebarTrigger />
        <div className="p-4 pt-6 ">{children}</div>
      </main>
    </SidebarProvider>
  );
}
