// /components/context/CreditContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-web';

interface CreditContextProps {
  credits: number;
  updateCredits: (newCredits: number) => void;
}

const CreditContext = createContext<CreditContextProps | null>(null);

export const useCredits = () => {
  return useContext(CreditContext);
};

export const CreditProvider = ({ userId, children }: { userId: string; children: React.ReactNode }) => {
  const [credits, setCredits] = useState<number>(0);

  const updateCredits = (newCredits: number) => {
    setCredits(newCredits);
  };

  useEffect(() => {
    const fetchCredits = async () => {
      const { data, error } = await supabase
        .from('professional_credits')
        .select('credits')
        .eq('professional_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error cargando créditos:', error.message);
      } else {
        setCredits(data?.credits || 0);
      }
    };

    fetchCredits();

    const creditSubscription = supabase
      .channel('public:professional_credits')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'professional_credits' }, (payload) => {
        console.log("⏳ Créditos actualizados:", payload.new.credits);
        setCredits(payload.new.credits);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(creditSubscription);
    };
  }, [userId]);

  return (
    <CreditContext.Provider value={{ credits, updateCredits }}>
      {children}
    </CreditContext.Provider>
  );
};
