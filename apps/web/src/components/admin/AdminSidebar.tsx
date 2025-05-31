"use client";

import Link from "next/link";
import styles from "./AdminSidebar.module.css";

export default function AdminSidebar() {
  return (
    <div className={styles.sidebarContainer}>
      <h2 className={styles.title}>🔧 Panel Admin</h2>
      <ul>
        <li><Link href="/admin/dashboard">🏠 Dashboard</Link></li>
        <li><Link href="/admin/profesionales">👨‍🔧 Profesionales</Link></li>
        <li><Link href="/admin/verificar-profesionales">🛂 Verificaciones</Link></li>
        <li><Link href="/admin/historial">📜 Historial de Verificaciones</Link></li>
        <li><Link href="/admin/compras">💳 Compras</Link></li>
        <li><Link href="/admin/solicitudes-sin-desbloquear">🔒 Solicitudes Pendientes</Link></li>
        <li><Link href="/admin/desbloqueos">🔓 Desbloqueos</Link></li>
        <li><Link href="/admin/mensajes">📬 Enviar Mensajes</Link></li>
        <li><Link href="/admin/settings">⚙️ Configuración</Link></li>
      </ul>
    </div>
  );
}
