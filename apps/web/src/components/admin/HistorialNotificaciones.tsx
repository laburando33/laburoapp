"use client";

import { useFetch } from "@hooks/useFetch";
import { useState } from "react";
import { supabase } from "@lib/supabase-web";

const HistorialNotificaciones = () => {
  const [page, setPage] = useState(0);
  const { data: notificaciones, loading } = useFetch("notifications", {
    orderBy: "created_at",
    ascending: false,
    limit: 10,
    page,
  });

  if (loading) return <p>🔄 Cargando notificaciones...</p>;

  return (
    <div>
      <h2>Historial de Notificaciones</h2>
      <ul>
        {notificaciones.map((notif) => (
          <li key={notif.id}>
            <strong>{notif.title}</strong> — {notif.message} —{" "}
            {new Date(notif.created_at).toLocaleDateString()}
          </li>
        ))}
      </ul>

      {/* 🚀 Paginación */}
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
          ⬅️ Anterior
        </button>
        <button onClick={() => setPage((prev) => prev + 1)}>Siguiente ➡️</button>
      </div>
    </div>
  );
};

export default HistorialNotificaciones;
