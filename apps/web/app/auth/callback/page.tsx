"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import { useRouter } from "next/navigation";
import styles from "./callback.module.css";

export default function CallbackPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMensaje("❌ Las contraseñas no coinciden.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("❌ Error:", error.message);
      setMensaje("❌ Error al actualizar la contraseña.");
    } else {
      setMensaje("✅ Contraseña actualizada. ¡Ahora podés ingresar!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <main className={styles.main}>
      <h2 className={styles.title}>🔑 Nueva Contraseña</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.inputField}
          type="password"
          placeholder="Nueva contraseña"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className={styles.inputField}
          type="password"
          placeholder="Confirmar nueva contraseña"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" className={styles.saveButton}>
          Cambiar contraseña
        </button>
      </form>

      {mensaje && <p className={styles.message}>{mensaje}</p>}
    </main>
  );
}
