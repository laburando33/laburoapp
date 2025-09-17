"use client";

import Link from "next/link";
import styles from "./DashboardAdmin.module.css";
import { useAdminStats } from "@hooks/useAdminStats";
import { supabase } from "@lib/supabase-web";

const StatsCard = ({ label, value, icon }: { label: string; value: number; icon: string }) => (
  <div className={styles.statCard}>
    {icon} <strong>{value}</strong> {label}
  </div>
);

const DashboardLinks = () => (
  <div className={styles.sectionGrid}>
    <Link href="/admin/profesionales" className={styles.card}>👨‍🔧 Ver Profesionales</Link>
    <Link href="/admin/verificar-profesionales" className={styles.card}>✅ Verificar Profesionales</Link>
    <Link href="/admin/mensajes" className={styles.card}>📬 Enviar Mail Masivo</Link>
    <Link href="/admin/historial" className={styles.card}>🧾 Historial Verificaciones</Link>
    <Link href="/admin/compras" className={styles.card}>💳 Historial de Compras</Link>
    <Link href="/admin/solicitudes-sin-desbloquear" className={styles.card}>🔒 Solici Sin Desbloquear</Link>
    <Link href="/admin/desbloqueos" className={styles.card}>🔓 Desbloqueos Realizados</Link>
    <Link href="/admin/dashboard" className={styles.card}>🏠 Dashboard</Link>
  </div>
);

export default function DashboardAdminPage() {
  const { data: stats, isLoading, error } = useAdminStats();

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>📊 Panel del Administrador</h1>

      {isLoading ? (
        <p>🔄 Cargando información...</p>
      ) : error ? (
        <p>❌ Error al cargar datos</p>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <StatsCard icon="👨‍🔧" label="Profesionales Registrados" value={stats?.profesionalles ?? 0}  />
            <StatsCard icon="📬" label="Mensajes Enviados" value={stats?.mensajes ?? 0} />
            <StatsCard icon="🧾" label="Verificaciones Realizadas" value={stats?.verificaciones ?? 0} />
            <StatsCard icon="📝" label="Solicitudes Activas" value={stats?.solicitudes ?? 0} />
            <StatsCard icon="💳" label="Compras de Créditos" value={stats?.compras ?? 0} />
            <StatsCard icon="⏳" label="Verificaciones Pendientes" value={stats?.pendientes ?? 0} />
          </div>

          <div className={styles.section}>
            <h2 className={styles.subtitle}>🆕 Nuevos Profesionales (últimas 24h)</h2>
            <ul className={styles.newList}>
              {!stats?.nuevos || stats.nuevos.length === 0 ? (
                <p>✅ No hay registros recientes</p>
              ) : (
                stats.nuevos.map((pro: any) => (
                  <li key={pro.user_id} className={styles.newItem}>
                    <span>
                      <strong>{pro.full_name}</strong> – {pro.email} ({pro.category})
                    </span>
                    <Link href={`/admin/profile/${pro.user_id}`}>
                      <button className={styles.secondaryButton}>Ver</button>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}

      <DashboardLinks />
    </div>
  );
}
