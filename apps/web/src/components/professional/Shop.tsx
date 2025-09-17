"use client";
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import { useRouter } from "next/navigation";
import styles from "./shop.module.css";

interface CreditPlan { id: number; plan_name: string; credits: number; price: number; }

const IS_SANDBOX = process.env.NEXT_PUBLIC_MP_SANDBOX === "true";
const MP_PUB_KEY = process.env.NEXT_PUBLIC_MP_PUB_KEY!;  // prod: pk_test_xxx

export default function Shop({ userId }: { userId: string }) {
  const [plans, setPlans] = useState<CreditPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* 1 ▸ Traer planes */
  useEffect(() => {
    supabase
      .from("credit_plans")
      .select("*")
      .order("credits")
      .then(({ data }) => {
        setPlans(data ?? []);
        setLoading(false);
      });
  }, []);

  /* 2 ▸ Checkout */
  const handleMPCheckout = async (plan: CreditPlan) => {
    try {
      const res = await fetch("/api/payments/createPreference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:   plan.plan_name,
          credits: plan.credits,
          price:   plan.price,
          userId
          // TODO: agregar metadata
        })
      });

      const { preferenceId, initPoint, error } = await res.json();
      if (error) throw new Error(error);

      /* Sandbox local: simula la compra */
      if (IS_SANDBOX) {
        alert(`✅ Sandbox: añadidos ${plan.credits} créditos`);
        router.refresh();
        return;
      }

      /* SDK cargada? */
      const MP = (window as any).MercadoPago;
      if (!MP) {
        alert("No se pudo cargar el checkout de Mercado Pago.");
        return;
      }

      /* 3 ▸ Wallet Brick */
      const mp = MP(MP_PUB_KEY, { locale: "es-AR" });

      mp.bricks().create("wallet", "wallet_container", {
        initialization: { preferenceId },
        callbacks: {
          onReady: () => console.log("Wallet ready"),
          onError: (err: any) => alert("Error MP: " + err.message),
          onSubmit: () => setTimeout(() => router.refresh(), 2000)
        }
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  /* 4 ▸ Render */
  if (loading)      return <p className={styles.msg}>Cargando…</p>;
  if (!plans.length) return <p className={styles.msg}>No hay planes disponibles.</p>;

  return (
    <div className={styles.shopContainer}>
      <h2 className={styles.title}>Compra de Créditos</h2>

      {/* aquí MP incrusta el wallet */}
      <div id="wallet_container" style={{ marginBottom: "1rem" }} />

      {plans.map((p) => (
        <div key={p.id} className={styles.planCard}>
          <h3>{p.plan_name}</h3>
          <p>🪙 {p.credits}</p>
          <p>💵 ${p.price}</p>
          <button
            onClick={() => handleMPCheckout(p)}
            className={styles.purchaseButton}
          >
            Comprar
          </button>
        </div>
      ))}
    </div>
  );
}
