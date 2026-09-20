"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardShellProps {
  userName?: string;
  children: React.ReactNode;
}

export function DashboardShell({ userName, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-60">
        <Header
          title="HACCP管理システム"
          userName={userName}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
