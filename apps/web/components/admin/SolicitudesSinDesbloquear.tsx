// SolicitudesSinDesbloquear.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./SolicitudesSinDesbloquear.module.css";

interface Request {
  id: string;
  job_description: string;
  category: string;
  location: string;
  status: string;
  user_email: string;
}

export default function SolicitudesSinDesbloquear() {
  const [solicitudes, setSolicitudes] = useState<Request[]>([]);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("status", "pendiente");

      if (data) setSolicitudes(data);
      if (error) console.error("Error al cargar solicitudes:", error.message);
    };

    fetchSolicitudes();
  }, []);

  return (
    <div className={styles.container}>
      <h1>🔒 Solicitudes Sin Desbloquear</h1>
      {solicitudes.length === 0 ? (
        <p>No hay solicitudes pendientes.</p>
      ) : (
        <ul>
          {solicitudes.map((solicitud) => (
            <li key={solicitud.id}>
              <strong>{solicitud.job_description}</strong>
              <p>📍 {solicitud.location} - {solicitud.category}</p>
              <p>📝 Estado: {solicitud.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
