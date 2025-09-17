import { useCallback } from "react";

export const useNotificacion = () => {
  const enviarNotificacion = useCallback(async (title: string, message: string, playerId: string) => {
    try {
      const response = await fetch("/api/notify-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          title,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error al enviar notificación:", errorData.error);
        return false;
      }

      console.log(`✅ Notificación enviada correctamente a ${playerId}`);
      return true;
    } catch (error: any) {
      console.error("❌ Error en enviarNotificacion:", error.message);
      return false;
    }
  }, []);

  return {
    enviarNotificacion,
  };
};
//                 <th>Acciones</th>
//               </tr>        