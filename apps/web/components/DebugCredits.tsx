'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-web';

export default function DebugCredits() {
  const [userId, setUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndCredits = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('❌ Error obteniendo usuario:', userError?.message);
        setErrorMsg('Error obteniendo usuario');
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('credits')
        .select('total_credits')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error obteniendo créditos:', error.message);
        setErrorMsg('Error al obtener créditos: ' + error.message);
        return;
      }

      console.log('✅ Resultado de credits:', data);
      setCredits(data?.total_credits ?? 0);
    };

    fetchUserAndCredits();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🧪 Debug de Créditos</h2>
      <p><strong>User ID:</strong> {userId || 'No logueado'}</p>
      <p><strong>Créditos:</strong> {credits !== null ? credits : 'No leídos aún'}</p>
      {errorMsg && (
        <p style={{ color: 'red' }}>⚠️ {errorMsg}</p>
      )}
    </div>
  );
}
