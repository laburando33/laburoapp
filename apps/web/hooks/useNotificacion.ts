'use client';

import { useCallback } from "react";

export const useNotificacion = () => {
  const enviarNotificacion = useCallback(
    async (userId: string, titulo: string, mensaje: string) => {
      try {
        const res = await fetch("/api/notify-professional", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            title: titulo,
            message: mensaje,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al enviar notificación");
        }

        console.log("🔔 Notificación enviada a:", userId);
        return true;
      } catch (err) {
        console.error("❌ Error al enviar notificación:", err);
        return false;
      }
    },
    []
  );

  return { enviarNotificacion };
};
