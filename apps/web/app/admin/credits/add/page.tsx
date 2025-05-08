"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase-web";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

export default function AddCreditsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [usuarios, setUsuarios] = useState<{ user_id: string; full_name: string; email: string }[]>([]);
  const [credits, setCredits] = useState(0);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: me } = await supabase
        .from("professionals")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (me?.role !== "admin") return router.push("/unauthorized");

      const { data, error } = await supabase
        .from("professionals")
        .select("user_id, full_name, email")
        .order("full_name");

      if (error) {
        console.error("❌ Error cargando usuarios:", error.message);
        return;
      }

      setUsuarios(data || []);
      setLoading(false);
    };

    fetchUsers();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/credits/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        credits,
        price: amount,
        plan_name: "Carga manual desde admin",
        coupon: null,
      }),
    });

    const result = await res.json();

    if (!result.success) {
      setMessage(`❌ ${result.error}`);
    } else {
      setMessage("✅ Créditos asignados con éxito.");
      setUserId("");
      setCredits(0);
      setAmount(0);
    }
  };

  if (loading) return <p className={styles.loading}>Cargando usuarios...</p>;

  return (
    <main className={styles.profileContainer}>
      <h1 className={styles.title}>➕ Cargar Créditos Manualmente</h1>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <label className={styles.label}>Seleccioná un profesional:</label>
        <select
          className={styles.inputField}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        >
          <option value="">-- Seleccionar --</option>
          {usuarios.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.full_name} ({u.email})
            </option>
          ))}
        </select>

        <label className={styles.label}>Cantidad de créditos:</label>
        <input
          type="number"
          className={styles.inputField}
          value={credits}
          min={1}
          onChange={(e) => setCredits(Number(e.target.value))}
          required
        />

        <label className={styles.label}>Monto en ARS:</label>
        <input
          type="number"
          className={styles.inputField}
          value={amount}
          min={0}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <button type="submit" className={styles.loginButton}>Guardar</button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </main>
  );
}
