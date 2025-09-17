// app/admin/credits/page.tsx
"use client";
import { useFetch } from "@hooks/useFetch";
import { useState } from "react";
import styles from "@styles/admin.module.css";
import { supabase } from "@lib/supabase-web";

export default function AdminCreditsPage() {
  const [filtro, setFiltro] = useState("");
  const { data: compras, loading, error } = useFetch("admin_credits_view", {
    orderBy: "created_at",
    ascending: false,
    limit: 10,
  });

  const filtered = compras.filter((p) =>
    p.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.email?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.servicio?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p>Error al cargar historial: {error}</p>;

  return (
    <main className={styles.profileContainer}>
      <h1 className={styles.title}>📊 Créditos Comprados</h1>

      <input
        type="text"
        placeholder="Buscar por nombre, email o servicio..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className={styles.inputField}
      />

      <ul>
        {filtered.map((compra) => (
          <li key={compra.id}>
            {compra.nombre} — {compra.email} — {compra.servicio} — ${compra.amount}
          </li>
        ))}
      </ul>
    </main>
  );
}
