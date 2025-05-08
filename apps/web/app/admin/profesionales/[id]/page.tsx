"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-web";
import styles from "@/app/admin/profesionales/[id]/perfilAdmin.module.css";
import Image from "next/image";

export default function AdminViewProfessional() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;

  const [perfil, setPerfil] = useState<any>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    location: "",
    category: "",
  });
  const [editando, setEditando] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !data) return;

      setPerfil(data);
      setForm({
        full_name: data.full_name,
        phone: data.phone,
        location: data.location,
        category: data.category,
      });
      setVerificado(data.verificacion_status === "verificado");
      setLoading(false);
    };

    if (userId) fetchPerfil();
  }, [userId]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    const { error } = await supabase
      .from("professionals")
      .update({
        ...form,
        verificacion_status: verificado ? "verificado" : "pendiente",
        is_verified: verificado,
      })
      .eq("user_id", userId);

    if (error) {
      alert("❌ Error al guardar");
      return;
    }

    alert("✅ Perfil actualizado");
    setEditando(false);
  };

  if (loading) return <p className={styles.loading}>Cargando perfil...</p>;
  if (!perfil) return <p className={styles.errorBox}>Perfil no encontrado</p>;

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>👤 Perfil de {perfil.full_name}</h1>

      {perfil.avatar_url && (
        <Image
          src={perfil.avatar_url}
          alt="Avatar"
          width={100}
          height={100}
          style={{ borderRadius: "50%", marginBottom: "1rem" }}
        />
      )}

      <div className={styles.data}>
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

        {editando && (
          <div style={{ marginTop: "1rem" }}>
            <label>
              <input
                type="checkbox"
                checked={verificado}
                onChange={() => setVerificado(!verificado)}
              />
              Marcar como verificado
            </label>
          </div>
        )}
      </div>

      <div className={styles.buttonGroup}>
        {editando ? (
          <>
            <button onClick={handleGuardar} className={styles.saveButton}>💾 Guardar</button>
            <button onClick={() => setEditando(false)} className={styles.cancelButton}>❌ Cancelar</button>
          </>
        ) : (
          <button onClick={() => setEditando(true)} className={styles.editButton}>✏️ Editar</button>
        )}
      </div>
    </div>
  );
}
