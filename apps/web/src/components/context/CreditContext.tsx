// components/context/CreditContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@lib/supabase-web";

interface CreditContextType {
  credits: number;
  refetch: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType>({
  credits: 0,
  refetch: async () => {},
});

export const useCredits = () => useContext(CreditContext);

export function CreditProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const [credits, setCredits] = useState<number>(0);

  const fetchCredits = useCallback(async () => {
    const { data, error } = await supabase
      .from("credits")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();
    if (!error && data) {
      setCredits(data.balance ?? 0);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchCredits();

    const channel = supabase
      .channel(`credits-watch-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "credits",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new;
          if (updated?.balance !== undefined) {
            setCredits(updated.balance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchCredits]);

  return (
    <CreditContext.Provider value={{ credits, refetch: fetchCredits }}>
      {children}
    </CreditContext.Provider>
  );
}
