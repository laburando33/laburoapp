import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import * as Linking from "expo-linking";
import { Alert } from "react-native";

const AuthContext = createContext(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Al iniciar, cargar sesión actual
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session?.user) setUser(data.session.user);
      setLoading(false);
    };
    getSession();
  }, []);

  // 2. Escuchar cambios de auth
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // 3. Escuchar deep links (ej: desde OTP link por email)
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(event.url);
      if (error) {
        Alert.alert("Error al procesar link", error.message);
        return;
      }
      if (data?.session?.user) {
        setUser(data.session.user);
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
