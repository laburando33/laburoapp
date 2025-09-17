// @components/professional/VerificacionProfesional.tsx
"use client";

import { useState } from "react";
import { usePerfil } from "@hooks/usePerfil"; // Asegúrate de que este hook esté correctamente implementado
import styles from "./dashboardVerificacion.module.css"; // Asumo que tus estilos para verificación están aquí
import ActualizarVerificacion from "./ActualizarVerificacion";
// import VerificacionHistorial from "./VerificacionHistorial"; // ¡COMENTADA O ELIMINADA para quitar el historial del dashboard!

interface Props {
  userId: string;
}

export default function VerificacionProfesional({ userId }: Props) {
  const { perfil, loading, error, refetchPerfil } = usePerfil(userId);

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
            Estado actual: <span className={styles[perfil.verificacion_status || ""]}>{displayStatus}</span>
          </p>

          {perfil.comentario && perfil.verificacion_status === "rechazado" && (
            <p className={styles.comentarioRechazo}>
              **Motivo del rechazo:** {perfil.comentario}
            </p>
          )}

          {perfil.dni_url || perfil.titulo_url || (perfil.trabajos_urls && perfil.trabajos_urls.length > 0) ? (
            <div className={styles.documentosMostrados}>
              {perfil.dni_url && (
                <p>
                  DNI subido: <a href={perfil.dni_url} target="_blank" rel="noopener noreferrer">Ver DNI</a>
                </p>
              )}
              {perfil.titulo_url && (
                <p>
                  Título subido: <a href={perfil.titulo_url} target="_blank" rel="noopener noreferrer">Ver Título</a>
                </p>
              )}
              {perfil.trabajos_urls && perfil.trabajos_urls.length > 0 && (
                <div>
                  <p>Trabajos anteriores:{" "}
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
            </div>
          ) : (
            <p>No se encontraron documentos subidos.</p>
          )}

          {/* Botón para actualizar documentos (visible si está rechazado o no verificado) */}
          {(perfil.verificacion_status === "rechazado" || perfil.verificacion_status === "no_verificado" || !perfil.dni_url) && (
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

          {/* ¡La línea de historial se eliminó o comentó aquí! */}
          {/* <VerificacionHistorial userId={userId} /> */}

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