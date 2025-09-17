// app/admin/profile/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@lib/supabase-web";
import styles from "../profile.module.css";  // ajusta import si hace falta

export default function AdminProfileView() {
  const { id } = useParams();
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [compras, setCompras] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [creditos, setCreditos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      // perfil
      const { data: p, error: pe } = await supabase
        .from("professionals")
        .select("*")
        .eq("user_id", id)
        .single();
      if (pe || !p) return router.back();
      setPerfil(p);

      // compras
      const { data: c } = await supabase
        .from("credit_purchases")
        .select("id, credits, price, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      setCompras(c || []);

      // solicitudes
      const { data: s } = await supabase
        .from("requests")
        .select("id, job_description, category, location, created_at")
        .eq("professional_id", id)
        .order("created_at", { ascending: false });
      setSolicitudes(s || []);

      // créditos
      const { data: cr } = await supabase
        .from("credits")
        .select("balance")
        .eq("user_id", id)
        .maybeSingle();
      setCreditos(cr?.balance ?? 0);

      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <p>🔄 Cargando perfil admin…</p>;
  if (!perfil) return <p>Error cargando profesional.</p>;

  return (
    <div className={styles.profileContainer}>
      <h1>👷 Perfil de {perfil.full_name}</h1>
      <p><strong>Verificación:</strong> {perfil.verificacion_status}</p>
      <div>
        <h3>🪙 Créditos Disponibles</h3>
        <p>{creditos}</p>
      </div>
      <div>
        <h3>🧾 Historial de Compras</h3>
        {compras.map((c) => (
          <div key={c.id}>
            {c.credits} créditos — ${c.price} — {new Date(c.created_at).toLocaleDateString()}
          </div>
        ))}
      </div>
      <div>
        <h3>📋 Solicitudes</h3>
        {solicitudes.map((s) => (
          <div key={s.id}>
            {s.category} — {s.job_description}
          </div>
        ))}
      </div>
    </div>
  );
}
