"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "./explore.module.css";

export default function ExploreProfessionals() {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("professionals")
        .select("category")
        .not("category", "is", null);

      if (data) {
        const unique = [...new Set(data.map((d) => d.category))];
        setCategories(unique);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("professionals")
      .select("full_name, email, phone, avatar_url")
      .eq("category", category)
      .eq("is_verified", true);

    setResults(data || []);
    setLoading(false);
  };

  return (
    <div className={styles.exploreContainer}>
      <h1 className={styles.title}>🔍 Buscar Profesionales por Servicio</h1>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={styles.select}
      >
        <option value="">Seleccioná un servicio</option>
        {categories.map((cat, i) => (
          <option key={i} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <button onClick={handleSearch} className={styles.button}>
        Buscar
      </button>

      {loading && <p>Cargando profesionales...</p>}

      <div className={styles.resultsGrid}>
        {results.map((pro, i) => (
          <div key={i} className={styles.card}>
            <img
              src={pro.avatar_url || "/default-user.png"}
              alt={pro.full_name}
              className={styles.avatar}
            />
            <h3>{pro.full_name}</h3>
            <p>{pro.email}</p>
            <p>{pro.phone}</p>
          </div>
        ))}
        {!loading && results.length === 0 && category && <p>No se encontraron profesionales.</p>}
      </div>
    </div>
  );
}
