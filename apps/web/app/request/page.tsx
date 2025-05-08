"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@lib/supabase-web";

export default function RequestPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    const fetchProfessionals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("professionals")
        .select("full_name, email, phone, avatar_url, description")
        .eq("category", category)
        .eq("is_verified", true);

      if (error) {
        console.error("Error cargando profesionales:", error.message);
        setProfessionals([]);
      } else {
        setProfessionals(data || []);
      }

      setLoading(false);
    };

    fetchProfessionals();
  }, [category]);

  return (
    <main style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h1>🔎 Profesionales de {category}</h1>

      {loading && <p>Cargando profesionales...</p>}

      {!loading && professionals.length === 0 && (
        <p>No hay profesionales disponibles para esta categoría.</p>
      )}

      <div style={{ display: "grid", gap: 20 }}>
        {professionals.map((pro) => (
          <div key={pro.email} style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8 }}>
            <img
              src={pro.avatar_url || "/default-user.png"}
              alt={pro.full_name}
              style={{ width: 100, borderRadius: "50%" }}
            />
            <h3>{pro.full_name}</h3>
            <p><strong>Email:</strong> {pro.email}</p>
            <p><strong>Teléfono:</strong> {pro.phone}</p>
            <p>{pro.description || "Sin descripción."}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
