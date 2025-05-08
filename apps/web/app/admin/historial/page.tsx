'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "@/styles/admin.module.css";
import Link from "next/link";

interface Historial {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: string;
  verified_at: string;
}

export default function HistorialVerificacionPage() {
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [filteredData, setFilteredData] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchHistorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("verification_history")
        .select("*")
        .order("verified_at", { ascending: false });

      if (error) throw error;
      setHistorial(data || []);
      setFilteredData(data || []);
    } catch (err: any) {
      console.error("❌ Error obteniendo historial:", err.message);
      setError("Error al cargar el historial.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  // 🔍 Filtrar por nombre, email o estado
  useEffect(() => {
    const filtered = historial.filter((item) =>
      item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reiniciar a la primera página cuando se filtra
  }, [searchTerm, historial]);

  // 🔄 Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>📜 Historial de Verificaciones</h1>

      <input
        type="text"
        placeholder="🔍 Buscar por nombre, email o estado..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />

      {loading ? (
        <div className={styles.loadingContainer}>
          <p className={styles.loading}>⏳ Cargando...</p>
        </div>
      ) : error ? (
        <div className={styles.alert}>{error}</div>
      ) : filteredData.length === 0 ? (
        <div className={styles.alert}>No hay verificaciones en el historial.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Fecha de Verificación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((ver) => (
                <tr key={ver.id}>
                  <td>{ver.full_name}</td>
                  <td>{ver.email}</td>
                  <td>
                    {ver.status === 'verificado' ? "✅ Verificado" : "❌ Rechazado"}
                  </td>
                  <td>{new Date(ver.verified_at).toLocaleString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Link href={`/admin/historial/${ver.id}`} className={styles.viewButton}>
                        🔍 Ver
                      </Link>
                      <button className={styles.deleteButton}>
                        ❌ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.pagination}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={index + 1 === currentPage ? styles.activePage : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
