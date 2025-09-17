"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "./DesbloqueosAdmin.module.css";

interface Desbloqueo {
  id: string;
  created_at: string;
  professionals: {
    full_name: string;
    email: string;
  };
  requests: {
    servicio: string;
    ubicacion: string;
    mensaje: string;
    nombre_cliente: string;
    email_cliente: string;
    telefono_cliente: string;
  };
}

export default function DesbloqueosAdmin() {
  const [desbloqueos, setDesbloqueos] = useState<Desbloqueo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDesbloqueos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("request_unlocks")
      .select(`
        id,
        created_at,
        professionals ( full_name, email ),
        requests:requests (
          servicio,
          ubicacion,
          mensaje,
          nombre_cliente,
          email_cliente,
          telefono_cliente
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error cargando desbloqueos:", error.message);
      setLoading(false);
      return;
    }

    setDesbloqueos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDesbloqueos();
  }, []);

  return (
    <div className={styles.container}>
      <h1>🔓 Desbloqueos realizados</h1>

      {loading ? (
        <p>⏳ Cargando datos...</p>
      ) : desbloqueos.length === 0 ? (
        <p>No hay desbloqueos registrados.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Profesional</th>
              <th>Email</th>
              <th>Servicio</th>
              <th>Ubicación</th>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {desbloqueos.map((d) => (
              <tr key={d.id}>
                <td>{d.professionals?.full_name || "—"}</td>
                <td>{d.professionals?.email || "—"}</td>
                <td>{d.requests?.servicio || "—"}</td>
                <td>{d.requests?.ubicacion || "—"}</td>
                <td>{d.requests?.nombre_cliente || "—"}</td>
                <td>
                  <div>
                    📧 {d.requests?.email_cliente || "—"}
                    <br />
                    📞 {d.requests?.telefono_cliente || "—"}
                  </div>
                </td>
                <td>{new Date(d.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
