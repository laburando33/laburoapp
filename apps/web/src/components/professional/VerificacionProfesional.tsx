// components/professional/VerificacionProfesional.tsx
"use client";

import { useState } from "react";
import { usePerfil } from "@hooks/usePerfil"; // Asegúrate de que este hook esté correctamente implementado
import styles from "./dashboardVerificacion.module.css";
import ActualizarVerificacion from "./ActualizarVerificacion";
import VerificacionHistorial from "./VerificacionHistorial"; // Importamos el componente de historial

interface Props {
  userId: string;
}

export default function VerificacionProfesional({ userId }: Props) {
  const { perfil, loading, error, refetchPerfil } = usePerfil(userId); // Usamos usePerfil

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  if (loading) return <p className={styles.loading}>Cargando verificación...</p>;
  if (error) return <p className={styles.error}>❌ Error al cargar datos de verificación: {error}</p>;

  const displayStatus =
    perfil?.verificacion_status === "verificado"
      ? "✅ Verificado"
      : perfil?.verificacion_status === "pendiente"
      ? "⏳ Pendiente"
      : "❌ No verificado";

  const showUpdateForm =
    perfil?.verificacion_status === "rechazado" ||
    perfil?.verificacion_status === "no_verificado" ||
    mostrarFormulario; // Permitir mostrar el formulario si el usuario lo activa

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>🗂 Documentación de Verificación</h2>

      {perfil ? (
        <>
          <p className={styles.estado}>
            <strong>Estado:</strong> {displayStatus}
            {perfil.verificacion_status === "rechazado" && perfil.comentario && (
              <span className={styles.comentarioRechazo}> ({perfil.comentario})</span>
            )}
          </p>

          <div className={styles.docsGrid}>
            {perfil.dni_url && (
              <div className={styles.docCard}>
                <p>
                  <strong>DNI:</strong>
                </p>
                <a href={perfil.dni_url} target="_blank" rel="noopener noreferrer">
                  <img src={perfil.dni_url} alt="DNI" className={styles.image} />
                </a>
              </div>
            )}
            {perfil.constancia_domicilio_url && (
              <div className={styles.docCard}>
                <p>
                  <strong>Constancia de domicilio:</strong>
                </p>
                <a href={perfil.constancia_domicilio_url} target="_blank" rel="noopener noreferrer">
                  <img src={perfil.constancia_domicilio_url} alt="Constancia de domicilio" className={styles.image} />
                </a>
              </div>
            )}
          </div>
          {perfil.trabajos_urls && perfil.trabajos_urls.length > 0 && (
            <div className={styles.trabajos}>
              <p>
                <strong>Trabajos realizados:</strong>
              </p>
              <div className={styles.trabajosGrid}>
                {perfil.trabajos_urls.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Trabajo ${i + 1}`} className={styles.trabajoImg} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Botón para actualizar documentos (visible si está rechazado o no verificado) */}
          {(perfil.verificacion_status === "rechazado" || perfil.verificacion_status === "no_verificado") && (
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className={styles.updateButton}
            >
              {mostrarFormulario ? "Ocultar formulario de actualización" : "Actualizar Documentación"}
            </button>
          )}

          {/* Mostrar el formulario de ActualizarVerificacion solo si es necesario */}
          {showUpdateForm && (
            <ActualizarVerificacion userId={userId} onDocumentUploaded={refetchPerfil} />
          )}

          {/* Historial de Verificación */}
          <VerificacionHistorial userId={userId} />

        </>
      ) : (
        <>
          <p className={styles.estado}>Aún no enviaste tu verificación o no se encontraron documentos.</p>
          <ActualizarVerificacion userId={userId} onDocumentUploaded={refetchPerfil} />
        </>
      )}
    </section>
  );
}