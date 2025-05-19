import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";  // 🔥 Usamos Sidebar dinámico
import MobileNav from "@/components/MobileNav"; 
import styles from "@/styles/admin.module.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect("/login?msg=auth");
  }

  // 🔎 Buscamos el perfil del usuario
  const { data: profile } = await supabase
    .from("professionals")
    .select("role, verificacion_status")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return (
      <main className={styles.adminContent}>
        <p>Error cargando perfil.</p>
      </main>
    );
  }

  // 🔀 Verificamos el rol y renderizamos el menú correcto
  const isAdmin = profile.role === "admin";
  const isProfesional = profile.role === "profesional";

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
