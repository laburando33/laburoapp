"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./ComprasAdmin.module.css";
import { FiEyeOff } from "react-icons/fi";

interface Pendiente {
  solicitud_id: string;
  created_at: string;
  servicio: string;
  ubicacion: string;
  tipo_propiedad: string;
  cliente_nombre: string;
  comentarios: string;
}

export default function SolicitudesSinDesbloquear() {
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("admin_solicitudes_pendientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error:", error.message);
      } else {
        setPendientes(data || []);
      }
    };

    fetchData();
  }, []);

  const reenviarNotificacion = async (id: string, servicio: string, ubicacion: string) => {
    try {
      setLoadingId(id);

      const res = await fetch("/api/admin/reenviar-notificacion", {
        method: "POST",
        body: JSON.stringify({ solicitudId: id, servicio, ubicacion }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();
      if (result.success) {
        alert(`✅ Notificación enviada a ${result.count} profesionales.`);
      } else {
        alert(`⚠️ ${result.error || "No se pudo notificar."}`);
      }
    } catch (error) {
      alert("❌ Error al reenviar notificación.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1><FiEyeOff /> Solicitudes sin desbloquear</h1>
      <p>Estas solicitudes aún no fueron vistas por ningún profesional.</p>

      {pendientes.length === 0 ? (
        <p>✅ No hay solicitudes pendientes por ahora.</p>
      ) : (
        <div className={styles.scrollTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Servicio</th>
                <th>Zona</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Comentarios</th>
                <th>Notificar</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((s) => (
                <tr key={s.solicitud_id}>
                  <td>{new Date(s.created_at).toLocaleString()}</td>
                  <td>{s.servicio}</td>
                  <td>{s.ubicacion}</td>
                  <td>{s.tipo_propiedad}</td>
                  <td>{s.cliente_nombre}</td>
                  <td>{s.comentarios}</td>
                  <td>
                    <button
                      onClick={() => reenviarNotificacion(s.solicitud_id, s.servicio, s.ubicacion)}
                      disabled={loadingId === s.solicitud_id}
                      className={styles.exportButton}
                    >
                      {loadingId === s.solicitud_id ? "Enviando..." : "🔔 Notificar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
