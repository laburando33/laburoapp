"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { supabase } from "@lib/supabase-web";

declare global {
  interface Window {
    __ONESIGNAL_INITIALIZED__?: boolean;
  }
}

let debounceTimeout: NodeJS.Timeout;

const patchOneSignalUser = (userId: string, playerId: string) => {
  if (debounceTimeout) clearTimeout(debounceTimeout);

  debounceTimeout = setTimeout(async () => {
    console.log("🔄 Actualizando OneSignal ID en Supabase...");

    try {
      const { error } = await supabase
        .from("professionals")
        .update({ onesignal_id: playerId })
        .eq("user_id", userId);

      if (error) {
        console.error("❌ Error al actualizar OneSignal ID:", error.message);
      } else {
        console.log("✅ OneSignal ID actualizado correctamente.");
      }
    } catch (err: unknown) {
      console.error("❌ Error en el PATCH de OneSignal:", (err as Error).message);
    }
  }, 300);
};

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 🚫 Evita en desarrollo para prevenir errores de red
    if (process.env.NODE_ENV !== "production") {
      console.warn("⏹️ OneSignal desactivado en desarrollo.");
      return;
    }

    if (window.__ONESIGNAL_INITIALIZED__) {
      console.log("⚠️ OneSignal ya estaba inicializado.");
      return;
    }

    const initOneSignal = async () => {
      try {
        console.log("🛠️ Inicializando OneSignal...");

        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: true,
            prenotify: true,
            showCredit: false,
            text: {
              "tip.state.unsubscribed": "Suscribirse a notificaciones",
              "tip.state.subscribed": "Estás suscrito a las notificaciones",
              "tip.state.blocked": "Has bloqueado las notificaciones",
            }
          }
        });

        window.__ONESIGNAL_INITIALIZED__ = true;
        console.log("🟢 OneSignal inicializado correctamente.");

        OneSignal.on("subscriptionChange", async (isSubscribed: boolean) => {
          console.log("🔄 Suscripción cambió:", isSubscribed);

          if (isSubscribed) {
            const playerId = await OneSignal.getUserId();
            console.log("🟢 Player ID:", playerId);

            if (playerId) {
              const { data, error } = await supabase.auth.getUser();
              if (error || !data.user) {
                console.error("❌ No se obtuvo usuario.");
                return;
              }

              patchOneSignalUser(data.user.id, playerId);
            }
          }
        });
      } catch (error: unknown) {
        console.error("❌ Error inicializando OneSignal:", (error as Error).message);
      }
    };

    initOneSignal();
  }, []);

  return null;
}
