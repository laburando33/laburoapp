import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import { useUser } from "@supabase/auth-helpers-react";

export function usePerfil() {
  const user = useUser();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchPerfil = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        setError("Error al obtener el perfil.");
        console.error("❌ Error cargando perfil:", fetchError);
        setLoading(false);
        return;
      }

      if (!data) {
        const { data: inserted, error: insertError } = await supabase.from("professionals").insert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? "",
          avatar_url: user.user_metadata?.avatar_url ?? "",
          role: "profesional",
          is_verified: false,
          verificacion_status: "pendiente",
        }).select().maybeSingle();

        if (insertError) {
          setError("Error al crear perfil inicial.");
          console.error("❌ Error creando perfil:", insertError);
          setLoading(false);
          return;
        }

        setPerfil(inserted);
      } else {
        setPerfil(data);
      }

      setLoading(false);
    };

    fetchPerfil();
  }, [user]);

  return { perfil, loading, error };
}
