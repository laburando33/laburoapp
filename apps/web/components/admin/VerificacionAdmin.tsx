// /components/admin/VerificacionAdmin.tsx
'use client';

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase-web';

interface Profesional {
  id: string;
  full_name: string;
  email: string;
  verificacion_status: string;
  user_id: string;
}

export default function VerificacionAdmin() {
  const [solicitudes, setSolicitudes] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("verificacion_status", "pendiente");

      if (!error && data) {
        setSolicitudes(data);
      }
      setLoading(false);
    };

    fetchSolicitudes();

    // Suscripción en tiempo real
    const subscription = supabase
      .channel('public:professionals')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'professionals' }, (payload) => {
        if (payload.new.verificacion_status === 'pendiente') {
          setSolicitudes((prev) => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const aprobarSolicitud = async (user_id: string) => {
    const { error } = await supabase
      .from('professionals')
      .update({ verificacion_status: 'verificado' })
      .eq('user_id', user_id);

    if (!error) {
      alert("✅ Profesional Verificado");
      setSolicitudes((prev) => prev.filter((p) => p.user_id !== user_id));
    }
  };

  const rechazarSolicitud = async (user_id: string) => {
    const { error } = await supabase
      .from('professionals')
      .update({ verificacion_status: 'no_verificado' })
      .eq('user_id', user_id);

    if (!error) {
      alert("❌ Solicitud Rechazada");
      setSolicitudes((prev) => prev.filter((p) => p.user_id !== user_id));
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl mb-4">🔍 Verificaciones Pendientes</h1>

      {loading ? (
        <p>Cargando solicitudes...</p>
      ) : solicitudes.length > 0 ? (
        solicitudes.map((profesional) => (
          <div key={profesional.user_id} className="border p-3 mb-3 rounded-lg shadow-sm">
            <p><strong>Nombre:</strong> {profesional.full_name}</p>
            <p><strong>Email:</strong> {profesional.email}</p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => aprobarSolicitud(profesional.user_id)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                ✅ Aprobar
              </button>
              <button
                onClick={() => rechazarSolicitud(profesional.user_id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                ❌ Rechazar
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No hay solicitudes pendientes.</p>
      )}
    </div>
  );
}
