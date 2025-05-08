"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./ComprasAdmin.module.css"; // reutiliza estilos existentes
import { FiDownload } from "react-icons/fi";

interface Desbloqueo {
  unlock_id: string;
  unlocked_at: string;
  profesional_nombre: string;
  profesional_email: string;
  categoria: string;
  zona: string;
  servicio: string;
  ubicacion: string;
  cliente_nombre: string;
  cliente_contacto: string;
}

export default function DesbloqueosAdmin() {
  const [desbloqueos, setDesbloqueos] = useState<Desbloqueo[]>([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("admin_unlocked_view")
        .select("*")
        .order("unlocked_at", { ascending: false });

      if (error) {
        console.error("❌ Error cargando desbloqueos:", error.message);
      } else {
        setDesbloqueos(data || []);
      }
    };

    fetchData();
  }, []);

  const filtradas = desbloqueos.filter((d) =>
    d.profesional_email.toLowerCase().includes(filtro.toLowerCase())
  );

  const totalDesbloqueos = filtradas.length;

  const profesionalMasActivo = filtradas.reduce((acc, curr) => {
    acc[curr.profesional_email] = (acc[curr.profesional_email] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const profesionalTop = Object.entries(profesionalMasActivo).sort((a, b) => b[1] - a[1])[0];

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

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "desbloqueos_laburando.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <h1>🔓 Desbloqueos de Solicitudes</h1>

      <div className={styles.summaryBox}>
        <p><strong>Total desbloqueos:</strong> {totalDesbloqueos}</p>
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
