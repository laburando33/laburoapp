// @components/professional/DashboardPro.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@lib/supabase-web";
import { useCredits } from "@components/context/CreditContext";
import { usePerfil } from "@hooks/usePerfil";
import SolicitudItem from "@components/SolicitudItem";
import VerificacionProfesional from "@components/professional/VerificacionProfesional"; // 🚩 MODIFICADO: Asegúrate de que este es el nombre correcto del componente
import styles from "./DashboardPro.module.css";
import Link from "next/link";

export default function DashboardPro({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { perfil, loading: loadingPerfil } = usePerfil(userId);
  const { credits, refetch } = useCredits();
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);

  // 🚩 MODIFICADO: Uso de useCallback para memoizar la función de fetching.
  // Esto es bueno para la optimización y para la lista de dependencias de useEffect.
  const fetchSolicitudes = useCallback(async () => {
    // 🚩 MODIFICADO: Retornar temprano si el perfil aún no está cargado o si userId no existe.
    if (!userId || loadingPerfil || !perfil) {
      setLoadingSolicitudes(false);
      return;
    }

    setLoadingSolicitudes(true);

    // 🚩 MODIFICADO: Obtener las categorías y ubicación del profesional desde su perfil.
    // Asumo que 'perfil.category' es una cadena de texto (ej: "Plomería", "Electricista")
    // y 'perfil.location' también (ej: "Córdoba", "Ciudad de Buenos Aires")
    const profesionalCategory = perfil.category;
    const profesionalLocation = perfil.location;

    // Verificar si el perfil tiene las propiedades necesarias para el filtrado.
    if (!profesionalCategory || !profesionalLocation) {
      console.warn("Profesional no tiene categoría o ubicación definida en su perfil para filtrar solicitudes.");
      setSolicitudes([]);
      setLoadingSolicitudes(false);
      return;
    }

    const { data, error } = await supabase
      .from("requests")
      // 🚩 MODIFICADO: Seleccionar 'max_professionals' y 'contacto' si existen.
      .select("id, category, location, status, job_description, user_email, created_at, paid_professionals, contacto, max_professionals")
      // 🚩 MODIFICADO: Filtrar solicitudes por la categoría y ubicación del perfil del profesional.
      .eq("category", profesionalCategory)
      .eq("location", profesionalLocation)
      .order("created_at", { ascending: false })
      .range((page - 1) * 10, page * 10 - 1);

    if (!error) {
        // 🚩 MODIFICADO: Filtro adicional en el cliente para manejar 'paid_professionals' y 'max_professionals'.
        // Esto asegura que el profesional solo vea las solicitudes que ya pagó
        // o aquellas que aún tienen cupo para ser desbloqueadas.
        const filteredData = data.filter(solicitud => {
            const hasUserPaid = solicitud.paid_professionals?.includes(userId);
            const currentPaidCount = solicitud.paid_professionals?.length || 0;

            // Si el profesional ya pagó por esta solicitud, siempre debe verla (para ver los datos de contacto).
            if (hasUserPaid) {
                return true;
            }
            // Si no ha pagado, solo mostrarla si aún hay espacio para más profesionales que paguen.
            return currentPaidCount < (solicitud.max_professionals || 4); // Usar 4 como valor por defecto si 'max_professionals' es null.
        });
        setSolicitudes(filteredData ?? []);
    } else {
      console.error("Error fetching requests:", error);
      setSolicitudes([]); // Asegurarse de vaciar las solicitudes en caso de error.
    }
    setLoadingSolicitudes(false);
  }, [userId, page, perfil, loadingPerfil]); // Dependencias para useCallback.

  useEffect(() => {
    fetchSolicitudes(); // Ejecutar el fetch inicial de solicitudes.

    // 🚩 MODIFICADO: Suscripción a cambios en tiempo real en la tabla 'requests'.
    // Esta suscripción es lo suficientemente amplia para detectar cambios relevantes
    // (como cuando un profesional desbloquea una solicitud, o una nueva solicitud se crea).
    // La función `fetchSolicitudes` se encargará de re-filtrar los datos.
    const channel = supabase
      .channel(`public:requests_for_professional_${userId}`) // Nombre de canal único para evitar conflictos.
      .on('postgres_changes', {
        event: '*', // Escucha todos los eventos (INSERT, UPDATE, DELETE) para simplicidad.
        schema: 'public',
        table: 'requests',
        // Nota: Un filtro más granular a nivel de suscripción aquí (ej. por contenido del array)
        // es más complejo y a menudo se delega a las políticas RLS y/o filtrado en el cliente.
      }, payload => {
        console.log('Cambio en solicitudes (realtime):', payload);
        // Cuando hay un cambio en la tabla 'requests', volvemos a cargar las solicitudes
        // para reflejar los datos más recientes.
        fetchSolicitudes();
      })
      .subscribe();

    return () => {
      // Limpiar la suscripción cuando el componente se desmonta.
      supabase.removeChannel(channel);
    };
  }, [fetchSolicitudes]); // La dependencia es 'fetchSolicitudes' porque es una función memoizada.

  // Muestra un estado de carga mientras se obtienen los datos del perfil o las solicitudes.
  if (loadingPerfil || loadingSolicitudes) {
    return <div className={styles.loading}>⏳ Cargando dashboard...</div>;
  }

  // Muestra un mensaje de error si el perfil no pudo ser cargado.
  if (!perfil) {
    return <p className={styles.error}>❌ Error al cargar perfil o no autenticado.</p>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>
        👋 Hola, {perfil.full_name?.split(" ")[0] || "Profesional"}
      </h1>

      <div className={styles.infoBox}>
        {/* Muestra el estado de verificación general del profesional */}
        <p className={styles.generalStatus}>
          Estado de verificación:{" "}
          <strong>
            {perfil.verificacion_status === "verificado"
              ? "✅ Verificado"
              : perfil.verificacion_status === "pendiente"
              ? "⏳ Pendiente"
              : "❌ No verificado"}
          </strong>
        </p>

        {/* Muestra los créditos disponibles del profesional */}
        <p className={styles.creditsDisplay}>
          <strong>Créditos disponibles:</strong> {credits ?? 0}
        </p>

        {/* Botón para comprar créditos */}
        <Link href="/professional/shop">
          <button className={styles.buyCreditsButton}>🛒 Comprar créditos</button>
        </Link>

        {/* 🚩 MODIFICADO: Renderiza el componente de verificación si el profesional no está verificado */}
        {perfil.verificacion_status !== "verificado" && (
          <VerificacionProfesional userId={userId} />
        )}
      </div>

      <h2 className={styles.subTitle}>📬 Solicitudes disponibles</h2>

      {/* Muestra un mensaje si no hay solicitudes o la lista de solicitudes */}
      {solicitudes.length === 0 ? (
        <p>No hay solicitudes disponibles que coincidan con tu perfil en este momento.</p> // 🚩 MODIFICADO: Mensaje más descriptivo.
      ) : (
        <div className={styles.solicitudesList}>
          {solicitudes.map((solicitud) => (
            <SolicitudItem key={solicitud.id} solicitud={solicitud} userId={userId} />
          ))}
        </div>
      )}

      {/* Controles de paginación */}
      <div className={styles.pagination}>
        <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
          ◀ Anterior
        </button>
        <span>Página {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={solicitudes.length < 10}>
          Siguiente ▶
        </button>
      </div>
    </div>
  );
}