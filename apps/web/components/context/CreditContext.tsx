"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";

interface CreditContextProps {
  credits: number;
  setCredits: (newCredits: number) => void;
}

const CreditContext = createContext<CreditContextProps>({
  credits: 0,
  setCredits: () => {},
});

export const useCredits = () => useContext(CreditContext);

export const CreditProvider = ({ children, userId }: any) => {
  const [credits, setCredits] = useState<number>(0);

  // ✅ Carga inicial de créditos
  useEffect(() => {
    const fetchCredits = async () => {
      const { data, error } = await supabase
        .from("professional_credits")
        .select("credits")
        .eq("professional_id", userId)
        .single();

      if (error) {
        console.error("❌ Error al obtener créditos:", error.message);
      } else {
        setCredits(data.credits);
      }
    };

    fetchCredits();

    // ✅ Suscripción a cambios en tiempo real
    const subscription = supabase
      .channel(`credits-changes-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "professional_credits",
          filter: `professional_id=eq.${userId}`,
        },
        (payload) => {
          console.log("🔄 Créditos actualizados en tiempo real:", payload.new.credits);
          setCredits(payload.new.credits);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return (
    <CreditContext.Provider value={{ credits, setCredits }}>
      {children}
    </CreditContext.Provider>
  );
};
