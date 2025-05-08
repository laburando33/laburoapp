// /components/professional/VerificacionEstado.tsx
'use client';

import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase-web';

interface VerificacionEstadoProps {
  userId: string;
}

export default function VerificacionEstado({ userId }: VerificacionEstadoProps) {
  const [estado, setEstado] = useState<string>('no_verificado');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEstado = async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('verificacion_status')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        setEstado(data.verificacion_status);
      }
    };
    fetchEstado();
  }, [userId]);

  const solicitarVerificacion = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('professionals')
      .update({ verificacion_status: 'pendiente' })
      .eq('user_id', userId);

    if (error) {
      console.error("Error solicitando verificación:", error.message);
    } else {
      setEstado('pendiente');
      alert("✅ Solicitud de verificación enviada");
    }
    setLoading(false);
  };

  return (
    <div className="border p-4 rounded-lg shadow-sm">
      <h2 className="text-xl mb-2">Estado de Verificación</h2>
      <p className={`mb-3 text-${estado === 'pendiente' ? 'orange-500' : estado === 'verificado' ? 'green-500' : 'red-500'}`}>
        {estado}
      </p>
      {estado === 'no_verificado' && (
        <button
          onClick={solicitarVerificacion}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? '⏳ Enviando...' : '🔎 Solicitar Verificación'}
        </button>
      )}
      {estado === 'pendiente' && (
        <p className="text-gray-500">Tu solicitud está pendiente de aprobación.</p>
      )}
    </div>
  );
}
