// src/app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@lib/supabase-web";
import toast from "react-hot-toast"; // Asegúrate de tener react-hot-toast instalado

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Escucha cualquier cambio en el estado de autenticación de Supabase.
    // Supabase maneja internamente la lógica de intercambio de 'code' por sesión.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase Auth Event:", event);
      console.log("Supabase Session:", session);

      // Si el evento es 'SIGNED_IN' o 'INITIAL_SESSION' y hay una sesión,
      // significa que el usuario ha sido autenticado o su sesión restaurada.
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        // Redirige al usuario logueado. Puedes elegir entre /login o /professional/dashboard
        toast.success("¡Sesión iniciada correctamente!");
        router.push("/professional/dashboard"); // ✅ Opción A: Ir directo al dashboard
        // router.push("/login"); // ✅ Opción B: Ir a la página de login
      } else if (event === "SIGNED_OUT") {
        // En caso de que la sesión se cierre por algún motivo, redirige al login
        toast.error("Sesión cerrada.");
        router.push("/login");
      }
    });

    // Manejar el caso específico de restablecimiento de contraseña.
    // Supabase añade 'type=recovery' en la URL si el usuario viene de un email de "restablecer contraseña".
    const type = searchParams.get('type');
    if (type === 'recovery') {
      // Redirigir a una página dedicada para que el usuario ingrese la nueva contraseña.
      // Es importante que esta página no intente establecer la sesión con tokens,
      // sino que asuma que Supabase ya lo hizo y que hay una sesión para actualizar.
      toast.info("Por favor, ingresa tu nueva contraseña.");
      router.push('/auth/reset-password');
    }

    // Limpiar la suscripción al desmontar el componente para evitar fugas de memoria.
    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams]); // `searchParams` debe ser una dependencia para detectar cambios en los query params.

  // Mensaje que se muestra mientras se procesa la autenticación.
  return (
    <div className="p-4 text-center">
      <p>🔄 Procesando autenticación...</p>
      <p>Si no eres redirigido, por favor, ve a la <a href="/login" className="text-blue-500 hover:underline">página de inicio de sesión</a>.</p>
    </div>
  );
}