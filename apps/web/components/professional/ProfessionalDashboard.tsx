// /components/professional/ProfessionalDashboard.tsx
'use client';

import DashboardPro from "@/components/professional/DashboardPro";
import { CreditProvider } from '@/components/context/CreditContext';

export default function ProfessionalDashboard({ userId }: { userId: string }) {
  console.log("🟢 ID del usuario en el Dashboard:", userId); // <= Agregado para depurar

  return (
    <CreditProvider userId={userId}>
      <DashboardPro userId={userId} />
    </CreditProvider>
  );
}