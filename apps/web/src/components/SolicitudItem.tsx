// @components/SolicitudItem.tsx
"use client";

import { useState } from "react";
import { supabase } from "@lib/supabase-web"; // Asegúrate de que esta ruta a tu cliente Supabase sea correcta
import styles from "./SolicitudItem.module.css";

export default function SolicitudItem({ solicitud, userId }: { solicitud: any, userId: string }) {
  // Estado para saber si la solicitud ya ha sido desbloqueada por este profesional.
  const [desbloqueado, setDesbloqueado] = useState(
    solicitud.paid_professionals?.includes(userId)
  );
  const [loading, setLoading] = useState(false); // Estado para controlar el loading del botón.

  const handleDesbloquear = async () => {
    // Confirmación antes de gastar créditos.
    if (!confirm("¿Confirmás gastar 20 créditos para desbloquear los datos del cliente?")) return;

    setLoading(true); // Activar el estado de carga.

    try {
      // Realizar una petición POST al endpoint API para desbloquear la solicitud.
      const response = await fetch(`${window.location.origin}/api/solicitudes/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ solicitudId: solicitud.id, profesionalId: userId }),
      });

      const data = await response.json(); // Parsear la respuesta JSON.

      // Manejar errores de la respuesta HTTP.
      if (!response.ok) {
        alert(`Error al desbloquear: ${data.error}`);
        console.error("❌ Error en desbloqueo:", data.error);
        return;
      }

      // Mostrar mensajes según el resultado del desbloqueo.
      if (data.alreadyUnlocked) {
        alert("Esta solicitud ya estaba desbloqueada por ti."); // 🚩 MODIFICADO: Mensaje más claro.
      } else {
        alert("Solicitud desbloqueada con éxito.");
        setDesbloqueado(true); // Actualizar el estado para mostrar los datos de contacto.
        // 🚩 CONSIDERACIÓN: Si tu `useCredits` tiene un `refetch` que actualiza los créditos
        // automáticamente tras una transacción, se reflejará en `DashboardPro`.
        // Si no, aquí podrías llamar a `refetch()` si lo pasaras como prop o si el contexto
        // lo expone de alguna manera.
      }
    } catch (error: any) {
      console.error("❌ Error en la petición:", error.message);
      alert("Error al desbloquear: " + error.message);
    } finally {
      setLoading(false); // Desactivar el estado de carga.
    }
  };

  return (
    <div className={styles.solicitudBox}>
      <h3>{solicitud.category || "Servicio"}</h3> {/* Muestra la categoría de la solicitud. */}
      <h6>📅 Fecha: {new Date(solicitud.created_at).toLocaleDateString()}</h6> {/* Muestra la fecha de creación. */}

      <p>📍 <span>Localidad:</span> {solicitud.location}</p> {/* Muestra la ubicación. */}
      <p>📄 <span>Descripción:</span> {solicitud.job_description}</p> {/* Muestra la descripción del trabajo. */}

      {/* 🚩 MODIFICADO: Mostrar la información de créditos solo si la solicitud NO ha sido desbloqueada. */}
      {!desbloqueado && (
        <>
            <h6>Para desbloquear los datos de contacto del cliente:</h6>
            <h5>💰 <span>Valor:</span> 20 créditos</h5>
        </>
      )}

      {/* Contenido condicional: Muestra datos de contacto si está desbloqueado, o el botón para desbloquear. */}
      {desbloqueado ? (
        <>
          <p>✉️ <span>Email:</span> {solicitud.user_email}</p> {/* Muestra el email del cliente. */}
          {/* 🚩 CONSIDERACIÓN: Asegúrate de que 'solicitud.contacto' es el campo correcto para el número de teléfono. */}
          <p>📞 <span>Contacto:</span> {solicitud.contacto || "No disponible"}</p> {/* Muestra el contacto del cliente. */}
        </>
      ) : (
        <button
          className={styles.unlockButton}
          onClick={handleDesbloquear}
          disabled={loading} // Deshabilita el botón mientras la operación está en curso.
        >
          {loading ? "Desbloqueando..." : "🔓 Desbloquear Solicitud"}
        </button>
      )}
    </div>
  );
}