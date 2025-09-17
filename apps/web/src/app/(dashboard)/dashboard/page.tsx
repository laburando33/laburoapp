"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "@styles/DashboardPro.module.css";
import SolicitudItem from "@components/SolicitudItem";
import Link from "next/link";
import { usePerfil } from "@hooks/usePerfil"; // ✅ nuevo hook

export default function DashboardPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const { perfil, loading: loadingPerfil, error } = usePerfil(userId || undefined); // ✅ nuevo hook

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setUserId(user.id);
    };
    init();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchSolicitudes = async () => {
      const { data } = await supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false });

      setSolicitudes(data || []);
      setLoadingSolicitudes(false);
    };
    fetchSolicitudes();
  }, [userId]);

  if (loadingPerfil || loadingSolicitudes) {
    return <div className={styles.loading}>⏳ Cargando...</div>;
  }

  if (error) {
    return <p className={styles.error}>❌ {error}</p>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>👋 Hola, {perfil?.full_name.split(" ")[0]}</h1>

      <div className={styles.infoBox}>
        <p><strong>Estado de verificación:</strong> {perfil?.verificacion_status === "verificado" ? "✅ Verificado" : "⏳ Pendiente"}</p>
        <p><strong>Créditos disponibles:</strong> {/* si querés agregar aquí los créditos */}</p>

        <Link href="/professional/shop">
          <button className={styles.buyCreditsButton}>🛒 Comprar créditos</button>
        </Link>
      </div>

      <h2 className={styles.subTitle}>Últimas solicitudes</h2>

      <div className={styles.solicitudesList}>
        {solicitudes.length > 0 ? (
          solicitudes.map((solicitud) => (
            <SolicitudItem key={solicitud.id} solicitud={solicitud} userId={perfil?.id} />
          ))
        ) : (
          <p className={styles.noSolicitudes}>No hay solicitudes recientes.</p>
        )}
      </div>
    </div>
  );
}
