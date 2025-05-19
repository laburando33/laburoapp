'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./DashboardAdmin.module.css";
import { supabase } from "@/lib/supabase-web";
import { toast } from "react-hot-toast";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
export default function DashboardAdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: profesionales } = await supabase
          .from("professionals")
          .select("id");

        const { data: solicitudes } = await supabase
          .from("requests")
          .select("id");

        const { data: compras } = await supabase
          .from("credit_purchases")
          .select("id");

        setStats({
          profesionales: profesionales?.length || 0,
          solicitudes: solicitudes?.length || 0,
          compras: compras?.length || 0,
        });
      } catch (error) {
        toast.error("⚠️ Error al cargar estadísticas");
        console.error("Error al cargar estadísticas:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>📊 Panel del Administrador</h1>

      {loading ? (
        <p>Cargando información...</p>
      ) : (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            👨‍🔧 <strong>{stats.profesionales}</strong> Profesionales Registrados
          </div>
          <div className={styles.statCard}>
            📝 <strong>{stats.solicitudes}</strong> Solicitudes Activas
          </div>
          <div className={styles.statCard}>
            💳 <strong>{stats.compras}</strong> Compras de Créditos
          </div>
        </div>
      )}

      <div className={styles.sectionGrid}>
        <Link href="/admin/profesionales" className={styles.card}>
          👨‍🔧 Ver Profesionales
        </Link>
         <Link href="/admin/verificar-profesionales" className={styles.card}>
          ✅ Verificar Profesionales
        </Link>
        <Link href="/admin/mensajes" className={styles.card}>
          📬 Enviar Mail Masivo
        </Link>
        <Link href="/admin/historial" className={styles.card}>
          🧾 Historial de Verificaciones
        </Link>
        <Link href="/admin/compras" className={styles.card}>
          💳 Historial de Compras
        </Link>
        <Link href="/admin/solicitudes-sin-desbloquear" className={styles.card}>
          🔒 Solicitudes Sin Desbloquear 
        </Link>
        <Link href="/admin/desbloqueos" className={styles.card}>
          🔓 Desbloqueos Realizados
        </Link>
        <Link href="/admin/dashboard" className={styles.card}>🏠 Dashboard</Link>
      </div>
    </div>
  );
}
