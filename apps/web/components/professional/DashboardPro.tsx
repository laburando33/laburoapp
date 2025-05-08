'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-web";
import { useCredits } from "@/components/context/CreditContext";
import styles from "./DashboardPro.module.css";

interface Profesional {
  user_id: string;
  full_name: string;
  email: string;
  verificacion_status: string;
  category: string;
  location: string;
}

export default function DashboardPro({ userId }: { userId: string }) {
  const { credits } = useCredits();
  const [profile, setProfile] = useState<Profesional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error("❌ Error obteniendo el perfil:", err.message);
      setError("Error al cargar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    // 🔄 Suscripción en tiempo real para detectar cambios en verificación
    const subscription = supabase
      .channel('public:professionals')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'professionals' }, (payload) => {
        if (payload.new.user_id === userId) {
          console.log("🔄 Actualización detectada:", payload.new);
          setProfile(payload.new);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>👋 ¡Hola, Profesional!</h1>

      {loading ? (
        <p>⏳ Cargando perfil...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : profile ? (
        <div className={styles.profileCard}>
          <p><strong>Nombre:</strong> {profile.full_name}</p>
          <p><strong>Correo:</strong> {profile.email}</p>
          <p><strong>Créditos disponibles:</strong> {credits}</p>
          <p><strong>Verificación:</strong> 
            {" "}
            {profile.verificacion_status === 'verificado' ? (
              <span className="text-green-500">✅ Verificado</span>
            ) : (
              <span className="text-red-500">❌ No verificado</span>
            )}
          </p>
        </div>
      ) : (
        <p>No se pudo cargar el perfil.</p>
      )}
    </div>
  );
}
