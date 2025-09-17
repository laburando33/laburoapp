"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "../shop/shop.module.css";

interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
}

export default function AdminCuponesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    code: "",
    discount: 0,
    maxUses: "",
    expires: "",
  });

  const fetchCoupons = async () => {
    const { data } = await supabase
      .from("discount_coupons")
      .select("*")
      .order("created_at", { ascending: false });

    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async () => {
    if (!form.code || form.discount <= 0) {
      alert("Código y descuento son requeridos");
      return;
    }

    const { error } = await supabase.from("discount_coupons").insert({
      code: form.code.toUpperCase(),
      discount_percentage: form.discount,
      max_uses: form.maxUses ? Number(form.maxUses) : null,
      expires_at: form.expires || null,
    });

    if (error) {
      alert("Error al crear cupón");
    } else {
      alert("✅ Cupón creado");
      setForm({ code: "", discount: 0, maxUses: "", expires: "" });
      fetchCoupons();
    }
  };

  const toggleEstado = async (id: string, estado: boolean) => {
    await supabase
      .from("discount_coupons")
      .update({ is_active: !estado })
      .eq("id", id);
    fetchCoupons();
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🎟 Gestión de Cupones</h1>

      <div style={{ marginBottom: "2rem" }}>
        <h2 className={styles.subtitle}>➕ Crear nuevo cupón</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 400 }}>
          <input
            type="text"
            placeholder="Código (ej: BIENVENIDO50)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <input
            type="number"
            placeholder="Descuento (%)"
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Máximo de usos (opcional)"
            value={form.maxUses}
            onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
          />
          <input
            type="date"
            placeholder="Fecha de expiración (opcional)"
            value={form.expires}
            onChange={(e) => setForm({ ...form, expires: e.target.value })}
          />
          <button className={styles.buyBtn} onClick={handleCreate}>Crear cupón</button>
        </div>
      </div>

      <h2 className={styles.subtitle}>📋 Lista de cupones</h2>

      {loading ? (
        <p>Cargando cupones...</p>
      ) : coupons.length === 0 ? (
        <p>No hay cupones creados.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descuento</th>
              <th>Usados</th>
              <th>Máx.</th>
              <th>Expira</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.discount_percentage}%</td>
                <td>{c.used_count}</td>
                <td>{c.max_uses ?? "∞"}</td>
                <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td>
                <td>{c.is_active ? "✅ Activo" : "⛔ Inactivo"}</td>
                <td>
                  <button
                    onClick={() => toggleEstado(c.id, c.is_active)}
                    style={{ padding: "0.3rem 0.6rem", cursor: "pointer" }}
                  >
                    {c.is_active ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
