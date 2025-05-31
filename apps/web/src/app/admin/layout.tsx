// app/admin/layout.tsx
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import AdminDashboardLayout from "@components/admin/AdminDashboardLayout";

async function fetchUserProfile(supabase: any) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?msg=auth");
    return null;
  }

  const { data: prof, error: profErr } = await supabase
    .from("professionals")
    .select("role, verificacion_status")
    .eq("user_id", user.id)
    .single();

  if (profErr || !prof) {
    console.error("Perfil admin no encontrado:", profErr?.message);
    redirect("/login");
    return null;
  }

  return prof;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const profile = await fetchUserProfile(supabase);
  if (!profile) return null;
  return <AdminDashboardLayout role={profile.role}>{children}</AdminDashboardLayout>;
}
