"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import OneSignal from "react-onesignal";

declare global {
  interface Window {
    __ONESIGNAL_INITIALIZED__?: boolean;
  }
}

export default function OneSignalInit() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || initialized || window.__ONESIGNAL_INITIALIZED__) return;

    const initOneSignal = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log("🛑 Usuario no autenticado. No se inicializa OneSignal.");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("professionals")
          .select("verificacion_status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError || !profile) {
          console.log("❌ Perfil no encontrado o error:", profileError?.message);
          return;
        }

        if (profile.verificacion_status !== "verificado") {
          console.log("🟡 Usuario no verificado. No se inicializa OneSignal.");
          return;
        }

        // ✅ Inicializa OneSignal correctamente
        OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: true },
        });

        window.__ONESIGNAL_INITIALIZED__ = true;
        setInitialized(true);
        console.log("✅ OneSignal inicializado para:", user.email);
      } catch (err) {
        console.error("❌ Error inesperado al inicializar OneSignal:", err);
      }
    };

    // Inicializar al montar
    initOneSignal();

    // Suscribir a cambios de sesión
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && !window.__ONESIGNAL_INITIALIZED__) {
        initOneSignal();
      }
    });

    // Cleanup para evitar fugas de memoria
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [initialized]);

  return null;
}
