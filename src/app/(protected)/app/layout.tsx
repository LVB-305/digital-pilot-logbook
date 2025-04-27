"use client";

import "@/styles/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/nav/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-auto">{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}
