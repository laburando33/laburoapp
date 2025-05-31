"use client";

import { useState } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "./SolicitudItem.module.css";

export default function SolicitudItem({ solicitud, userId }: { solicitud: any, userId: string }) {
  const [desbloqueado, setDesbloqueado] = useState(
    solicitud.paid_professionals?.includes(userId)
  );
  const [loading, setLoading] = useState(false);

  const handleDesbloquear = async () => {
    if (!confirm("¿Confirmás gastar 20 créditos para desbloquear los datos del cliente?")) return;

    setLoading(true);

    try {
      const response = await fetch(`${window.location.origin}/api/solicitudes/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ solicitudId: solicitud.id, profesionalId: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error al desbloquear: ${data.error}`);
        console.error("❌ Error en desbloqueo:", data.error);
        return;
      }

      if (data.alreadyUnlocked) {
        alert("Esta solicitud ya estaba desbloqueada.");
      } else {
        alert("Solicitud desbloqueada con éxito.");
        setDesbloqueado(true);
      }
    } catch (error: any) {
      console.error("❌ Error en la petición:", error.message);
      alert("Error al desbloquear: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.solicitudBox}>
      <h3>{solicitud.category || "Servicio"}</h3>
      <h6>📅 Fecha: {new Date(solicitud.created_at).toLocaleDateString()}</h6>

      <p>📍 <span>Localidad:</span> {solicitud.location}</p>
      <p>📄 <span>Descripción:</span> {solicitud.job_description}</p>

      <h6>Para desbloquear los datos de contacto del cliente:</h6>
      <h5>💰 <span>Valor:</span> 20 créditos</h5>

      {desbloqueado ? (
        <>
          <p>✉️ <span>Email:</span> {solicitud.user_email}</p>
          <p>📞 <span>Contacto:</span> {solicitud.contacto}</p>
        </>
      ) : (
        <button
          className={styles.unlockButton}
          onClick={handleDesbloquear}
          disabled={loading}
        >
          {loading ? "Desbloqueando..." : "🔓 Desbloquear Solicitud"}
        </button>
      )}
    </div>
  );
}
