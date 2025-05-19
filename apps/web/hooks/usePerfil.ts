import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";

interface Perfil {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  verificacion_status: string;
}

export const usePerfil = (userId: string | null) => {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPerfil = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("professionals")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;
        setPerfil(data);
      } catch (err: any) {
        console.error("❌ Error obteniendo perfil:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [userId]);

  return { perfil, loading, error };
};
