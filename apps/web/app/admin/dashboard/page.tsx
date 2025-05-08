'use client';

import Link from "next/link";
import styles from "./DashboardAdmin.module.css";

export default function DashboardAdminPage() {
  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>📊 Panel del Administrador</h1>

      <div className={styles.sectionGrid}>
        <Link href="/admin/profesionales" className={styles.card}>
          👨‍🔧 Ver Profesionales
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
      </div>
    </div>
  );
}
