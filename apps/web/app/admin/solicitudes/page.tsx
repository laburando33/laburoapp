'use client';
import BotonDesbloquear from "@/components/BotonDesbloquear";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "@/styles/admin.module.css";
import Link from "next/link";

interface Solicitud {
  id: string;
  cliente_nombre: string;
  servicio: string;
  ubicacion: string;
  comentarios: string;
  created_at: string;
}

export default function SolicitudesAdminPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [filteredData, setFilteredData] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 🔄 Traer las solicitudes pendientes
  const fetchSolicitudes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("admin_solicitudes_pendientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSolicitudes(data || []);
      setFilteredData(data || []);
    } catch (err: any) {
      console.error("❌ Error obteniendo solicitudes pendientes:", err.message);
      setError("Error al cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  // 🔍 Filtrado en tiempo real
  useEffect(() => {
    const filtered = solicitudes.filter((item) =>
      item.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reiniciar a la primera página cuando se filtra
  }, [searchTerm, solicitudes]);

  // 🔄 Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>📋 Solicitudes Pendientes</h1>

      <input
        type="text"
        placeholder="🔍 Buscar por cliente, servicio o ubicación..."
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
        <div className={styles.alert}>No hay solicitudes pendientes.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Ubicación</th>
                <th>Comentarios</th>
                <th>Fecha de Solicitud</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((sol) => (
                <tr key={sol.id}>
                  <td>{sol.cliente_nombre}</td>
                  <td>{sol.servicio}</td>
                  <td>{sol.ubicacion}</td>
                  <td>{sol.comentarios}</td>
                  <td>{new Date(sol.created_at).toLocaleString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Link href={`/admin/solicitudes/${sol.id}`} className={styles.viewButton}>
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
