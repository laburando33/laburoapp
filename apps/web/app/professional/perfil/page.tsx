'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-web";
import AvatarUploader from "@/components/professional/AvatarUploader";
import VerificacionProfesional from "@/components/professional/VerificacionProfesional";
import styles from "@/components/professional/DashboardPro.module.css"; // O en tu nuevo profile.module.css si querés.

export default function ProfilePage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [form, setForm] = useState({ full_name: "", phone: "", location: "", category: "" });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setError("❌ No se pudo cargar tu perfil.");
        return;
      }

      setPerfil(data);
      setForm({
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        location: data.location ?? "",
        category: data.category ?? "",
      });
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    const { error } = await supabase
      .from("professionals")
      .update(form)
      .eq("user_id", perfil.user_id);

    if (error) {
      alert("❌ Error al guardar: " + error.message);
      return;
    }

    alert("✅ Cambios guardados correctamente.");
    setEditando(false);
  };

  if (loading) return <p className={styles.loading}>🔄 Cargando perfil...</p>;
  if (error || !perfil) return <div className={styles.errorBox}><p>{error}</p></div>;

  const firstName = perfil.full_name?.split(" ")[0] || "Profesional";

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>👋 ¡Hola, {firstName}!</h1>

      <AvatarUploader userId={perfil.user_id} avatarUrl={perfil.avatar_url} />

      <div className={styles.dataSection}>
        <label>Nombre completo</label>
        {editando ? (
          <input name="full_name" value={form.full_name} onChange={handleChange} />
        ) : (
          <p>{perfil.full_name}</p>
        )}

        <label>Teléfono</label>
        {editando ? (
          <input name="phone" value={form.phone} onChange={handleChange} />
        ) : (
          <p>{perfil.phone}</p>
        )}

        <label>Ubicación</label>
        {editando ? (
          <input name="location" value={form.location} onChange={handleChange} />
        ) : (
          <p>{perfil.location}</p>
        )}

        <label>Categoría</label>
        {editando ? (
          <input name="category" value={form.category} onChange={handleChange} />
        ) : (
          <p>{perfil.category}</p>
        )}
      </div>

      <div className={styles.buttonGroup}>
        {editando ? (
          <>
            <button onClick={handleGuardar} className={styles.saveButton}>💾 Guardar</button>
            <button onClick={() => setEditando(false)} className={styles.cancelButton}>❌ Cancelar</button>
          </>
        ) : (
          <button onClick={() => setEditando(true)} className={styles.editButton}>✏️ Editar Perfil</button>
        )}
      </div>

      <VerificacionProfesional
        userId={perfil.user_id}
        isVerified={perfil.is_verified}
        verificationStatus={perfil.verificacion_status}
      />
    </div>
  );
}
