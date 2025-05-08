"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "@/styles/DashboardPro.module.css";
import SolicitudItem from "@/components/SolicitudItem";
import Link from "next/link";

export default function DashboardPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: perfilData, error: perfilError } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (perfilError || !perfilData) {
        setError("No se pudo cargar el perfil.");
        return;
      }
      setPerfil(perfilData);

      const { data: solicitudesData } = await supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false });

      setSolicitudes(solicitudesData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>🔄 Cargando Dashboard...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>👋 Hola, {perfil?.full_name.split(" ")[0]}</h1>

      <div className={styles.infoBox}>
        <p><strong>Estado de verificación:</strong> {perfil.is_verified ? "✅ Verificado" : "⏳ Pendiente"}</p>
        <p><strong>Créditos disponibles:</strong> {perfil?.credits || 0}</p>

        <Link href="/admin/shop">
          <button className={styles.buyCreditsButton}>📥 Comprar créditos</button>
        </Link>
      </div>

      <h2 className={styles.subTitle}>Últimas solicitudes</h2>

      <div className={styles.solicitudesList}>
        {solicitudes.length > 0 ? (
          solicitudes.map((solicitud) => (
            <SolicitudItem key={solicitud.id} solicitud={solicitud} userId={perfil.user_id} />
          ))
        ) : (
          <p className={styles.noSolicitudes}>No hay solicitudes recientes.</p>
        )}
      </div>
    </div>
  );
}
