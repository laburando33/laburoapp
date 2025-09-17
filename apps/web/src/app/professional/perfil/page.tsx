// src/app/professional/perfil/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@lib/supabase-web"; // Asegúrate de que esta ruta sea correcta
import AvatarUploader from "@components/professional/AvatarUploader"; // Asumiendo que tienes este componente
import VerificacionProfesionalCarga from "@components/professional/VerificacionProfesionalCarga"; // Nuevo componente
import VerificacionHistorial from "@components/professional/VerificacionHistorial"; // Nuevo componente
import VerificacionEstado from "@components/professional/VerificacionEstado"; // Componente para solicitar verificación
import ActualizarVerificacion from "@components/professional/ActualizarVerificacion"; // Componente para mostrar estado actual
import styles from "@styles/DashboardPro.module.css"; // Usa el mismo CSS
import { usePerfil } from "@hooks/usePerfil"; // Asegúrate de que este hook esté correcto
import { toast } from "react-hot-toast";

// Definir las categorías de servicios y ubicaciones disponibles
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
  const { perfil, loading: loadingPerfil, error: errorPerfil } = usePerfil(userId || undefined); // Usa el hook
  const [form, setForm] = useState({ full_name: "", phone: "", location: "", category: "" });
  const [editando, setEditando] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
      } else {
        setUserId(user.id);
      }
    };
    getUser();
  }, [router]);

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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardar = async () => {
    setLoadingUpdate(true);
    if (!userId) {
      toast.error("Error: Usuario no autenticado.");
      setLoadingUpdate(false);
      return;
    }

    // No permitir editar si el estado es 'pendiente' o 'verificado'
    if (perfil?.verificacion_status === 'pendiente' || perfil?.verificacion_status === 'verificado') {
      toast.error("No puedes editar tu perfil mientras tu cuenta esté pendiente o verificada.");
      setLoadingUpdate(false);
      setEditando(false); // Sale del modo edición
      return;
    }

    try {
      const { error } = await supabase
        .from("professionals")
        .update(form)
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("✅ Perfil actualizado correctamente.");
      setEditando(false); // Sale del modo edición
    } catch (error: any) {
      console.error("❌ Error al actualizar perfil:", error.message);
      toast.error("❌ Error al actualizar perfil: " + error.message);
    } finally {
      setLoadingUpdate(false);
    }
  };

  if (loadingPerfil || !userId) return <p className={styles.msg}>Cargando perfil...</p>;
  if (errorPerfil) return <p className={styles.msg}>Error al cargar el perfil: {errorPerfil}</p>;
  if (!perfil) return <p className={styles.msg}>No se encontró el perfil del profesional.</p>;


  // Determina si el perfil es editable
  const editable = perfil.verificacion_status !== 'pendiente' && perfil.verificacion_status !== 'verificado';

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.welcomeMessage}>¡Hola, {perfil.full_name}!</h1>

      {/* Componente para el avatar */}
      <AvatarUploader userId={userId} currentAvatarUrl={perfil.avatar_url} />

      <h2 className={styles.title} style={{ marginTop: '2rem' }}>Información del Perfil</h2>
      <div className={styles.infoBlock}>
        <p>
          <strong>Nombre completo:</strong>{" "}
          {editando ? (
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className={styles.inputField}
            />
          ) : (
            perfil.full_name
          )}
        </p>
        <p>
          <strong>Email:</strong> {perfil.email}
        </p>
        <p>
          <strong>Teléfono:</strong>{" "}
          {editando ? (
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={styles.inputField}
            />
          ) : (
            perfil.phone
          )}
        </p>
        <p>
          <strong>Localidad:</strong>{" "}
          {editando ? (
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className={styles.inputField}
            >
              <option value="">Seleccionar...</option>
              {allLocations.map((loc, i) => (
                <option key={i} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          ) : (
            perfil.location
          )}
        </p>
        <p>
          <strong>Categoría:</strong>{" "}
          {editando ? (
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={styles.inputField}
            >
              <option value="">Seleccionar...</option>
              {allServices.map((serv, i) => (
                <option key={i} value={serv}>
                  {serv}
                </option>
              ))}
            </select>
          ) : (
            perfil.category || "—"
          )}
        </p>
      </div>

      <div className={styles.buttonGroup}>
        {editable ? (
          editando ? (
            <>
              <button onClick={handleGuardar} className={styles.saveButton} disabled={loadingUpdate}>
                {loadingUpdate ? "Guardando..." : "💾 Guardar"}
              </button>
              <button onClick={() => setEditando(false)} className={styles.cancelButton} disabled={loadingUpdate}>
                ❌ Cancelar
              </button>
            </>
          ) : (
            <button onClick={() => setEditando(true)} className={styles.editButton}>
              ✏️ Editar Perfil
            </button>
          )
        ) : (
          <p className={styles.disabledMsg}>🔒 No puedes editar mientras tu cuenta esté pendiente o verificada.</p>
        )}
      </div>

      {/* Componentes de Verificación */}
      <ActualizarVerificacion userId={userId} />
      <VerificacionEstado userId={userId} />
      <VerificacionProfesionalCarga userId={userId} />
      <VerificacionHistorial userId={userId} /> {/* Aquí se incluye el historial */}
    </div>
  );
}