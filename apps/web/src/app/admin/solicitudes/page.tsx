"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "./SolicitudesAdmin.module.css";

interface Solicitud {
  id: string;
  servicio: string;
  ubicacion: string;
  mensaje: string;
  nombre_cliente: string;
  email_cliente: string;
  telefono_cliente: string;
  created_at: string;
  unlocks: Unlock[];
}

interface Unlock {
  id: string;
  professional_id: string;
  created_at: string;
  professionals?: {
    full_name: string;
    email: string;
  };
}

export default function SolicitudesSinDesbloquear() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSolicitudes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("requests")
      .select(`
        id,
        servicio,
        ubicacion,
        mensaje,
        nombre_cliente,
        email_cliente,
        telefono_cliente,
        created_at,
        unlocks:request_unlocks (
          id,
          professional_id,
          created_at,
          professionals:professionals (
            full_name,
            email
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error al obtener solicitudes:", error.message);
      setLoading(false);
      return;
    }

    // solo mostramos solicitudes que NADIE haya desbloqueado
    const pendientes = (data || []).filter((s: Solicitud) => !s.unlocks || s.unlocks.length === 0);
    setSolicitudes(pendientes);
    setLoading(false);
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  return (
    <div className={styles.container}>
      <h1>🔒 Solicitudes sin desbloquear</h1>

      {loading ? (
        <p>⏳ Cargando solicitudes...</p>
      ) : solicitudes.length === 0 ? (
        <p>No hay solicitudes pendientes.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Ubicación</th>
              <th>Mensaje</th>
              <th>Cliente</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((s) => (
              <tr key={s.id}>
                <td>{s.servicio}</td>
                <td>{s.ubicacion}</td>
                <td>{s.mensaje}</td>
                <td>{s.nombre_cliente}</td>
                <td>{new Date(s.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
