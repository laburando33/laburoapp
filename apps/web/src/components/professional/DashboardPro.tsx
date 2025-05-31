"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import { useCredits } from "@components/context/CreditContext";
import { usePerfil } from "@hooks/usePerfil";
import SolicitudItem from "@components/SolicitudItem";
import ActualizarVerificacion from "@components/professional/ActualizarVerificacion";
import VerificacionEstado from "@components/professional/VerificacionEstado";
import styles from "./DashboardPro.module.css";
import Link from "next/link";

export default function DashboardPro({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { perfil, loading: loadingPerfil } = usePerfil(userId);
  const { credits, refetch } = useCredits();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 📬 Cargar solicitudes del profesional
  useEffect(() => {
    if (!userId) return;

    const fetchSolicitudes = async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("professional_id", userId)
        .order("created_at", { ascending: false })
        .range((page - 1) * 10, page * 10 - 1);

      if (!error) setSolicitudes(data ?? []);
      setLoading(false);
    };

    fetchSolicitudes();
  }, [userId, page]);

  // 🔁 Escuchar cambios en créditos (realtime)
  useEffect(() => {
    const channel = supabase
      .channel(`credits-watch-ui-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "credits",
          filter: `user_id=eq.${userId}`,
        },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  if (loadingPerfil || loading) return <p>⏳ Cargando datos...</p>;

  return (
    <div className={styles.dashboardContainer}>
      {/* 🧾 Encabezado */}
      <div className={styles.header}>
        <h2 className={styles.title}>💼 Tus Solicitudes</h2>
        <p>
          Verificación:{" "}
          <strong>
            {perfil?.verificacion_status === "verificado"
              ? "✅ Verificado"
              : perfil?.verificacion_status === "pendiente"
              ? "⏳ Pendiente"
              : "❌ No verificado"}
          </strong>
        </p>
      </div>

      {/* 🪙 Créditos */}
      <div className={styles.credits}>
        🪙 Créditos disponibles: <strong>{credits}</strong>
        <Link href="/professional/shop">
          <button className={styles.buyCreditsButton}>Comprar Créditos</button>
        </Link>
      </div>

      {/* 📌 Estado de Verificación (en tiempo real) */}
      <ActualizarVerificacion userId={userId} />

      {/* 🔎 Botón para solicitar verificación (si aplica) */}
      {perfil?.verificacion_status === "no_verificado" && (
        <VerificacionEstado userId={userId} />
      )}

      {/* 📨 Solicitudes */}
      <h3>📬 Solicitudes recientes</h3>
      {solicitudes.length > 0 ? (
        <div className={styles.solicitudesList}>
          {solicitudes.map((s) => (
            <SolicitudItem key={s.id} solicitud={s} userId={userId} />
          ))}
        </div>
      ) : (
        <p>No hay solicitudes.</p>
      )}

      {/* 🔃 Paginación */}
      <div className={styles.pagination}>
        <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
          ◀ Anterior
        </button>
        <button onClick={() => setPage((p) => p + 1)}>Siguiente ▶</button>
      </div>
    </div>
  );
}
