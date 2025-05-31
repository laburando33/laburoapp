// app/professional/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web"; // Ensure this path is correct
import styles from "@styles/admin.module.css"; // Ensure this path is correct
import SolicitudItem from "@components/SolicitudItem"; // Ensure this path is correct
import Link from "next/link";
import VerificacionProfesional from "@components/professional/VerificacionProfesional"; // Ensure this path is correct

interface Solicitud {
  id: string;
  user_email: string;
  job_description: string;
  category: string;
  location: string;
  created_at: string;
  status: string;
  professional_id: string | null;
  paid_professionals: string[];
  max_professionals: number;
}

interface Perfil {
  user_id: string;
  full_name: string | null;
  credits: number; // Now reflects the 'balance' from the 'credits' table
  is_verified: boolean;
  verificacion_status: string;
  comentario: string | null;
  email: string; // Added for requests filter
  // Add any other properties your 'professionals' profile table might have
}

export default function DashboardPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  useEffect(() => {
    const setupRealtimeSubscriptions = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login"; // Redirect if no user is authenticated
        return;
      }

      // --- Perfil del Profesional (tabla 'professionals') ---
      // 1. Cargar perfil inicial
      const { data: perfilData, error: perfilError } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (perfilError || !perfilData) {
        console.error("❌ Error al cargar perfil inicial:", perfilError?.message);
        setLoading(false);
        return;
      }

      // --- Créditos del Profesional (tabla 'credits') ---
      // 1. Cargar créditos iniciales
      const { data: creditsData, error: creditsError } = await supabase
        .from("credits")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle(); // Use maybeSingle for cases where no rows are found initially

      if (creditsError && creditsError.code !== "PGRST116") {
        // PGRST116 is "no rows found" - we can safely ignore it for initial credits fetch
        console.error("❌ Error al cargar créditos iniciales:", creditsError.message);
      }

      // Combine profile data and credits
      setPerfil({
        ...(perfilData as Perfil),
        credits: creditsData?.balance ?? 0, // Use the balance from the 'credits' table, default to 0
      });

      // 2. Suscripción en tiempo real para el perfil (tabla 'professionals')
      const perfilChannel = supabase
        .channel(`professional_profile:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "professionals",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Real-time profile update (professionals):", payload.new);
            setPerfil((prevPerfil) => ({
              ...prevPerfil,
              ...(payload.new as Perfil),
            }));
          }
        )
        .subscribe((status) => {
            console.log(`📡 Estado de suscripción Realtime Perfil: ${status}`);
        });

      // 3. Suscripción en tiempo real para créditos (tabla 'credits')
      const creditsChannel = supabase
        .channel(`user_credits:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE", // Credits are typically updated, not inserted/deleted frequently
            schema: "public",
            table: "credits",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Real-time credits update:", payload.new);
            setPerfil((prevPerfil) =>
              prevPerfil
                ? {
                    ...prevPerfil,
                    credits: (payload.new as { balance: number }).balance,
                  }
                : null
            );
          }
        )
        .subscribe((status) => {
            console.log(`📡 Estado de suscripción Realtime Créditos: ${status}`);
        });


      // --- Solicitudes ---
      // 1. Cargar solicitudes iniciales (only for the logged-in professional or public ones relevant to them)
      const { data: solicitudesData, error: solicitudesError } = await supabase
        .from("requests")
        .select("*")
        .or(`professional_id.eq.${user.id},user_email.eq.${user.email}`) // Filter by assigned professional_id OR user_email (if the request originated from them)
        .order("created_at", { ascending: false });

      if (solicitudesError) {
        console.error("❌ Error al cargar solicitudes iniciales:", solicitudesError.message);
      }
      setSolicitudes((solicitudesData as Solicitud[]) || []);

      // 2. Suscripción en tiempo real para solicitudes
      const requestsChannel = supabase
        .channel(`user_requests:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to INSERT, UPDATE, DELETE
            schema: "public",
            table: "requests",
            filter: `or(professional_id.eq.${user.id},user_email.eq.${user.email})`, // Filter relevant requests
          },
          (payload) => {
            console.log("Real-time requests update:", payload);
            setSolicitudes((prevSolicitudes) => {
              if (payload.eventType === "INSERT") {
                return [payload.new as Solicitud, ...prevSolicitudes];
              } else if (payload.eventType === "UPDATE") {
                return prevSolicitudes.map((sol) =>
                  sol.id === (payload.new as Solicitud).id
                    ? (payload.new as Solicitud)
                    : sol
                );
              } else if (payload.eventType === "DELETE") {
                return prevSolicitudes.filter(
                  (sol) => sol.id !== (payload.old as Solicitud).id
                );
              }
              return prevSolicitudes;
            });
          }
        )
        .subscribe((status) => {
            console.log(`📡 Estado de suscripción Realtime Solicitudes: ${status}`);
        });

      setLoading(false);

      return () => {
        // Clean up all subscriptions when the component unmounts
        supabase.removeChannel(perfilChannel);
        supabase.removeChannel(creditsChannel);
        supabase.removeChannel(requestsChannel);
        console.log("🧹 Desuscrito de todos los canales Realtime.");
      };
    };

    setupRealtimeSubscriptions();
  }, []); // This effect runs only once on component mount

  if (loading) {
    return <div className={styles.loading}>⏳ Cargando...</div>;
  }

  // If perfil is null at this point, something went wrong (e.g., user not authenticated, error fetching initial profile)
  if (!perfil) {
    return <p className={styles.error}>❌ Error al cargar perfil o no autenticado.</p>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>
        👋 Hola, {perfil.full_name?.split(" ")[0] || "Profesional"}
      </h1>

      <div className={styles.infoBox}>
        {/* VerificacionProfesional component handles its own data fetching and real-time updates */}
        <VerificacionProfesional
          userId={perfil.user_id}
          isVerified={perfil.is_verified}
          verificationStatus={perfil.verificacion_status}
          comentario={perfil.comentario}
        />

        <p>
          <strong>Créditos disponibles:</strong> {perfil.credits ?? 0}
        </p>

        <Link href="/professional/shop">
          <button className={styles.buyCreditsButton}>🛒 Comprar créditos</button>
        </Link>
      </div>

      <h2 className={styles.subTitle}>Últimas solicitudes</h2>

      <div className={styles.solicitudesList}>
        {solicitudes.length > 0 ? (
          solicitudes.map((solicitud) => (
            <SolicitudItem key={solicitud.id} solicitud={solicitud} userId={perfil.user_id} />
          ))
        ) : (
          <p>No tienes solicitudes.</p>
        )}
      </div>
    </div>
  );
}