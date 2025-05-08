"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-web";
import styles from "@/app/admin/profile/profile.module.css";

interface Profesional {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  job_description?: string;
  location: string;
  category: string;
  verificacion_status: string;
}

interface Compra {
  id: string;
  credits: number;
  price: number;
  created_at: string;
}

interface Solicitud {
  id: number;
  job_description: string;
  category: string;
  location: string;
  created_at: string;
}

export default function AdminProfileView() {
  const { id } = useParams();
  const router = useRouter();
  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [creditos, setCreditos] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      // Cargar perfil
      const { data: profesionalData, error: errorPro } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", id)
        .single();

      if (errorPro) {
        console.error("❌ Error cargando perfil:", errorPro.message);
        return;
      }
      setProfesional(profesionalData);

      // Cargar historial de compras
      const { data: comprasData } = await supabase
        .from("credit_purchases")
        .select("id, credits, price, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      setCompras(comprasData || []);

      // Cargar historial de solicitudes
      const { data: solicitudesData } = await supabase
        .from("requests")
        .select("id, job_description, category, location, created_at")
        .eq("professional_id", id)
        .order("created_at", { ascending: false })
        .limit(10);

      setSolicitudes(solicitudesData || []);

      // Cargar créditos actuales
      const { data: creditData } = await supabase
        .from("credits")
        .select("total_credits")
        .eq("user_id", id)
        .single();

      setCreditos(creditData?.total_credits || 0);

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleVerify = async () => {
    if (!id) return;

    const { error } = await supabase
      .from("professionals")
      .update({ verificacion_status: "verificado" })
      .eq("user_id", id);

    if (error) {
      alert("Error al verificar: " + error.message);
    } else {
      alert("✅ Profesional verificado exitosamente.");
      router.refresh();
    }
  };

  if (loading) return <p className={styles.loading}>🔄 Cargando perfil...</p>;
  if (!profesional) return (
    <div className={styles.error}>
      <p>❌ Profesional no encontrado</p>
      <button onClick={() => router.push("/admin/profesionales")} className={styles.secondaryButton}>
        🔙 Volver a Profesionales
      </button>
    </div>
  );

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>👷 Perfil de {profesional.full_name}</h1>

      <div className={styles.data}>
        <p><strong>Email:</strong> {profesional.email}</p>
        <p><strong>Teléfono:</strong> {profesional.phone}</p>
        <p><strong>Categoría:</strong> {profesional.category}</p>
        <p><strong>Ubicación:</strong> {profesional.location}</p>
        <p><strong>Descripción:</strong> {profesional.job_description || "Sin descripción"}</p>
        <p><strong>Verificación:</strong> {profesional.verificacion_status || "pendiente"}</p>
      </div>

      {profesional.verificacion_status !== "verificado" && (
        <button className={styles.primaryButton} onClick={handleVerify}>
          ✅ Verificar Profesional
        </button>
      )}

      <div className={styles.purchases}>
        <h3>🪙 Créditos Disponibles</h3>
        <p><strong>{creditos}</strong> créditos actuales</p>
      </div>

      <div className={styles.purchases}>
        <h3>🧾 Historial de Compras de Créditos</h3>
        {compras.length === 0 ? (
          <p>No hay compras registradas.</p>
        ) : (
          <ul>
            {compras.map((compra) => (
              <li key={compra.id}>
                <strong>{compra.credits} créditos</strong> — ${compra.price} — {new Date(compra.created_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.purchases}>
        <h3>📋 Últimas Solicitudes Respondidas</h3>
        {solicitudes.length === 0 ? (
          <p>No hay solicitudes recientes.</p>
        ) : (
          <ul>
            {solicitudes.map((s) => (
              <li key={s.id}>
                <strong>{s.category}</strong> — {s.job_description} ({s.location})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
