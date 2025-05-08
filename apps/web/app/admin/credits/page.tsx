"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@lib/supabase-web";
import styles from "../admin.module.css";

interface Compra {
  id: string;
  user_id: string;
  credits: number;
  amount: number;
  plan_name: string;
  coupon?: string;
  created_at: string;
  nombre: string;
  email: string;
  telefono: string;
  servicio: string;
}

export default function AdminCreditsPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      const token = session?.access_token;
      if (!token) {
        console.error("❌ No hay sesión válida");
        return router.replace("/login");
      }
  
      const res = await fetch("/api/credits/history", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const result = await res.json();
  
      if (!result.success) {
        setIsAdmin(false);
        return;
      }
  
      setCompras(result.data);
      setIsAdmin(true);
      setLoading(false);
    };
  
    fetchData();
  }, [router]);
  

  const filtered = compras.filter((p) =>
    p.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.email?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.servicio?.toLowerCase().includes(filtro.toLowerCase())
  );

  const exportCSV = () => {
    const headers = "Nombre,Email,Teléfono,Servicio,Créditos,Monto,Fecha\n";
    const rows = filtered.map(p =>
      `${p.nombre},${p.email},${p.telefono},${p.servicio},${p.credits},${p.amount},${p.created_at}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compras_creditos.csv";
    a.click();
  };

  if (loading) return <p className={styles.loading}>Cargando historial...</p>;
  if (!isAdmin) return <p className={styles.error}>Acceso solo para administradores.</p>;

  return (
    <main className={styles.profileContainer}>
      <h1 className={styles.title}>📊 Créditos Comprados</h1>

      <div className={styles.filterRow}>
        <input
          type="text"
          placeholder="Buscar por nombre, email o servicio..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className={styles.inputField}
        />
        <button onClick={exportCSV} className={styles.secondaryButton}>
          📥 Exportar CSV
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Servicio</th>
              <th>Créditos</th>
              <th>Monto</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.email}</td>
                <td>{p.telefono}</td>
                <td>{p.servicio}</td>
                <td>{p.credits}</td>
                <td>
                  {p.amount?.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.cardList}>
        {filtered.map((p) => (
          <div key={p.id} className={styles.cardItem}>
            <h3>{p.nombre}</h3>
            <p><strong>Email:</strong> {p.email}</p>
            <p><strong>Teléfono:</strong> {p.telefono}</p>
            <p><strong>Servicio:</strong> {p.servicio}</p>
            <p><strong>Créditos:</strong> {p.credits}</p>
            <p><strong>Monto:</strong> {p.amount?.toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
              maximumFractionDigits: 0
            })}</p>
            <p><strong>Fecha:</strong> {new Date(p.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
