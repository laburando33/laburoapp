'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web"; // corregido
import styles from "@/styles/admin.module.css";
import { useRouter } from "next/navigation";

interface Profesional {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  job_description?: string;
  category: string;
}

export default function ProfesionalesAdminPage() {
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchProfesionales = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase
        .from("professionals")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.role !== "administrador") { // corregimos para usar "administrador"
        setHasAccess(false);
        return;
      }

      setHasAccess(true);

      const { data, error } = await supabase
        .from("view_professionals_with_categories")
        .select("*");

      if (error) {
        console.error("❌ Error al obtener profesionales:", error.message);
      } else {
        setProfesionales(data || []);
      }

      setLoading(false);
    };

    fetchProfesionales();
  }, [router]);

  if (loading) return <p className={styles.loading}>Cargando profesionales...</p>;
  if (hasAccess === false) return <p className={styles.error}>🚫 No tenés permiso para ver esta sección.</p>;

  const filtered = profesionales.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className={styles.profileContainer}>
      <h1 className={styles.title}>👷 Profesionales Verificados</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, email o categoría..."
        className={styles.inputField}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className={styles.cardList}>
        {filtered.map((pro) => (
          <div key={pro.user_id} className={styles.cardItem}>
            <h3>{pro.full_name}</h3>
            <p><strong>Email:</strong> {pro.email}</p>
            <p><strong>Teléfono:</strong> {pro.phone}</p>
            <p><strong>Categoría:</strong> {pro.category}</p>
            <p><strong>Descripción:</strong> {pro.job_description || "Sin descripción"}</p>
            <button
              className={styles.secondaryButton}
              onClick={() => router.push(`/admin/profile/${pro.user_id}`)}
            >
              Ver Perfil
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
