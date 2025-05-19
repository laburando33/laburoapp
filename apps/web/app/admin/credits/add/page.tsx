// app/admin/credits/add/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@lib/supabase-web";
import { useFetch } from "@/hooks/useFetch";
import styles from "@/styles/admin.module.css";

export default function AddCreditsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [credits, setCredits] = useState(0);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch de los usuarios con el hook reutilizable
  const { data: usuarios, loading: loadingUsuarios, error } = useFetch("professionals", {
    orderBy: "full_name",
    ascending: true,
  });

  // ✅ Verificación del rol al cargar
  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: me } = await supabase
        .from("professionals")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (me?.role !== "admin") return router.push("/unauthorized");
      setLoading(false);
    };

    verifyAdmin();
  }, [router]);

  // ✅ Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("🔄 Asignando créditos...");

    try {
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
        setMessage(`❌ Error: ${result.error}`);
      } else {
        setMessage("✅ Créditos asignados con éxito.");
        setUserId("");
        setCredits(0);
        setAmount(0);
      }
    } catch (error) {
      console.error("❌ Error al asignar créditos:", error);
      setMessage("❌ Error al asignar créditos.");
    }
  };

  if (loading || loadingUsuarios) return <p className={styles.loading}>🔄 Cargando...</p>;
  if (error) return <p className={styles.error}>❌ Error al cargar usuarios: {error}</p>;

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
          required
        />

        <button type="submit" className={styles.loginButton} disabled={!userId}>
          Guardar
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </main>
  );
}
