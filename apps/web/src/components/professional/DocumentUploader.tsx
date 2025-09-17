// components/professional/DocumentUploader.tsx
"use client";

import { useState } from "react";
import { supabase } from "@lib/supabase-web";
import { toast } from "react-hot-toast";
import styles from "./dashboardVerificacion.module.css"; // Reutiliza o crea un nuevo archivo de estilos

interface DocumentUploaderProps {
  userId: string;
  onUploadSuccess: () => void; // Callback para notificar al componente padre que se subió algo
}

export default function DocumentUploader({ userId, onUploadSuccess }: DocumentUploaderProps) {
  const [dniFile, setDniFile] = useState<File | null>(null);
  const [constanciaDomicilioFile, setConstanciaDomicilioFile] = useState<File | null>(null);
  const [trabajosFiles, setTrabajosFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    } else {
      setter(null);
    }
  };

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTrabajosFiles(e.target.files);
    } else {
      setTrabajosFiles(null);
    }
  };

  const uploadFile = async (file: File, folder: string) => {
    const filePath = `${userId}/${folder}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("verificaciones") // Asegúrate de que tu bucket se llama 'verificaciones'
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Error al subir ${file.name}: ${error.message}`);
    }
    return data.path; // Retorna la ruta del archivo subido
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss(); // Limpiar toasts anteriores

    try {
      let dniUrl: string | null = null;
      let constanciaDomicilioUrl: string | null = null;
      const trabajosUrls: string[] = [];

      // Subir DNI
      if (dniFile) {
        dniUrl = await uploadFile(dniFile, "dni");
        const { data } = supabase.storage.from("verificaciones").getPublicUrl(dniUrl);
        dniUrl = data.publicUrl;
      }

      // Subir Constancia de Domicilio
      if (constanciaDomicilioFile) {
        constanciaDomicilioUrl = await uploadFile(constanciaDomicilioFile, "constancia_domicilio");
        const { data } = supabase.storage.from("verificaciones").getPublicUrl(constanciaDomicilioUrl);
        constanciaDomicilioUrl = data.publicUrl;
      }

      // Subir Trabajos
      if (trabajosFiles && trabajosFiles.length > 0) {
        for (let i = 0; i < trabajosFiles.length; i++) {
          const file = trabajosFiles[i];
          const path = await uploadFile(file, "trabajos");
          const { data } = supabase.storage.from("verificaciones").getPublicUrl(path);
          trabajosUrls.push(data.publicUrl);
        }
      }

      // Actualizar la tabla 'professionals' con las URLs y el estado de verificación
      const { error: updateError } = await supabase
        .from("professionals")
        .update({
          dni_url: dniUrl,
          constancia_domicilio_url: constanciaDomicilioUrl,
          trabajos_urls: trabajosUrls.length > 0 ? trabajosUrls : null,
          verificacion_status: "pendiente", // Cambiar el estado a pendiente cuando se envían documentos
          comentario: null, // Limpiar cualquier comentario previo al re-enviar
          is_verified: false, // Asegurar que no está verificado al re-enviar
        })
        .eq("user_id", userId);

      if (updateError) {
        throw new Error(`Error al actualizar perfil: ${updateError.message}`);
      }

      toast.success("✅ Documentos enviados para verificación. Tu estado ahora es 'pendiente'.");
      onUploadSuccess(); // Notificar al padre para recargar los datos
      setDniFile(null);
      setConstanciaDomicilioFile(null);
      setTrabajosFiles(null);
    } catch (err: any) {
      console.error("Error al procesar la subida:", err.message);
      toast.error(`❌ Error al subir documentos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.verificationContainer}>
      <h2 className={styles.title}>Subir Documentación para Verificación</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="dni">Copia de DNI (frente y dorso en un solo archivo o ambos lados):</label>
          <input
            type="file"
            id="dni"
            accept="image/*,.pdf"
            onChange={(e) => handleFileChange(e, setDniFile)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="constancia_domicilio">Constancia de Domicilio (factura de servicio, etc.):</label>
          <input
            type="file"
            id="constancia_domicilio"
            accept="image/*,.pdf"
            onChange={(e) => handleFileChange(e, setConstanciaDomicilioFile)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="trabajos_urls">Fotos de trabajos realizados (hasta 5, opcional):</label>
          <input
            type="file"
            id="trabajos_urls"
            accept="image/*"
            multiple
            onChange={handleMultipleFilesChange}
          />
          <small>Máximo 5 imágenes.</small>
        </div>

        <button type="submit" disabled={loading} className={styles.saveButton}>
          {loading ? "Enviando..." : "Enviar Documentos para Verificación"}
        </button>
      </form>
    </section>
  );
}