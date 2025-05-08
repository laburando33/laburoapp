import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";
import { redirect } from "next/navigation";
import DashboardPro from "@/components/professional/DashboardPro"; 
import { CreditProvider } from "@/components/context/CreditContext"; 

export default async function ProfessionalDashboardPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?msg=auth");
  }

  return (
    <CreditProvider userId={user.id}>
      <DashboardPro userId={user.id} />
    </CreditProvider>
  );
}
