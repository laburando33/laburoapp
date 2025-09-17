"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@lib/supabase-web";
import AvatarUploader from "@components/professional/AvatarUploader";
import VerificacionProfesional from "@components/professional/VerificacionProfesional";
import styles from "@styles/DashboardPro.module.css";
import { usePerfil } from "@hooks/usePerfil";

const allServices = [
  "Albañil", "Técnico de aire acondicionado", "Tarquino", "Electricista",
  "Durlock", "Impermeabilización de techos", "Pulidor de pisos",
  "Pintor interior", "Pintor de alturas", "Electricista matriculado",
  "Vidriería y cerramientos", "Colocación de redes de balcones", "Mudanza y fletes",
  "Pequeños arreglos", "Plomería", "Soldador", "Destapaciones pluviales y cloacales"
];

const allLocations = [
  "Ciudad de Buenos Aires", "Zona Norte GBA", "Zona Sur GBA",
  "Zona Oeste GBA", "La Plata", "Rosario", "Córdoba", "Mendoza", "Mar del Plata"
];

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: "", phone: "", location: "", category: "" });
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
    };
    fetchUser();
  }, [router]);

  const { perfil, loading, error } = usePerfil(userId);

  useEffect(() => {
    if (perfil) {
      setForm({
        full_name: perfil.full_name || "",
        phone: perfil.phone || "",
        location: perfil.location || "",
        category: perfil.category || "",
      });
    }
  }, [perfil]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    if (!perfil) return;
    const { error } = await supabase
      .from("professionals")
      .update(form)
      .eq("user_id", perfil.user_id);

    if (error) {
      alert("❌ Error al guardar: " + error.message);
    } else {
      alert("✅ Cambios guardados correctamente.");
      setEditando(false);
    }
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
          <select name="location" value={form.location} onChange={handleChange}>
            <option value="">Seleccioná una ubicación</option>
            {allLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        ) : (
          <p>{perfil.location}</p>
        )}

        <label>Categoría</label>
        {editando ? (
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">Seleccioná un servicio</option>
            {allServices.map((svc) => (
              <option key={svc} value={svc}>{svc}</option>
            ))}
          </select>
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
