"use client";

import { useEffect, useState } from "react";
import OneSignal from "react-onesignal";

declare global {
  interface Window {
    __ONESIGNAL_INITIALIZED__?: boolean;
  }
}

export default function NotificationMonitor() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // ✅ Evitar inicialización duplicada
    if (window.__ONESIGNAL_INITIALIZED__) return;

    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          allowLocalhostAsSecureOrigin: true,
        });

        console.log("✅ OneSignal inicializado correctamente.");
        window.__ONESIGNAL_INITIALIZED__ = true;

        // ✅ Escuchar notificaciones en tiempo real
        OneSignal.on("notificationDisplay", (event) => {
          console.log("🔔 Notificación recibida:", event);
          setNotifications((prev) => [
            ...prev,
            {
              title: event.heading,
              message: event.content,
              time: new Date().toLocaleTimeString(),
            },
          ]);
        });

      } catch (error) {
        console.error("❌ Error inicializando OneSignal:", error);
      }
    };

    initOneSignal();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Notificaciones en Tiempo Real:</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No se han recibido notificaciones aún.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notif, index) => (
            <li
              key={index}
              className="border border-gray-200 p-3 rounded-md shadow-sm bg-white"
            >
              <p>
                <strong>🔔 Título:</strong> {notif.title}
              </p>
              <p>
                <strong>📄 Mensaje:</strong> {notif.message}
              </p>
              <p>
                <strong>🕒 Recibida:</strong> {notif.time}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
