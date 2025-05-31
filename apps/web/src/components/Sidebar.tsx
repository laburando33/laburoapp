import Link from "next/link";
import  styles  from "@styles/admin.module.css";

export default function Sidebar({ role }: { role: string }) {
  return (
    <div className={styles.sidebar}>
      {role === "admin" ? (
        <>
          <Link href="/admin/dashboard" className={styles.link}>🏠 Dashboard</Link>
          <Link href="/admin/profesionales" className={styles.link}>👨‍🔧 Profesionales</Link>
          <Link href="/admin/verificar-profesionales" className={styles.link}>🛂 Verificaciones</Link>
          <Link href="/admin/historial" className={styles.link}>📜 Historial</Link>
          <Link href="/admin/compras" className={styles.link}>💳 Compras</Link>
          <Link href="/admin/solicitudes-sin-desbloquear" className={styles.link}>🔒 Pendientes</Link>
          <Link href="/admin/desbloqueos" className={styles.link}>🔓 Desbloqueos</Link>
          <Link href="/admin/mensajes" className={styles.link}>📬 Mensajes</Link>
          <Link href="/admin/settings" className={styles.link}>⚙️ Configuración</Link>
        </>
      ) : (
        <>
          <Link href="/professional/dashboard" className={styles.link}>🏠 Inicio</Link>
          <Link href="/professional/shop" className={styles.link}>💳 Mis Créditos</Link>
          <Link href="/professional/verificacion" className={styles.link}>🛂 Verificación</Link>
          <Link href="/professional/perfil" className={styles.link}>👤 Perfil</Link>
          <Link href="/professional/desbloqueos" className={styles.link}>🔓 Mis Desbloqueos</Link>
        </>
      )}
    </div>
  );
}
