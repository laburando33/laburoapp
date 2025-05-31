"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@lib/supabase-web";
import styles from "./login.module.css";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("❌ " + error.message);
      setLoading(false);
      return;
    }

    if (!session) {
      toast.error("❌ Error al iniciar sesión");
      setLoading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("professionals")
      .select("role")
      .eq("user_id", session.user.id)
      .limit(1);

    if (userError) {
      toast.error("❌ Error al obtener datos del usuario");
      setLoading(false);
      return;
    }

    if (!userData || userData.length === 0) {
      await supabase.from("professionals").insert({
        user_id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata.full_name || "",
        phone: session.user.user_metadata.phone || "",
        location: session.user.user_metadata.location || "",
        category: session.user.user_metadata.category || "",
        role: session.user.user_metadata.role || "profesional",
        is_verified: false,
        created_at: new Date(),
      });

      const { data: retryData } = await supabase
        .from("professionals")
        .select("role")
        .eq("user_id", session.user.id)
        .limit(1);

      redirectToDashboard(retryData?.[0]?.role);
    } else {
      redirectToDashboard(userData[0].role);
    }

    setLoading(false);
  };

  const redirectToDashboard = (role: string | null) => {
    if (role === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/professional/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error("❌ Error al ingresar con Google");
    }
  };

  return (
    <div className={styles.main}>
      <form onSubmit={handleLogin} className={styles.formContainer}>
        <h2 className={styles.title}>Iniciar sesión</h2>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />

        <button type="submit" className={styles.loginButton} disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <div className={styles.forgotPassword}>
          <a href="/auth/forgot-password" className={styles.forgotLink}>¿Olvidaste tu contraseña?</a>
        </div>


        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogleLogin}
        >
          <img
            src="/google-icon.svg"
            alt="Google"
            style={{ width: 18, height: 18 }}
          />
          Ingresar con Google
        </button>

        <div className={styles.resendLink}>
          ¿No tenés cuenta?{" "}
          <a href="/register/profesional" className={styles.forgotLink}>Registrate y empeza a laburar.</a>
        </div>
      </form>
    </div>
  );
}
