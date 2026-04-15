import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppShell;
