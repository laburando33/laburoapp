"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "@components/Sidebar";
import MobileNav from "@components/MobileNav";
import styles from "@styles/DashboardPro.module.css";

interface DashboardProLayoutProps {
  role: string;
  children: React.ReactNode;
}

export default function DashboardProLayout({ role, children }: DashboardProLayoutProps) {
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
