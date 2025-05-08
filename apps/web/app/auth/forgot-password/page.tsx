"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-web";
import styles from "./forgotPassword.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("⏳ Enviando correo de recuperación...");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    });

    if (error) {
      console.error("❌ Error:", error.message);
      setMensaje("❌ Error: " + error.message);
    } else {
      setMensaje("✅ Te enviamos un correo para recuperar tu contraseña.");
      setEnviado(true);
    }
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
        />
        <button type="submit" className={styles.saveButton}>
          Enviar enlace
        </button>
      </form>

      {mensaje && <p className={styles.message}>{mensaje}</p>}

      {enviado && (
        <p className={styles.resend}>
          ¿No recibiste el correo?{" "}
          <button
            onClick={() => router.refresh()}
            className={styles.resendButton}
          >
            Reenviar
          </button>
        </p>
      )}
    </main>
  );
}
