'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "@/styles/admin.module.css";

interface Profesional {
  user_id: string;
  full_name: string;
  email: string;
  verificacion_status: string;
}

export default function VerificacionAdminPage() {
  const [pendientes, setPendientes] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("verificacion_status", "pendiente");

      if (error) throw error;
      console.log("✅ Profesionales pendientes:", data);
      setPendientes(data || []);
    } catch (err: any) {
      console.error("❌ Error obteniendo profesionales pendientes:", err.message);
      setError("Error al cargar los profesionales pendientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendientes();

    // Suscripción en tiempo real mejorada
    const subscription = supabase
      .channel('public:professionals')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'professionals' }, (payload) => {
        console.log("🔄 Actualización detectada:", payload.new);
        
        if (payload.new.verificacion_status === 'pendiente') {
          setPendientes((prev) => [...prev, payload.new]);
        } else {
          setPendientes((prev) => prev.filter(p => p.user_id !== payload.new.user_id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleVerificar = async (pro: Profesional) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ verificacion_status: 'verificado' })
        .eq('user_id', pro.user_id);

      if (error) throw error;

      // ✅ Insertar en el historial de verificaciones
      await supabase.from('verification_history').insert([{
        user_id: pro.user_id,
        full_name: pro.full_name,
        email: pro.email,
        status: 'verificado',
      }]);

      // 🔄 Refrescamos la lista manualmente
      alert("✅ Profesional Verificado y guardado en Historial");
      fetchPendientes();  // Refrescar la lista
    } catch (err) {
      console.error("❌ Error al verificar profesional:", err.message);
      alert("❌ Error al verificar profesional");
    }
  };

  const handleRechazar = async (pro: Profesional) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ verificacion_status: 'no_verificado' })
        .eq('user_id', pro.user_id);

      if (error) throw error;

      // ✅ Insertar en el historial de verificaciones
      await supabase.from('verification_history').insert([{
        user_id: pro.user_id,
        full_name: pro.full_name,
        email: pro.email,
        status: 'rechazado',
      }]);

      alert("❌ Profesional Rechazado y guardado en Historial");
      fetchPendientes();  // Refrescar la lista
    } catch (err) {
      console.error("❌ Error al rechazar profesional:", err.message);
      alert("❌ Error al rechazar profesional");
    }
  };

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>🛂 Profesionales pendientes de verificación</h1>

      <button onClick={fetchPendientes} className={styles.secondaryButton}>
        🔄 Recargar lista
      </button>

      {loading ? (
        <p className={styles.loading}>⏳ Cargando...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : pendientes.length === 0 ? (
        <p>No hay profesionales pendientes. Intente recargar más tarde.</p>
      ) : (
        <ul className={styles.cardList}>
          {pendientes.map((pro) => (
            <li key={pro.user_id} className={styles.cardItem}>
              <div>
                <strong>{pro.full_name}</strong> – {pro.email}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleVerificar(pro)}
                  className={styles.primaryButton}
                >
                  ✅ Verificar
                </button>
                <button
                  onClick={() => handleRechazar(pro)}
                  className={styles.dangerButton}
                >
                  ❌ Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}