"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "./HistorialVerificacion.module.css";

interface HistorialItem {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: "pendiente" | "verificado" | "rechazado";
  comentario: string | null;
  verified_at: string | null;
}

const PAGE_SIZE = 30;

export default function HistorialVerificacionAdmin() {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /* ------------------ fetch paginado ------------------ */
  const fetchHistorial = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      setError(null);

      const from = (pageNum - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("verification_history")
        .select("*", { count: "exact" })
        .order("verified_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("❌ Error al obtener historial:", error.message);
        setError("No se pudo cargar el historial.");
      } else {
        setHistorial((prev) =>
          pageNum === 1 ? data : [...prev, ...(data as HistorialItem[])]
        );
        setHasMore(count ? to + 1 < count : false);
      }
      setLoading(false);
    },
    [setHistorial]
  );

  /* ------------------ initial load + realtime ------------------ */
  useEffect(() => {
    fetchHistorial(1);

    const channel = supabase
      .channel("verification_history_admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "verification_history" },
        (payload) => {
          setHistorial((prev) => {
            // evita duplicados
            const exists = prev.some((h) => h.id === payload.new.id);
            return exists ? prev : [payload.new as HistorialItem, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHistorial]);

  /* ------------------ filtros ------------------ */
  const filtrado = historial.filter(
    (item) =>
      item.full_name.toLowerCase().includes(filtro.toLowerCase()) ||
      item.email.toLowerCase().includes(filtro.toLowerCase())
  );

  /* ------------------ render ------------------ */
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📜 Historial de Verificaciones</h1>

      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        value={filtro}
        onChange={(e) => {
          setFiltro(e.target.value);
          setPage(1);
        }}
        className={styles.input}
      />

      {error && <p className={styles.error}>{error}</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Comentario</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {filtrado.map((item) => (
            <tr key={item.id}>
              <td>{item.full_name}</td>
              <td>{item.email}</td>
              <td>
                <span className={styles[item.status]}>{item.status}</span>
              </td>
              <td>{item.comentario || "—"}</td>
              <td>
                {item.verified_at
                  ? new Date(item.verified_at).toLocaleString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p>⏳ Cargando…</p>}

      {!loading && hasMore && (
        <button
          className={styles.loadMore}
          onClick={() => {
            const next = page + 1;
            setPage(next);
            fetchHistorial(next);
          }}
        >
          Cargar más
        </button>
      )}
    </div>
  );
}
