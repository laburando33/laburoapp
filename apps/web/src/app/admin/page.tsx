// app/admin/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AdminPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return router.push("/login");
      // redirige según rol
      supabase
        .from("professionals")
        .select("role")
        .eq("user_id", session.user.id)
        .single()
        .then(({ data }) => {
          if (data?.role === "admin") router.replace("/admin/dashboard");
          else router.replace("/login");
        });
    });
  }, [router, supabase]);

  return <p>🔐 Cargando admin…</p>;
}
