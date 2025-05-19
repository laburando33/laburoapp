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
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  // 🚀 Verificar si el usuario está autenticado antes de permitir cambios
  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("⚠️ Error al obtener sesión:", error.message);
        setMensaje("❌ No estás autenticado.");
        return;
      }

      if (data?.session) {
        setSessionActive(true);
      } else {
        setMensaje("❌ Sesión expirada. Inicia sesión nuevamente.");
      }
    };

    fetchSession();
  }, []);

  // ✅ Manejo del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMensaje("❌ Las contraseñas no coinciden.");
      return;
    }

    if (!sessionActive) {
      setMensaje("❌ Sesión no válida. Inicia sesión nuevamente.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("❌ Error al actualizar contraseña:", error.message);
      setMensaje("❌ No se pudo actualizar la contraseña.");
    } else {
      setMensaje("✅ Contraseña actualizada correctamente.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }

    setLoading(false);
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
          disabled={!sessionActive || loading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className={styles.inputField}
          type="password"
          placeholder="Confirmar nueva contraseña"
          required
          disabled={!sessionActive || loading}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" className={styles.saveButton} disabled={!sessionActive || loading}>
          {loading ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>

      {mensaje && <p className={styles.message}>{mensaje}</p>}
    </main>
  );
}
