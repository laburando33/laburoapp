// components/client/LogoutWrapper.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase-web";

export default function LogoutWrapper() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await supabase.auth.signOut();
        console.log("✅ Sesión cerrada correctamente.");
        router.push("/login");
      } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
      }
    };

    logout();
  }, [router]);

  return null; // ✅ El componente retorna null correctamente
}
