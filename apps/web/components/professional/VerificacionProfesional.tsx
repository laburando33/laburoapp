"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./dashboardVerificacion.module.css";
import ActualizarVerificacion from "./ActualizarVerificacion";

interface Verificacion {
  dni_url: string;
  certificado_url: string;
  trabajos_urls: string[];
  estado: string;
}

interface Props {
  userId: string;
}

export default function VerificacionProfesional({ userId }: Props) {
  const [verificacion, setVerificacion] = useState<Verificacion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVerificacion = async () => {
      const { data, error } = await supabase
        .from("verificaciones_profesionales")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("❌ Error verificación:", error.message);
        setVerificacion(null);
      } else {
        setVerificacion(data);
      }

      setLoading(false);
    };

    loadVerificacion();
  }, [userId]);

  if (loading) return <p className={styles.loading}>Cargando verificación...</p>;

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>🗂 Documentación de Verificación</h2>

      {verificacion ? (
        <>
          <p className={styles.estado}><strong>Estado:</strong> {verificacion.estado?.toUpperCase() || "PENDIENTE"}</p>

          <div className={styles.docsGrid}>
            <div>
              <p><strong>DNI:</strong></p>
              <img src={verificacion.dni_url} alt="DNI" className={styles.image} />
            </div>
            <div>
              <p><strong>Certificado domicilio:</strong></p>
              <img src={verificacion.certificado_url} alt="Certificado" className={styles.image} />
            </div>
          </div>

          <div className={styles.trabajos}>
            <p><strong>Trabajos realizados:</strong></p>
            <div className={styles.trabajosGrid}>
              {verificacion.trabajos_urls?.map((url, i) => (
                <img key={i} src={url} alt={`Trabajo ${i + 1}`} className={styles.trabajoImg} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <p className={styles.estado}>Aún no enviaste tu verificación.</p>
          <ActualizarVerificacion userId={userId} />
        </>
      )}
    </section>
  );
}
