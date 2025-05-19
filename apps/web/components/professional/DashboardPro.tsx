"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import { SolicitudItem } from "@/components/SolicitudItem";
import styles from "./DashboardPro.module.css";
import Link from "next/link";

export default function DashboardPro({ userId }: { userId: string }) {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      setLoading(true);
      try {
        // 🗃️ Traer las solicitudes pendientes
        const { data, error } = await supabase
          .from("requests")
          .select("*")
          .eq("professional_id", userId);

        if (error) {
          console.error("❌ Error al cargar solicitudes:", error.message);
        } else {
          setSolicitudes(data);
        }
      } catch (err: any) {
        console.error("❌ Error al obtener solicitudes:", err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCredits = async () => {
      // 💳 Traer los créditos del profesional
      const { data, error } = await supabase
        .from("professional_credits")
        .select("credits")
        .eq("professional_id", userId)
        .maybeSingle();

      if (!error && data) {
        setCredits(data.credits);
      }
    };

    fetchSolicitudes();
    fetchCredits();
  }, [userId]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>💼 Tus Solicitudes de Trabajo</h2>
        
      </div>
      <div className={styles.credits}>
          Créditos disponibles: {credits}
          <Link href="/professional/shop">
            <button className={styles.buyCreditsButton}>
              Comprar Créditos
            </button>
          </Link>
        </div>
      {loading ? (
        <p>🔄 Cargando solicitudes...</p>
      ) : solicitudes.length > 0 ? (
        <div className={styles.solicitudesList}>
          {solicitudes.map((solicitud) => (
            <SolicitudItem key={solicitud.id} solicitud={solicitud} userId={userId} />
          ))}
        </div>
      ) : (
        <p>📭 No tienes solicitudes en este momento.</p>
      )}
    </div>
  );
}
