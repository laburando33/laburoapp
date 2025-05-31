// app/professional/layout.tsx
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import DashboardProLayout from "@components/professional/DashboardProLayout";
import { CreditProvider } from "@components/context/CreditContext";

export default async function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <CreditProvider userId={user.id}>
      <DashboardProLayout role="profesional">{children}</DashboardProLayout>
    </CreditProvider>
  );
}
