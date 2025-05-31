"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "./services-directory.module.css";

export default function ServicesDirectoryPage() {
  const [services, setServices] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("category")
        .eq("is_verified", true);

      if (error) return;

      const uniqueCategories = Array.from(new Set(data.map((p) => p.category))).filter(Boolean);
      setServices(uniqueCategories as string[]);
    };

    fetchCategories();
  }, []);

  const handleSelect = async (category: string) => {
    setSelectedService(category);
    setLoading(true);
    const { data, error } = await supabase
      .from("professionals")
      .select("full_name, email, phone, avatar_url, description")
      .eq("category", category)
      .eq("is_verified", true);

    setProfessionals(data || []);
    setLoading(false);
  };

  return (
    <main className={styles.directory}>
      <h1>📁 Directorio de Profesionales por Servicio</h1>

      <select
        value={selectedService}
        onChange={(e) => handleSelect(e.target.value)}
        className={styles.dropdown}
      >
        <option value="">Seleccioná una categoría</option>
        {services.map((s, i) => (
          <option key={i} value={s}>
            {s}
          </option>
        ))}
      </select>

      {loading && <p>Cargando profesionales...</p>}

      {!loading && selectedService && professionals.length === 0 && (
        <p>No se encontraron profesionales verificados.</p>
      )}

      <div className={styles.proGrid}>
        {professionals.map((pro, idx) => (
          <div key={idx} className={styles.proCard}>
            <img
              src={pro.avatar_url || "/default-user.png"}
              alt={pro.full_name}
              className={styles.avatar}
            />
            <h3>{pro.full_name}</h3>
            <p>{pro.description || "Sin descripción"}</p>
            <p>Email: {pro.email}</p>
            <p>Tel: {pro.phone}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
