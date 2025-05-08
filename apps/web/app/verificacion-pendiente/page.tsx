"use client";

import Link from "next/link";
import styles from "@/components/profesional/dashboardVerificacion.module.css";
import { useSession } from "@supabase/auth-helpers-react";
import VerificacionProfesional from "@/components/profesional/VerificacionProfesional";
import { logout } from "@/lib/logout";
import { useRouter } from "next/navigation";

export default function VerificacionPendiente() {
  const session = useSession();
  const router = useRouter();

  if (!session?.user) {
    return (
      <main className={styles.verificacionBox}>
        <h2>⚠️ Sesión no encontrada</h2>
        <p>Necesitás iniciar sesión para ver esta página.</p>
        <Link href="/login" className={styles.ctaButton}>Ir a login</Link>
      </main>
    );
  }

  const cerrarSesion = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <main className={styles.verificacionBox}>
      <h2>🕒 Verificación en proceso</h2>
      <p>
        Tu perfil profesional está en revisión. Te notificaremos cuando sea aprobado.
      </p>

      <VerificacionProfesional userId={session.user.id} />

      <button onClick={cerrarSesion} className={styles.ctaButton} style={{ marginTop: "2rem" }}>
        🔐 Cerrar sesión
      </button>
    </main>
  );
}
