// apps/mobile/screens/AuthCallbackScreen.tsx
import { useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";

export default function AuthCallbackScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleDeepLink = async () => {
      const initialUrl = await Linking.getInitialURL();
      console.log("Deep link completo:", initialUrl);

      if (initialUrl) {
        const { queryParams } = Linking.parse(initialUrl);
        const { access_token, refresh_token } = queryParams;

        console.log("Tokens extraídos:", access_token, refresh_token);

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            Alert.alert("Error al iniciar sesión", error.message);
          } else {
            navigation.navigate("Dashboard");
          }
        } else {
          Alert.alert("Error", "No se detectó el token de sesión");
        }
      }
    };

    handleDeepLink();
  }, []);

  return null;
}
