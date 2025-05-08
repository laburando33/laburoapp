'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./ComprasAdmin.module.css";

interface Compra {
  id: string;
  nombre: string | null;
  email: string | null;
  credits: number;
  price: number | null;
  created_at: string;
}

export default function ComprasAdmin() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtradas, setFiltradas] = useState<Compra[]>([]);

  useEffect(() => {
    const fetchCompras = async () => {
      const { data, error } = await supabase
        .from("credit_purchases")
        .select("id, nombre, email, credits, price, created_at")
        .order("created_at", { ascending: false });

      if (data) {
        setCompras(data);
        setFiltradas(data);
      } else {
        console.error("Error cargando compras:", error?.message);
      }
    };

    fetchCompras();
  }, []);

  useEffect(() => {
    const normalizado = filtroEmail.toLowerCase();
    setFiltradas(
      compras.filter((c) =>
        (c.email?.toLowerCase() || "").includes(normalizado)
      )
    );
  }, [filtroEmail, compras]);

  const exportarCSV = () => {
    const headers = ["Nombre", "Email", "Créditos", "Precio", "Fecha"];
    const rows = filtradas.map((c) => [
      `"${c.nombre || ""}"`,
      `"${c.email || ""}"`,
      c.credits,
      c.price ?? 0,
      `"${new Date(c.created_at).toLocaleString()}"`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "historial_compras.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <h1>💳 Historial de Compras</h1>

      <div className={styles.filtros}>
        <input
          type="text"
          placeholder="Filtrar por email..."
          value={filtroEmail}
          onChange={(e) => setFiltroEmail(e.target.value)}
          className={styles.input}
        />
        <button onClick={exportarCSV} className={styles.exportBtn}>
          📤 Exportar CSV
        </button>
      </div>

      {filtradas.length === 0 ? (
        <p>No hay compras registradas.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Créditos</th>
              <th>Precio</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre || "N/A"}</td>
                <td>{c.email || "Sin email"}</td>
                <td>{c.credits}</td>
                <td>${c.price ?? 0}</td>
                <td>{new Date(c.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
