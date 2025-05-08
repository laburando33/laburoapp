// apps/mobile/AuthProvider.tsx
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { Alert } from "react-native";
import { supabase } from "./lib/supabase";
import { roleRedirect } from "./roleRedirect";
import { navigationRef } from "./navigationRef";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (!url.includes("code=") || !url.includes("code_verifier=")) return;

      const { error } = await supabase.auth.exchangeCodeForSession(url);
      if (error) {
        Alert.alert("Error al iniciar sesión", error.message);
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (data.user) {
        roleRedirect(data.user.id);
      }
    };

    const sub = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink({ url });
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => sub.remove();
  }, []);

  return <>{children}</>;
};
