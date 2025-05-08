"use client";

import { useState } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "./dashboardVerificacion.module.css";

export default function ActualizarVerificacion({ userId }: { userId: string }) {
  const [dniFile, setDniFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [trabajosFiles, setTrabajosFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async () => {
    if (!dniFile || !certFile || !trabajosFiles?.length) {
      return alert("Por favor subí todos los documentos.");
    }

    setLoading(true);
    setMensaje("");

    const bucket = "verificaciones";
    const folder = userId;

    const subirArchivo = async (archivo: File, nombre: string) => {
      const path = `${folder}/${nombre}-${Date.now()}`;
      const { error } = await supabase.storage.from(bucket).upload(path, archivo, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    };

    try {
      const dniUrl = await subirArchivo(dniFile, "dni");
      const certUrl = await subirArchivo(certFile, "certificado");

      const trabajosUrls = [];
      for (let i = 0; i < trabajosFiles.length; i++) {
        const file = trabajosFiles[i];
        const url = await subirArchivo(file, `trabajo${i}`);
        trabajosUrls.push(url);
      }

      const { error: upsertError } = await supabase
        .from("verificaciones_profesionales")
        .upsert({
          user_id: userId,
          dni_url: dniUrl,
          certificado_url: certUrl,
          trabajos_urls: trabajosUrls,
          estado: "pendiente"
        });

      if (upsertError) throw upsertError;

      setMensaje("✅ Verificación actualizada correctamente.");
    } catch (err: any) {
      console.error("❌ Error actualizando verificación:", err.message);
      setMensaje("❌ Hubo un error al subir los archivos.");
    }

    setLoading(false);
  };

  return (
    <div className={styles.actualizarBox}>
      <h3>🔄 Actualizar Verificación</h3>

      <label>DNI:</label>
      <input type="file" accept="image/*" onChange={e => setDniFile(e.target.files?.[0] || null)} />

      <label>Certificado de domicilio:</label>
      <input type="file" accept="image/*" onChange={e => setCertFile(e.target.files?.[0] || null)} />

      <label>Fotos de trabajos realizados:</label>
      <input type="file" accept="image/*" multiple onChange={e => setTrabajosFiles(e.target.files)} />

      <button className={styles.saveButton} onClick={handleSubmit} disabled={loading}>
        {loading ? "Subiendo..." : "Enviar documentos"}
      </button>

      {mensaje && <p className={styles.mensaje}>{mensaje}</p>}
    </div>
  );
}