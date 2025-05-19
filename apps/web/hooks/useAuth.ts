// hooks/useAuth.ts
'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";

interface AuthContextProps {
  user: any;
  profile: any;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData, error } = await supabase.auth.getUser();
      if (userData?.user) {
        setUser(userData.user);

        // 🚀 Traemos el perfil completo
        const { data: profileData } = await supabase
          .from("professionals")
          .select("*")
          .eq("user_id", userData.user.id)
          .single();

        setProfile(profileData);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe ser usado dentro de AuthProvider");
  return context;
};
