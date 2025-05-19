"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./HistorialVerificacion.module.css";

interface Historial {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: string;
  verified_at: string;
  certificado_url?: string;
  dni_url?: string;
}

export default function HistorialVerificacionPage() {
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Obtener historial de verificaciones
  const fetchHistorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("verification_history")
        .select("*")
        .order("verified_at", { ascending: false });

      if (error) throw error;

      setHistorial(data || []);
    } catch (err: any) {
      console.error("❌ Error al cargar historial:", err.message);
      setError("No se pudo cargar el historial de verificaciones.");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Cargar historial al montar el componente
  useEffect(() => {
    fetchHistorial();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📜 Historial de Verificaciones</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : historial.length === 0 ? (
        <p>No hay verificaciones registradas.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Fecha de Verificación</th>
              <th>Certificado</th>
              <th>DNI</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((ver) => (
              <tr key={ver.id}>
                <td>{ver.full_name}</td>
                <td>{ver.email}</td>
                <td>
                  {ver.status === "verificado" ? "✅ Verificado" : "❌ Rechazado"}
                </td>
                <td>{new Date(ver.verified_at).toLocaleString()}</td>
                <td>
                  {ver.certificado_url ? (
                    <a
                      href={ver.certificado_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      📄 Ver Certificado
                    </a>
                  ) : (
                    "No disponible"
                  )}
                </td>
                <td>
                  {ver.dni_url ? (
                    <a
                      href={ver.dni_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      📸 Ver DNI
                    </a>
                  ) : (
                    "No disponible"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
