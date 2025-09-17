// components/professional/ProfessionalDashboard.tsx
"use client";

import DashboardPro from "./DashboardPro";

export default function ProfessionalDashboard({
  userId,
}: {
  userId: string;
}) {
  return <DashboardPro userId={userId} />;
}
