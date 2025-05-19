"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase-web";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("⚠️ Error al obtener sesión:", error.message);
        return;
      }
      if (session?.user) {
        // 🔄 Verificar si existe en "professionals"
        const { data: userData, error: userError } = await supabase
          .from("professionals")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (userError) {
          console.error("⚠️ Error al obtener datos del usuario:", userError.message);
          return;
        }

        // 🔀 Redirigir según el rol
        if (userData?.role === "admin") {
          router.replace("/admin/dashboard");
        } else if (userData?.role === "profesional") {
          router.replace("/professional/dashboard");
        } else {
          router.replace("/client/dashboard");
        }
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("⚠️ Completa todos los campos.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Error al iniciar sesión:", error.message);
      toast.error("❌ Verifica tus credenciales.");
      setLoading(false);
      return;
    }

    // 🔄 Verificar si existe en "professionals"
    const { data: userData, error: userError } = await supabase
      .from("professionals")
      .select("role")
      .eq("user_id", data.user?.id)
      .single();

    if (userError) {
      console.error("⚠️ Error al obtener datos del usuario:", userError.message);
      toast.error("⚠️ No se pudo obtener el perfil del usuario.");
      setLoading(false);
      return;
    }

    if (userData) {
      if (userData.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (userData.role === "profesional") {
        router.replace("/professional/dashboard");
      } else {
        router.replace("/client/dashboard");
      }
    } else {
      toast.error("⚠️ No se encontró el usuario en la base de datos.");
    }

    toast.success("✅ Bienvenido!");
    setLoading(false);
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
        <a
          href="/auth/forgot-password"
          style={{ color: "#fcb500", textDecoration: "underline" }}
        >
          ¿Olvidaste tu contraseña?
        </a>
      </p>
    </div>
  );
}
