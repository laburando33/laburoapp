import Link from "next/link";
import styles from "@/styles/admin.module.css";

export default function Sidebar({ role }: { role: string }) {
  return (
    <div className={styles.sidebar}>
      {role === "admin" ? (
        <>
          <Link href="/admin/dashboard" className={styles.link}>🏠 Dashboard</Link>
          <Link href="/admin/profesionales" className={styles.link}>👨‍🔧 Ver Profesionales</Link>
          <Link href="/admin/mensajes" className={styles.link}>📬 Enviar Mail Masivo</Link>
          <Link href="/admin/historial" className={styles.link}>🧾 Historial de Verificaciones</Link>
          <Link href="/admin/compras" className={styles.link}>💳 Historial de Compras</Link>
          <Link href="/admin/solicitudes-sin-desbloquear" className={styles.link}>🔒 Solicitudes Sin Desbloquear</Link>
          <Link href="/admin/desbloqueos" className={styles.link}>
          🔓 Desbloqueos Realizados
        </Link>
        </>
      ) : (
        <>
          <Link href="/professional/solicitudes" className={styles.link}>🔍 Mis Solicitudes</Link>
          <Link href="/professional/perfil" className={styles.link}>👤 Mi Perfil</Link>
          <Link href="/professional/historial" className={styles.link}>📜 Historial de Servicios</Link>
          <Link href="/professional/creditos" className={styles.link}>💳 Comprar Créditos</Link>
        </>
      )}
    </div>
  );
}
