"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "./DashboardAdmin.module.css";
import toast from "react-hot-toast";

export default function DashboardAdmin() {
  const [profesionalesPendientes, setProfesionalesPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfesionales = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("verificacion_status", "pendiente");

      if (error) {
        console.error("❌ Error al cargar profesionales:", error.message);
        toast.error("Error al cargar profesionales");
      } else {
        setProfesionalesPendientes(data);
      }
      setLoading(false);
    };

    fetchProfesionales();
  }, []);

  const handleVerificar = async (user_id: string, status: string) => {
    const action = status === "verificado" ? "Aprobar" : "Rechazar";
    if (!confirm(`¿Estás seguro de que quieres ${action} a este profesional?`)) return;

    const { error } = await supabase
      .from("professionals")
      .update({ verificacion_status: status })
      .eq("user_id", user_id);

    if (error) {
      toast.error(`Error al ${action.toLowerCase()}: ${error.message}`);
    } else {
      toast.success(`Profesional ${action.toLowerCase()} con éxito`);
      setProfesionalesPendientes((prev) =>
        prev.filter((prof) => prof.user_id !== user_id)
      );
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>📊 Panel del Administrador</h1>

      {loading ? (
        <p>🔄 Cargando profesionales pendientes...</p>
      ) : profesionalesPendientes.length > 0 ? (
        <div className={styles.profesionalesList}>
          {profesionalesPendientes.map((prof) => (
            <div key={prof.user_id} className={styles.profCard}>
              <h3>{prof.full_name || "Sin nombre"}</h3>
              <p>📧 Email: {prof.email}</p>
              <p>📞 Teléfono: {prof.phone || "No registrado"}</p>
              <p>📍 Localidad: {prof.location || "No registrada"}</p>
              <div className={styles.actions}>
                <button
                  className={styles.approveButton}
                  onClick={() => handleVerificar(prof.user_id, "verificado")}
                >
                  ✅ Aprobar
                </button>
                <button
                  className={styles.rejectButton}
                  onClick={() => handleVerificar(prof.user_id, "rechazado")}
                >
                  ❌ Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay profesionales pendientes de verificación.</p>
      )}
    </div>
  );
}
