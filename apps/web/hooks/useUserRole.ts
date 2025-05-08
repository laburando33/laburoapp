"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";

type RolUsuario = "admin" | "user" | null;

export function useUserRole(): { rol: RolUsuario; loading: boolean } {
  const [rol, setRol] = useState<RolUsuario>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRol = async () => {
      setLoading(true);
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setRol(null);
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("professionals")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !profile) {
        setRol(null);
      } else {
        setRol((profile.role as RolUsuario) || "user");
      }

      setLoading(false);
    };

    fetchRol();
  }, []);

  return { rol, loading };
}
