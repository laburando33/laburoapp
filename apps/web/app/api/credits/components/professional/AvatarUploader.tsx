"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./AvatarUploader.module.css";

interface AvatarUploaderProps {
  userId: string;
  avatarUrl?: string | null;
}

export default function AvatarUploader({ userId, avatarUrl }: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(avatarUrl || null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("❌ Error subiendo imagen: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (data?.publicUrl) {
      setPreview(data.publicUrl);

      // Actualizar URL de avatar en la base de datos
      await supabase
        .from("professionals")
        .update({ avatar_url: data.publicUrl })
        .eq("user_id", userId);

      alert("✅ Foto actualizada.");
    }

    setUploading(false);
  };

  return (
    <div className={styles.avatarContainer}>
      {preview ? (
        <img src={preview} alt="Foto de perfil" className={styles.avatarImage} />
      ) : (
        <div className={styles.placeholder}>📷</div>
      )}
      <label className={styles.uploadButton}>
        {uploading ? "Subiendo..." : "Subir nueva foto"}
        <input type="file" onChange={handleFileChange} accept="image/*" hidden />
      </label>
    </div>
  );
}
