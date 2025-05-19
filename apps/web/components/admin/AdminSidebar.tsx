// AdminSidebar.tsx
"use client";

import Link from "next/link";
import styles from "./AdminSidebar.module.css";

export default function AdminSidebar() {
  return (
    <div className={styles.sidebarContainer}>
      <h2 className={styles.title}>🔍 Administración</h2>
      <ul>
        <li>
          <Link href="/admin/dashboard">🏠 Dashboard</Link>
        </li>
        <li>
          <Link href="/admin/profesionales">👨‍🔧 Profesionales</Link>
        </li>
        <li>
          <Link href="/admin/compras">💳 Historial de Compras</Link>
        </li>
        <li>
          <Link href="/admin/solicitudes-sin-desbloquear">
            🔒 Solicitudes Sin Desbloquear
          </Link>
        </li>
        <li>
          <Link href="/admin/mensajes">📬 Enviar Mail Masivo</Link>
        </li>
        <li>
          <Link href="/admin/historial">🧾 Historial de Verificaciones</Link>
        </li>
      </ul>
    </div>
  );
}
