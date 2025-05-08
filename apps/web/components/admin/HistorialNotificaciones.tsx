"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./ComprasAdmin.module.css";
import { FiBell } from "react-icons/fi";

interface Log {
  id: string;
  solicitud_id: string;
  servicio: string;
  ubicacion: string;
  enviados: number;
  enviado_en: string;
  cliente_nombre: string;
}

export default function HistorialNotificaciones() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("admin_notificaciones_log")
        .select("*")
        .order("enviado_en", { ascending: false });

      if (error) {
        console.error("❌ Error al cargar logs:", error.message);
      } else {
        setLogs(data || []);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className={styles.container}>
      <h1><FiBell /> Historial de Notificaciones</h1>
      <p>Registro de notificaciones enviadas por solicitud y zona.</p>

      {logs.length === 0 ? (
        <p>No hay registros aún.</p>
      ) : (
        <div className={styles.scrollTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Servicio</th>
                <th>Zona</th>
                <th>Cliente</th>
                <th>Cantidad</th>
                <th>ID Solicitud</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.enviado_en).toLocaleString()}</td>
                  <td>{log.servicio}</td>
                  <td>{log.ubicacion}</td>
                  <td>{log.cliente_nombre}</td>
                  <td>{log.enviados}</td>
                  <td style={{ fontSize: "0.75rem" }}>{log.solicitud_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
