"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./VerificarProfesionales.module.css";

interface Profesional {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  certificado_url: string;
  dni_url: string;
}

export default function VerificarProfesionales() {
  const [pendientes, setPendientes] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("professionals")
      .select("user_id, full_name, email, avatar_url, certificado_url, dni_url")
      .eq("verificacion_status", "no_verificado");

    if (error) {
      console.error("Error al cargar profesionales pendientes:", error.message);
    } else {
      setPendientes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendientes();
  }, []);

  const handleVerificar = async (user_id: string) => {
    const { error } = await supabase
      .from("professionals")
      .update({ verificacion_status: "verificado" })
      .eq("user_id", user_id);

    if (error) {
      console.error("Error al verificar:", error.message);
      alert("❌ Error al verificar profesional.");
    } else {
      alert("✅ Profesional verificado correctamente.");
      fetchPendientes();
    }
  };

  const handleRechazar = async (user_id: string) => {
    const { error } = await supabase
      .from("professionals")
      .update({ verificacion_status: "rechazado" })
      .eq("user_id", user_id);

    if (error) {
      console.error("Error al rechazar:", error.message);
      alert("❌ Error al rechazar profesional.");
    } else {
      alert("❌ Profesional rechazado correctamente.");
      fetchPendientes();
    }
  };

  return (
    <div className={styles.container}>
      <h2>📝 Profesionales Pendientes de Verificación</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : pendientes.length === 0 ? (
        <p>No hay profesionales pendientes.</p>
      ) : (
        <ul>
          {pendientes.map((pro) => (
            <li key={pro.user_id} className={styles.card}>
              <div>
                <strong>{pro.full_name}</strong> - {pro.email}
                <p>
                  <a href={pro.certificado_url} target="_blank">
                    📄 Certificado
                  </a>{" "}
                  |{" "}
                  <a href={pro.dni_url} target="_blank">
                    📸 DNI
                  </a>
                </p>
              </div>
              <div className={styles.actions}>
                <button
                  onClick={() => handleVerificar(pro.user_id)}
                  className={styles.verifyButton}
                >
                  ✅ Verificar
                </button>
                <button
                  onClick={() => handleRechazar(pro.user_id)}
                  className={styles.rejectButton}
                >
                  ❌ Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
