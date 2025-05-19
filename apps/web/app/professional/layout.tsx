import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import styles from "@/styles/admin.module.css";

export default async function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect("/login?msg=auth");
  }

  const { data: profile, error: profileError } = await supabase
    .from("professionals")
    .select("role, verificacion_status")
    .eq("user_id", user.id)
    .single();

  if (!profile || profileError) {
    return (
      <main className={styles.adminContent}>
        <p>🚫 Error cargando el perfil.</p>
      </main>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <Sidebar role={profile.role} />
      <main className={styles.adminContent}>
        {children}
        <MobileNav role={profile.role} />
      </main>
    </div>
  );
}