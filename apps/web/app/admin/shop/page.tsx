"use client";

import styles from "./shop.module.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import { useRouter } from "next/navigation";

const plans = [
  { id: 1, name: "Plan Básico", price: 35000, credits: 150, clients: "6 a 8" },
  { id: 2, name: "Plan Intermedio", price: 50000, credits: 300, clients: "9 a 12", recommended: true },
  { id: 3, name: "Plan Avanzado", price: 80000, credits: 500, clients: "16 a 25" },
];

function formatCurrency(value: number): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

export default function ShopPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [useMock, setUseMock] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      setUseMock(process.env.NEXT_PUBLIC_USE_MOCK_PAYMENTS === "true");
    };
    init();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      const credits = Number(params.get("credits") || 0);
      if (credits > 0 && userId) {
        fetch("/api/credits/add", {
          method: "POST",
          body: JSON.stringify({ userId, credits }),
        }).then(() => {
          alert(`✅ Se te agregaron ${credits} créditos.`);
          router.replace("/admin/shop");
        });
      }
    }
  }, [userId, router]);

  const handleValidateCoupon = async () => {
    if (!coupon) return;

    const { data, error } = await supabase
      .from("discount_coupons")
      .select("*")
      .eq("code", coupon)
      .eq("is_active", true)
      .maybeSingle();

    if (
      error || !data ||
      (data.expires_at && new Date(data.expires_at) < new Date()) ||
      (data.max_uses && data.used_count >= data.max_uses)
    ) {
      alert("❌ Cupón inválido, vencido o agotado.");
      setDiscount(0);
      return;
    }

    setDiscount(data.discount_percentage);
    alert(`✅ Cupón aplicado: ${data.discount_percentage}% de descuento`);
  };

  const handleBuy = async (plan: any) => {
    if (!userId) return alert("No se detectó sesión");

    const finalPrice = discount > 0
      ? Math.round(plan.price * (1 - discount / 100))
      : plan.price;

    if (useMock) {
      const confirm = window.confirm(`¿Simular la compra de ${plan.credits} créditos por ${formatCurrency(finalPrice)}?`);
      if (!confirm) return;

      await fetch("/api/credits/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, credits: plan.credits, price: finalPrice, plan_name: plan.name, coupon }),
      });

      const { data: prof } = await supabase
        .from("professionals")
        .select("full_name, email, phone, category")
        .eq("user_id", userId)
        .maybeSingle();

      await supabase.from("credit_purchases").insert({
        user_id: userId,
        credits: plan.credits,
        amount: finalPrice,
        plan_name: plan.name,
        coupon,
        nombre: prof?.full_name || "—",
        email: prof?.email || "—",
        telefono: prof?.phone || "—",
        servicio: prof?.category || "—",
      });

      alert(`✅ Créditos simulados agregados: ${plan.credits}`);
      router.refresh();
    } else {
      const res = await fetch("/api/payments/create-preference", {
        method: "POST",
        body: JSON.stringify({ title: plan.name, price: finalPrice, credits: plan.credits, userId, coupon }),
      });

      const { init_point } = await res.json();
      window.location.href = init_point;
    }
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🛒 Comprar créditos</h1>
      <p className={styles.subtitle}>Elegí un plan para acceder a más consultas</p>

      <div className={styles.couponContainer}>
        <input
          type="text"
          placeholder="Código de descuento"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
          className={styles.couponInput}
        />
        <button onClick={handleValidateCoupon} className={styles.couponBtn}>
          Aplicar
        </button>
      </div>

      {discount > 0 && (
        <p className={styles.discountMsg}>
          ✅ Cupón aplicado: {discount}% de descuento
        </p>
      )}

      <div className={styles.plans}>
        {plans.map((plan) => {
          const discountedPrice = discount > 0
            ? Math.round(plan.price * (1 - discount / 100))
            : plan.price;

          return (
            <div key={plan.id} className={`${styles.card} ${plan.recommended ? styles.recommended : ""}`}>
              <h2>{plan.name}</h2>
              <p className={styles.price}>
                {discount > 0 && (
                  <span style={{ textDecoration: "line-through", marginRight: 8 }}>
                    {formatCurrency(plan.price)}
                  </span>
                )}
                {formatCurrency(discountedPrice)}
              </p>
              <p>{plan.credits} créditos</p>
              <p>{plan.clients} posibles clientes</p>
              <button onClick={() => handleBuy(plan)} className={styles.buyBtn}>
                Comprar
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
