// src/components/professional/ActualizarVerificacion.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web"; // Asegúrate de que esta ruta sea correcta
import styles from "./DashboardPro.module.css"; // Usa el mismo CSS que DashboardPro

interface EstadoVerificacion {
  verificacion_status: string;
  comentario?: string;
}

export default function ActualizarVerificacion({ userId }: { userId: string }) {
  const [estado, setEstado] = useState<EstadoVerificacion | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEstado = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    // Esta consulta a 'professionals' es correcta si solo busca el estado de verificación
    // y el comentario directamente de la tabla principal del profesional.
    const { data, error } = await supabase
      .from("professionals")
      .select("verificacion_status, comentario")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("❌ Error al obtener verificación (initial fetch):", error.message);
    } else {
      setEstado(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchEstado(); // Realiza la carga inicial

    // Suscripción Realtime para actualizaciones del perfil
    console.log(`🚀 Intentando suscribirse a Realtime para el usuario: ${userId} en 'professionals'`);
    const channel = supabase
      .channel(`verificacion-profesional-${userId}`) // Canal único por usuario
      .on(
        "postgres_changes",
        {
          event: "*", // Escuchar todos los eventos
          schema: "public",
          table: "professionals", // Escuchar cambios en la tabla 'professionals'
          filter: `user_id=eq.${userId}`,
        },
        ({ new: nuevo }) => {
          console.log("⚡ Realtime Update recibido para verificación:", nuevo);
          setEstado(nuevo as EstadoVerificacion);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Estado de suscripción Realtime para verificación: ${status}`);
      });

    return () => {
      // Limpieza del canal al desmontar el componente
      console.log(`🧹 Desuscribiendo canal de Realtime para verificación: verificacion-profesional-${userId}`);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading) return <p>⏳ Cargando estado de verificación...</p>;
  if (!estado) return <p>⚠️ No se encontró información de verificación.</p>;

  const color =
    estado.verificacion_status === "verificado"
      ? "green"
      : estado.verificacion_status === "rechazado"
      ? "red"
      : "gray";

  return (
    <div style={{ border: `2px solid ${color}`, padding: "1rem", borderRadius: 8, marginTop: "1rem" }}>
      <p>
        <strong>Estado de Verificación:</strong>{" "}
        <span style={{ color }}>
          {estado.verificacion_status === "verificado" && "✅ Verificado"}
          {estado.verificacion_status === "pendiente" && "⏳ Pendiente"}
          {estado.verificacion_status === "rechazado" && "❌ Rechazado"}
          {estado.verificacion_status === "no_verificado" && "⚪ No verificado"}
        </span>
      </p>
      {estado.comentario && estado.verificacion_status === "rechazado" && (
        <p style={{ color: "red", marginTop: "0.5rem" }}>
          <strong>Comentario del rechazo:</strong> {estado.comentario}
        </p>
      )}
    </div>
  );
}