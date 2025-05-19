// components/admin/DesbloqueosAdmin.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import styles from "./ComprasAdmin.module.css";
import { FiDownload } from "react-icons/fi";

export default function DesbloqueosAdmin() {
  // 🚀 Reutilizamos el hook de fetch para evitar repetir lógica
  const { data: desbloqueos, loading } = useFetch("admin_unlocked_view", "unlocked_at", false);
  const [filtro, setFiltro] = useState("");

  // 🔍 Optimización con useMemo para evitar recalcular en cada render
  const filtradas = useMemo(() => {
    return desbloqueos.filter((d) =>
      d.profesional_email.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [desbloqueos, filtro]);

  // 📊 Cálculo optimizado del profesional más activo
  const profesionalTop = useMemo(() => {
    const actividad = filtradas.reduce((acc, curr) => {
      acc[curr.profesional_email] = (acc[curr.profesional_email] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(actividad).sort((a, b) => b[1] - a[1])[0];
  }, [filtradas]);

  // 📥 Exportación a CSV optimizada
  const exportToCSV = () => {
    const headers = [
      "Fecha",
      "Profesional",
      "Email",
      "Servicio",
      "Zona",
      "Cliente",
      "Contacto",
    ];

    const rows = filtradas.map((d) => [
      new Date(d.unlocked_at).toLocaleString(),
      d.profesional_nombre,
      d.profesional_email,
      d.servicio,
      d.ubicacion || d.zona,
      d.cliente_nombre,
      d.cliente_contacto,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "desbloqueos_laburando.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>🔄 Cargando desbloqueos...</p>;

  return (
    <div className={styles.container}>
      <h1>🔓 Desbloqueos de Solicitudes</h1>

      <div className={styles.summaryBox}>
        <p><strong>Total desbloqueos:</strong> {filtradas.length}</p>
        {profesionalTop && (
          <p>
            <strong>Profesional más activo:</strong> {profesionalTop[0]} ({profesionalTop[1]} desbloqueos)
          </p>
        )}
      </div>

      <div className={styles.filtros}>
        <input
          type="text"
          placeholder="Filtrar por email profesional..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className={styles.input}
        />
        <button onClick={exportToCSV} className={styles.exportButton}>
          <FiDownload /> Exportar CSV
        </button>
      </div>

      {filtradas.length === 0 ? (
        <p>No hay desbloqueos registrados.</p>
      ) : (
        <div className={styles.scrollTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Profesional</th>
                <th>Email</th>
                <th>Servicio</th>
                <th>Zona</th>
                <th>Cliente</th>
                <th>Contacto</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((d) => (
                <tr key={d.unlock_id}>
                  <td>{new Date(d.unlocked_at).toLocaleString()}</td>
                  <td>{d.profesional_nombre}</td>
                  <td>{d.profesional_email}</td>
                  <td>{d.servicio}</td>
                  <td>{d.ubicacion || d.zona}</td>
                  <td>{d.cliente_nombre}</td>
                  <td>{d.cliente_contacto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
