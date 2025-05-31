// app/professional/page.tsx
import ProfessionalDashboard from "@components/professional/ProfessionalDashboard";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfessionalPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <ProfessionalDashboard userId={user.id} />;
}
