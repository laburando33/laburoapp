import { createClient } from "@supabase/supabase-js";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface NotificationPayload {
  title: string;
  message: string;
  url?: string;
  externalUserIds?: string[];
}

/**
 * 🔔 Enviar notificaciones híbridas (OneSignal + Expo Push)
 */
export async function sendNotification({
  title,
  message,
  url,
  externalUserIds = [],
}: NotificationPayload) {
  const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!;
  const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY!;

  // 1️⃣ OneSignal Web Push
  if (externalUserIds.length > 0) {
    try {
      const onesignalBody: any = {
        app_id: ONESIGNAL_APP_ID,
        headings: { en: title },
        contents: { en: message },
        url,
        include_external_user_ids: externalUserIds,
      };

      const onesignalRes = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          Authorization: `Basic ${ONESIGNAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(onesignalBody),
      });

      const onesignalResult = await onesignalRes.json();
      console.log("🔔 OneSignal enviado correctamente:", onesignalResult);
    } catch (error) {
      console.error("❌ Error al enviar notificación a OneSignal:", error.message);
    }
  }

  // 2️⃣ Expo Push Notifications (Mobile)
  if (externalUserIds.length > 0) {
    try {
      const { data: users, error } = await supabase
        .from("professionals")
        .select("expo_push_token")
        .in("external_user_id", externalUserIds)
        .not("expo_push_token", "is", null);

      if (error) {
        console.error("❌ Error obteniendo tokens Expo:", error.message);
        return;
      }

      const messages = (users || [])
        .filter((u) => Expo.isExpoPushToken(u.expo_push_token))
        .map((u) => ({
          to: u.expo_push_token,
          sound: "default",
          title,
          body: message,
        }));

      if (messages.length > 0) {
        const receipts = await expo.sendPushNotificationsAsync(messages);
        console.log("📱 Notificaciones Expo enviadas correctamente:", receipts);
      } else {
        console.log("ℹ️ No se encontraron tokens válidos para Expo.");
      }
    } catch (error) {
      console.error("❌ Error en el envío Expo Push:", error.message);
    }
  }

  // 3️⃣ Guardar notificación en Supabase (Historial Interno)
  try {
    await supabase.from("notifications").insert({
      title,
      message,
      url,
      external_user_ids: externalUserIds,
      type: "hybrid",
    });
    console.log("🗃️ Notificación guardada en Supabase correctamente.");
  } catch (error) {
    console.error("❌ Error al guardar la notificación en Supabase:", error.message);
  }
}
