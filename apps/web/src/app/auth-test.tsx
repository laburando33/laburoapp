"use client";
import { useEffect } from "react";
import { supabase } from "../lib/supabase-web";

export default function AuthTest() {
  useEffect(() => {
    const testSignUp = async () => {
      const email = `test${Math.floor(Math.random() * 1000)}@mail.com`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password: "Solotu22#"
      });

      console.log("✅ Resultado auth.signUp:");
      console.log("DATA:", data);
      console.log("ERROR:", error);
    };

    testSignUp();
  }, []);

  return <div>🧪 Probando Supabase signUp simple</div>;
}
