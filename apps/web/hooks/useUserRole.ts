import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";

export const useUserRole = (userId: string | null) => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("professionals")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setRole(data.role);
        } else {
          setError("Rol no encontrado.");
        }
      } catch (err: any) {
        console.error("❌ Error obteniendo rol de usuario:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [userId]);

  return { role, loading, error };
};
