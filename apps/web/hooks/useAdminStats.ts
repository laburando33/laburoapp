import { useQuery } from "@tanstack/react-query";
import { supabase } from "@lib/supabase-web";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [
        { data: profesionales, error: errorProfesionales },
        { data: solicitudes, error: errorSolicitudes },
        { data: compras, error: errorCompras },
        { data: pendientes, error: errorPendientes },
        { data: nuevos, error: errorNuevos }
      ] = await Promise.all([
        supabase.from("professionals").select("*"),
        supabase.from("requests").select("*"),
        supabase.from("credit_purchases").select("*"),
        supabase.from("professionals").select("*").eq("verificacion_status", "pendiente"),
        supabase.from("professionals")
          .select("user_id, full_name, email, category")
          .gte("created_at", desde)
          .order("created_at", { ascending: false })
          .limit(5)
      ]);

      if (errorProfesionales || errorSolicitudes || errorCompras || errorPendientes || errorNuevos) {
        throw new Error("Error al cargar estadísticas");
      }

      return {
        profesionales: profesionales?.length || 0,
        solicitudes: solicitudes?.length || 0,
        compras: compras?.length || 0,
        pendientes: pendientes?.length || 0,
        nuevos: nuevos || [],
      };
    },
    refetchInterval: 10000,
    staleTime: 0,
  });
};
