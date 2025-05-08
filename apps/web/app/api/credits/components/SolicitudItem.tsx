"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./SolicitudItem.module.css";

export default function SolicitudItem({ solicitud, userId }: { solicitud: any, userId: string }) {
  const [desbloqueado, setDesbloqueado] = useState(
    solicitud.paid_professionals?.includes(userId)
  );
  const [loading, setLoading] = useState(false);

  const handleDesbloquear = async () => {
    if (!confirm("¿Confirmás gastar 1 crédito para desbloquear los datos del cliente?")) return;
    setLoading(true);

    const { error } = await fetch(`/api/desbloquear-solicitud`, {
      method: "POST",
      body: JSON.stringify({ solicitudId: solicitud.id, userId }),
    }).then((res) => res.json());

    if (error) {
      alert("Error al desbloquear: " + error.message);
    } else {
      setDesbloqueado(true);
    }

    setLoading(false);
  };

  return (
    <div className={styles.solicitudBox}>
      <h3>{solicitud.category || "Servicio"}</h3>
      <p>📍 {solicitud.location}</p>

      {desbloqueado ? (
        <>
          <p>✉️ {solicitud.user_email}</p>
          <p>📄 {solicitud.job_description}</p>
        </>
      ) : (
        <button
          className={styles.unlockButton}
          onClick={handleDesbloquear}
          disabled={loading}
        >
          {loading ? "Desbloqueando..." : "🔓 Desbloquear (1 crédito)"}
        </button>
      )}
    </div>
  );
}
