"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";

interface Solicitud {
  id: number;
  category: string;
  location: string;
  status: string;
  job_description: string;
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [profesionalId, setProfesionalId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('id, category, location, status, job_description')
        .eq('status', 'abierto');

      if (error) {
        console.error("Error obteniendo solicitudes:", error.message);
      } else {
        setSolicitudes(data || []);
      }
      setLoading(false);
    };

    // ⚡ Obtener el ID del profesional
    const fetchUser = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user) {
        setProfesionalId(user.id);
      }
    };

    fetchSolicitudes();
    fetchUser();
  }, []);

  if (loading) return <p>Cargando solicitudes...</p>;

  if (solicitudes.length === 0) return <p>No hay solicitudes abiertas.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📬 Solicitudes Abiertas</h1>

      <div style={{ marginTop: "2rem" }}>
        {solicitudes.map((solicitud) => (
          <div
            key={solicitud.id}
            style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}
          >
            <h3>Categoria: {solicitud.category}</h3>
            <p>📍 Ubicación: {solicitud.location}</p>
            <p>📄 Descripción: {solicitud.job_description}</p>
            <p>Estado: {solicitud.status}</p>

            {profesionalId && (
              <BotonDesbloquear
                profesionalId={profesionalId}
                presupuestoId={solicitud.id.toString()}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
