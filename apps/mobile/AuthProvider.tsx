import { useEffect } from "react";
import * as Linking from "expo-linking";
import { supabase } from "@repo/utils/supabase-native";
import { navigationRef } from "../navigationRef";

export function AuthProvider() {
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      console.log("🔗 Deep link recibido:", url);

      const { error } = await supabase.auth.exchangeCodeForSession(url);
      if (error) {
        console.error("❌ Error al intercambiar código:", error.message);
        return;
      }

      // Si querés usar rol del metadata para redirigir
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.user_metadata?.role === "profesional") {
        navigationRef.navigate("Dashboard");
      } else {
        navigationRef.navigate("InvitadoHome");
      }
    };

    const sub = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => sub.remove();
  }, []);

  return null;
}
