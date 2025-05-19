'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const verifyUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data: userData } = await supabase
        .from("professionals")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (userData?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (userData?.role === "profesional") {
        router.push("/professional/dashboard");
      } else {
        router.push("/login");
      }
    };

    verifyUser();
  }, []);

  return (
    <div>
      <h1>🔐 Cargando...</h1>
    </div>
  );
}
