// hooks/usePerfil.ts
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@lib/supabase-web"; // ✅ Esto es correcto

export function usePerfil(userId?: string) {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true); // Inicia en true si hay userId
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false); // Si no hay userId, termina el loading inmediatamente
      return;
    }

    setLoading(true); // Reinicia loading para cada nuevo userId
    setError(null);

    // Carga inicial del perfil
    const fetchPerfil = async () => {
      console.log(`⏳ Cargando perfil para userId: ${userId}`);
      const { data, error: fetchError } = await supabase
        .from("professionals")
        .select(
          `
          user_id,
          full_name,
          email,
          phone,
          location,
          category,
          avatar_url,
          verificacion_status,
          is_verified,
          comentario,
          credits,
          address 
        `
        ) // ✅ ELIMINADO el comentario aquí
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) {
        console.error("❌ Error al cargar el perfil:", fetchError.message);
        setError(fetchError.message);
        setPerfil(null);
      } else {
        setPerfil(data);
      }
      setLoading(false);
    };

    fetchPerfil();

    // Suscripción Realtime para actualizaciones del perfil
    console.log(`🔗 Intentando suscribirse a Realtime para perfil: ${userId} en 'professionals'`);
    const channel = supabase
      .channel(`perfil-${userId}`) // Nombre del canal único para cada usuario
      .on(
        "postgres_changes",
        {
          event: "UPDATE", // Queremos escuchar solo eventos de UPDATE
          schema: "public",
          table: "professionals", // La tabla donde se actualizan los créditos
          filter: `user_id=eq.${userId}`, // Filtra por el ID del usuario actual
        },
        ({ new: updated }) => {
          console.log("✨ Realtime Perfil Update recibido:", updated); // ✅ MUY IMPORTANTE: Verifica que esto aparezca en tu consola
          setPerfil(updated); // Actualiza el estado del perfil con los nuevos datos
        }
      )
      .subscribe((status) => {
        console.log(`🌐 Estado de suscripción Realtime Perfil: ${status}`); // ✅ DEBUG: Espera ver 'SUBSCRIBED' aquí
      });

    // Limpieza al desmontar el componente o cambiar el userId
    return () => {
      console.log(`🧹 Desuscribiéndose del canal de Realtime Perfil: perfil-${userId}`);
      supabase.removeChannel(channel); // Desuscribe el canal para evitar fugas de memoria
    };
  }, [userId]); // El efecto se vuelve a ejecutar si el userId cambia

  return { perfil, loading, error };
}