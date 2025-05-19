"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-web";

export default function VerificacionAdmin() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("verificacion_status", "pendiente");

      if (error) console.error(error);
      else setSolicitudes(data);
      setLoading(false);
    };

    fetchSolicitudes();
  }, []);

  const actualizarEstado = async (id: string, estado: string) => {
    await supabase
      .from("professionals")
      .update({ verificacion_status: estado })
      .eq("user_id", id);
    alert(`✅ Profesional ${estado} correctamente`);
    window.location.reload();
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Verificaciones Pendientes</h2>
      {solicitudes.map((sol) => (
        <div key={sol.user_id}>
          <p>{sol.full_name}</p>
          <button onClick={() => actualizarEstado(sol.user_id, "verificado")}>
            ✅ Aprobar
          </button>
          <button onClick={() => actualizarEstado(sol.user_id, "rechazado")}>
            ❌ Rechazar
          </button>
        </div>
      ))}
    </div>
  );
}
