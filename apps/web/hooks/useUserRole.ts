
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";

export function useUserRole(userId?: string | null) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!userId) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("professionals")
        .select("role")
        .eq("user_id", userId)
        .limit(1);

      if (error) {
        console.error("❌ Error obteniendo rol:", error.message);
        setError(error.message);
        setRole(null);
      } else {
        setRole(data?.[0]?.role ?? null);
      }

      setLoading(false);
    };

    fetchRole();
  }, [userId]);

  return { role, loading, error };
}
