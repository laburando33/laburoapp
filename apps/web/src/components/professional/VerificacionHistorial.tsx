// src/components/professional/VerificacionHistorial.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web"; // Asegúrate de que esta ruta sea correcta
import styles from "./dashboardVerificacion.module.css"; // CSS para este componente

interface VerificationHistoryEntry {
  id: string; // <-- Asegúrate de que esta interfaz incluya 'id'
  status: string;
  verified_at: string | null;
  comentario?: string | null;
  // Añadimos full_name aquí si lo estamos insertando en la tabla
  full_name?: string | null;
}

export default function VerificacionHistorial({ userId }: { userId: string }) {
  const [history, setHistory] = useState<VerificationHistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerificationHistory = async () => {
      setLoading(true);

      if (!userId) {
        console.error("❌ userId no proporcionado para VerificacionHistorial");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("verification_history")
        // <--- AÑADIR 'id' aquí para poder usarlo como key
        .select("id, status, verified_at, comentario, full_name") // Incluye full_name si lo tienes en historial
        .eq("user_id", userId)
        .order("verified_at", { ascending: false }); // Ordena para ver el más reciente primero

      if (error) {
        console.error("❌ Error al cargar historial de verificación:", error.message);
        setHistory(null);
      } else {
        setHistory(data as VerificationHistoryEntry[] || []);
      }
      setLoading(false);
    };

    fetchVerificationHistory(); // Realiza la carga inicial

    // Suscripción Realtime para actualizaciones del historial
    console.log(`🔗 Intentando suscribirse a Realtime para historial de verificación: ${userId}`);
    const channel = supabase
      .channel(`verification_history_${userId}`) // Canal único por usuario
      .on(
        "postgres_changes",
        {
          event: "*", // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "verification_history",
          filter: `user_id=eq.${userId}`,
        },
        ({ new: newEntry, eventType }) => {
          console.log("⚡ Realtime Historial Update recibido:", newEntry);
          if (eventType === 'INSERT') {
            setHistory((prevHistory) => [newEntry as VerificationHistoryEntry, ...(prevHistory || [])]);
          } else if (eventType === 'UPDATE') {
            setHistory((prevHistory) => prevHistory?.map(entry =>
              entry.id === (newEntry as VerificationHistoryEntry).id ? (newEntry as VerificationHistoryEntry) : entry
            ) || []);
          }
          // Puedes añadir lógica para 'DELETE' si lo necesitas
        }
      )
      .subscribe();

    return () => {
      console.log(`🧹 Desuscribiendo canal de Realtime para historial: verification_history_${userId}`);
      supabase.removeChannel(channel);
    };

  }, [userId]);

  if (loading) return <p>Cargando historial de verificación...</p>;

  return (
    <div className={styles.verificationContainer} style={{ marginTop: '2rem' }}>
      <h2 className={styles.title}>Historial de Verificación</h2>
      {history && history.length > 0 ? (
        <div className={styles.historyList}>
          {history.map((entry) => (
            // <--- ¡USAR entry.id AQUÍ!
            <div key={entry.id} className={styles.statusEntry}>
              <p>
                <strong>Estado:</strong> {entry.status.toUpperCase()}
              </p>
              {entry.full_name && ( // Mostrar el nombre completo si está disponible
                <p>
                  <strong>Profesional:</strong> {entry.full_name}
                </p>
              )}
              {entry.verified_at && (
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(entry.verified_at).toLocaleDateString()}
                </p>
              )}
              {entry.comentario && entry.status === "rechazado" && (
                <p>
                  <strong>Comentario:</strong> {entry.comentario}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No hay historial de verificaciones para este profesional.</p>
      )}
    </div>
  );
}