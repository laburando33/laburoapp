"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@lib/supabase-web"; // Asegúrate de que esta ruta sea correcta
import styles from "./forgotPassword.module.css"; // Asegúrate de que la ruta a tu CSS sea correcta
import toast from "react-hot-toast"; // Si usas react-hot-toast, agrégalo aquí

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  // `mensaje` es útil para mostrar mensajes de estado al usuario.
  const [mensaje, setMensaje] = useState("");
  // `enviado` para controlar la visibilidad del botón de reenviar.
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false); // Para deshabilitar el botón mientras se envía
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Inicia el estado de carga
    setMensaje("⏳ Enviando correo de recuperación...");
    setEnviado(false); // Resetear estado de enviado

    // 🌐 Enviando solicitud para recuperar contraseña a Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // ✅ IMPORTANTE: Este redirectTo debe apuntar a tu página de callback.
      // Tu `auth/callback/page.tsx` se encargará de detectar `type=recovery`
      // y redirigir a `auth/reset-password`.
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    });

    if (error) {
      console.error("❌ Error al enviar enlace de recuperación:", error.message);
      setMensaje("❌ Error: " + error.message);
      toast.error("Error: " + error.message); // Si usas toast
    } else {
      setMensaje("✅ Te enviamos un correo para recuperar tu contraseña. Por favor, revisa tu bandeja de entrada.");
      setEnviado(true);
      toast.success("¡Enlace de recuperación enviado! Revisa tu email."); // Si usas toast
    }
    setLoading(false); // Finaliza el estado de carga
  };

  return (
    <main className={styles.main}>
      <h2 className={styles.title}>🔐 Recuperar Contraseña</h2>
      <p className={styles.subtitle}>
        Ingresá tu email para enviarte un enlace de recuperación.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.inputField}
          type="email"
          placeholder="Correo electrónico"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading} // Deshabilita el input mientras se envía
        />
        <button
          type="submit"
          className={styles.saveButton}
          disabled={loading || enviado} // Deshabilita si está cargando o ya se envió un enlace
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>

      {/* Mostrar mensajes de estado */}
      {mensaje && <p className={styles.message}>{mensaje}</p>}

      {/* Mostrar opción de reenviar solo después de que se haya enviado el primero */}
      {enviado && (
        <p className={styles.resend}>
          ¿No recibiste el correo?{" "}
          <button
            onClick={() => {
              setEmail(""); // Limpiar email para permitir un nuevo intento
              setMensaje(""); // Limpiar mensaje anterior
              setEnviado(false); // Permitir enviar de nuevo
              setLoading(false); // Asegurarse de que no esté en estado de carga
              router.refresh(); // Opcional, recarga la página si quieres resetear completamente
            }}
            className={styles.resendButton}
            disabled={loading} // Deshabilitar si ya está en proceso de reenviar
          >
            Reenviar
          </button>
        </p>
      )}
    </main>
  );
}