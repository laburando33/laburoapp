"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "@components/Sidebar";
import MobileNav from "@components/MobileNav";
import  styles  from "@styles/admin.module.css";

interface AdminDashboardLayoutProps {
  role: string;
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ role, children }: AdminDashboardLayoutProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.adminLayout}>
        <Sidebar role={role} />
        <main className={styles.adminContent}>
          {children}
          <MobileNav role={role} />
        </main>
      </div>
    </QueryClientProvider>
  );
}
