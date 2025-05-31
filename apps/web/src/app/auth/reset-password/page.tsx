// src/app/auth/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@lib/supabase-web";
import toast from "react-hot-toast"; // Asegúrate de tener react-hot-toast

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false); // Para asegurar que hay sesión antes de pedir la nueva contraseña

  useEffect(() => {
    // Verifica si hay una sesión activa. Si el usuario llegó aquí desde un email
    // de recuperación, Supabase ya debería haber procesado los tokens y la sesión debe estar activa.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsSessionReady(true);
        // Opcional: toast.success("¡Estás listo para actualizar tu contraseña!");
      } else {
        toast.error("No se encontró una sesión válida para actualizar la contraseña. Por favor, intenta de nuevo desde el email de recuperación.");
        router.push("/login"); // Redirige si no hay sesión para evitar que el usuario se quede atascado
      }
    };
    checkSession();
  }, [router]);


  const handlePasswordReset = async () => {
    setLoading(true);
    // ✅ Aquí es donde realmente se actualiza la contraseña con la nueva.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("❌ Error al actualizar contraseña:", error.message);
      toast.error("Error al actualizar contraseña: " + error.message);
    } else {
      toast.success("✅ Contraseña actualizada correctamente.");
      // Después de actualizar, redirige al usuario al login o a su dashboard
      router.push("/login");
    }

    setLoading(false);
  };

  if (!isSessionReady) {
    return <p className="p-4 text-center">🔄 Preparando formulario de contraseña...</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">🔐 Ingresá tu nueva contraseña</h2>
      <input
        type="password"
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
        minLength={6} // Agrega una validación básica de longitud
      />
      <button
        onClick={handlePasswordReset}
        disabled={loading || !password || password.length < 6}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Actualizar Contraseña"}
      </button>
    </div>
  );
}