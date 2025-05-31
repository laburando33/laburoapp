// src/components/professional/VerificacionProfesionalCarga.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web"; // Asegúrate de que esta ruta sea correcta
import styles from "./dashboardVerificacion.module.css"; // CSS para este componente
import { toast } from "react-hot-toast";

interface ProfessionalVerificationData {
  dni_url: string | null;
  constancia_domicilio_url: string | null;
  trabajos_urls: string[] | null;
  verificacion_status: string;
  comentario: string | null;
  is_verified: boolean;
}

interface Props {
  userId: string;
}

export default function VerificacionProfesionalCarga({ userId }: Props) {
  const [verificacionData, setVerificacionData] = useState<ProfessionalVerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dniFile, setDniFile] = useState<File | null>(null);
  const [constanciaFile, setConstanciaFile] = useState<File | null>(null);
  const [trabajosFiles, setTrabajosFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const loadVerificacion = async () => {
    setLoading(true);
    // ¡CORRECCIÓN CLAVE AQUÍ! Consulta la tabla 'verificaciones_profesionales' para los documentos
    const { data, error } = await supabase
      .from("verificaciones_profesionales") // <--- ¡TABLA CORRECTA!
      .select("dni_url, constancia_domicilio_url, trabajos_urls, verificacion_status, comentario, is_verified")
      .eq("user_id", userId)
      .maybeSingle(); // Usar maybeSingle() si puede que no haya una entrada aún

    if (error) {
      console.error("❌ Error al cargar datos de verificación del profesional:", error.message);
      toast.error("❌ Error al cargar documentos: " + error.message);
      setVerificacionData(null); // Asegura que si hay error, los datos sean null
    } else {
      setVerificacionData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      loadVerificacion();
      // Opcional: Suscripción Realtime si quieres actualizaciones en tiempo real aquí también
    }
  }, [userId]);

  // Funciones de manejo de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null | FileList>>) => {
    if (e.target.files) {
      if (setter === setTrabajosFiles) {
        setter(e.target.files);
      } else {
        setter(e.target.files[0]);
      }
    }
  };

  const uploadDocuments = async () => {
    setUploading(true);
    setUploadMessage("Subiendo documentos...");

    let newDniUrl: string | null = verificacionData?.dni_url || null;
    let newConstanciaUrl: string | null = verificacionData?.constancia_domicilio_url || null;
    let newTrabajosUrls: string[] = verificacionData?.trabajos_urls || [];

    try {
      // 1. Subir DNI
      if (dniFile) {
        const dniPath = `${userId}/dni/${Date.now()}_${dniFile.name}`;
        const { data: dniUploadData, error: dniUploadError } = await supabase.storage
          .from("verificaciones") // <--- ¡CAMBIO AQUÍ!
          .upload(dniPath, dniFile, {
            cacheControl: '3600',
            upsert: false // No sobrescribir si ya existe
          });
        if (dniUploadError) throw dniUploadError;
        newDniUrl = supabase.storage.from("verificaciones").getPublicUrl(dniPath).data.publicUrl; // <--- ¡Y AQUÍ!
      }

      // 2. Subir Constancia de Domicilio
      if (constanciaFile) {
        const constanciaPath = `${userId}/domicilio/${Date.now()}_${constanciaFile.name}`;
        const { data: constanciaUploadData, error: constanciaUploadError } = await supabase.storage
          .from("verificaciones") // <--- ¡CAMBIO AQUÍ!
          .upload(constanciaPath, constanciaFile, {
            cacheControl: '3600',
            upsert: false
          });
        if (constanciaUploadError) throw constanciaUploadError;
        newConstanciaUrl = supabase.storage.from("verificaciones").getPublicUrl(constanciaPath).data.publicUrl; // <--- ¡Y AQUÍ!
      }

      // 3. Subir Trabajos Realizados (si son múltiples)
      if (trabajosFiles && trabajosFiles.length > 0) {
        // Limpiar URLs de trabajos antiguos para evitar duplicados si se re-suben
        // Considera si realmente quieres limpiar o añadir a los existentes.
        // Si siempre se re-suben todos los trabajos, limpiar está bien.
        // Si es añadir, deberías hacer: newTrabajosUrls = [...newTrabajosUrls]; y luego push.
        newTrabajosUrls = []; // ¡Cuidado con esto si quieres añadir en lugar de reemplazar!
        for (let i = 0; i < trabajosFiles.length; i++) {
          const file = trabajosFiles[i];
          const trabajoPath = `${userId}/trabajos/${Date.now()}_${file.name}`;
          const { data: trabajoUploadData, error: trabajoUploadError } = await supabase.storage
            .from("verificaciones") // <--- ¡CAMBIO AQUÍ!
            .upload(trabajoPath, file, {
              cacheControl: '3600',
              upsert: false
            });
          if (trabajoUploadError) throw trabajoUploadError;
          newTrabajosUrls.push(supabase.storage.from("verificaciones").getPublicUrl(trabajoPath).data.publicUrl); // <--- ¡Y AQUÍ!
        }
      }

      // 4. Actualizar la tabla 'verificaciones_profesionales' con las nuevas URLs
      // Intenta insertar o actualizar (upsert) la entrada
      const { error: upsertError } = await supabase
        .from("verificaciones_profesionales")
        .upsert({
          user_id: userId,
          dni_url: newDniUrl,
          constancia_domicilio_url: newConstanciaUrl,
          trabajos_urls: newTrabajosUrls, // Esto debe ser un JSONB en tu DB para funcionar correctamente
          verificacion_status: "pendiente", // Al subir documentos, el estado debe ser 'pendiente'
        }, { onConflict: 'user_id' }); // Conflict: user_id para actualizar la fila existente

      if (upsertError) throw upsertError;

      setUploadMessage("Documentos subidos y solicitud actualizada.");
      toast.success("✅ Documentos enviados y solicitud de verificación actualizada!");
      loadVerificacion(); // Recarga los datos para reflejar los cambios
      setDniFile(null); // Limpiar inputs de archivo
      setConstanciaFile(null);
      setTrabajosFiles(null);

    } catch (error: any) {
      console.error("❌ Error al subir documentos:", error.message);
      setUploadMessage("Error al subir documentos: " + error.message);
      toast.error("❌ Error al subir documentos: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p className={styles.loading}>Cargando estado de verificación...</p>;

  return (
    <div className={styles.verificationContainer}>
      <h2 className={styles.title}>Carga de Documentación</h2>

      {verificacionData && (
        <div className={styles.currentDocuments}>
          <h3>Documentos Enviados</h3>
          {verificacionData.dni_url && (
            <div>
              <p><strong>DNI:</strong></p>
              <a href={verificacionData.dni_url} target="_blank" rel="noopener noreferrer">
                <img src={verificacionData.dni_url} alt="DNI" className={styles.image} />
              </a>
            </div>
          )}
          {verificacionData.constancia_domicilio_url && (
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Constancia de domicilio:</strong></p>
              <a href={verificacionData.constancia_domicilio_url} target="_blank" rel="noopener noreferrer">
                <img src={verificacionData.constancia_domicilio_url} alt="Constancia de domicilio" className={styles.image} />
              </a>
            </div>
          )}
          {verificacionData.trabajos_urls && verificacionData.trabajos_urls.length > 0 && (
            <div className={styles.trabajos} style={{ marginTop: '1rem' }}>
              <p><strong>Trabajos realizados:</strong></p>
              <div className={styles.trabajosGrid}>
                {verificacionData.trabajos_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Trabajo ${i + 1}`} className={styles.trabajoImg} />
                  </a>
                ))}
              </div>
            </div>
          )}
          {(!verificacionData.dni_url && !verificacionData.constancia_domicilio_url && !verificacionData.trabajos_urls?.length) && (
            <p>No hay documentos cargados aún.</p>
          )}
        </div>
      )}

      <div className={styles.uploadForm} style={{ marginTop: '2rem' }}>
        <h3>Subir/Actualizar Documentos</h3>
        <div>
          <label htmlFor="dni">DNI:</label>
          <input type="file" id="dni" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, setDniFile)} />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="constancia">Constancia de domicilio:</label>
          <input type="file" id="constancia" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, setConstanciaFile)} />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="trabajos">Trabajos realizados (múltiples):</label>
          <input type="file" id="trabajos" accept="image/*" multiple onChange={(e) => handleFileChange(e, setTrabajosFiles)} />
        </div>
        <button
          onClick={uploadDocuments}
          disabled={uploading || (!dniFile && !constanciaFile && (!trabajosFiles || trabajosFiles.length === 0))}
          className={styles.uploadButton}
          style={{ marginTop: '1.5rem' }}
        >
          {uploading ? "Subiendo..." : "Enviar Documentos"}
        </button>
        {uploadMessage && <p className={styles.message}>{uploadMessage}</p>}
      </div>
    </div>
  );
}