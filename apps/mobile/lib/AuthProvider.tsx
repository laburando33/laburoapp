// lib/AuthProvider.tsx
import { useEffect } from "react";
import * as Linking from "expo-linking";

export function AuthProvider() {
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log("Deep link recibido:", event.url);
      // El AuthCallbackScreen es quien se encarga de extraer tokens
      // No hacemos nada aquí
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}
