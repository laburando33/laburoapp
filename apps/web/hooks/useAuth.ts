
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data, error } = await supabase
          .from("professionals")
          .select("*")
          .eq("user_id", session.user.id)
          .limit(1);

        if (error) {
          console.error("❌ Error obteniendo datos de usuario:", error.message);
          setUserData(null);
        } else {
          setUserData(data?.[0] || null);
        }
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, userData };
}
