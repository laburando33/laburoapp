"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import type { Database } from "@/types/supabase";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace("/admin/profile");
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("❌ Error al iniciar sesión. Verifica tus credenciales.");
      setLoading(false);
      return;
    }

    toast.success("✅ Bienvenido!");
    setTimeout(() => {
      router.refresh();
      router.push("/admin/profile");
    }, 800);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) toast.error("❌ Error al iniciar con Google: " + error.message);
  };

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Iniciar sesión</h1>
      <form className={styles.formContainer} onSubmit={handleLogin}>
        <input
          className={styles.input}
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className={styles.loginButton} type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        <a href="/auth/forgot-password" style={{ color: "#fcb500", textDecoration: "underline" }}>
          ¿Olvidaste tu contraseña?
        </a>
      </p>

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <button className={styles.googleButton} onClick={handleGoogleLogin}>
          Continuar con Google
        </button>
      </div>
    </div>
  );
}
