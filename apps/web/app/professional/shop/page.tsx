'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import { useRouter } from "next/navigation";

interface CreditPlan {
  id: string;
  plan_name: string;
  credits: number;
  price: number;
}

export default function ShopProfessionalPage() {
  const [plans, setPlans] = useState<CreditPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from("credit_purchases")
        .select("id, plan_name, credits, price");

      if (error) {
        console.error("Error cargando planes:", error.message);
      } else {
        setPlans(data || []);
      }
      setLoading(false);
    };

    fetchPlans();
  }, []);

  const handleRealPurchase = async (plan: CreditPlan) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user?.id) {
      alert("Debes iniciar sesión");
      return;
    }

    const userId = userData.user.id;

    // Primero, guardar en credit_purchases
    const { error: purchaseError } = await supabase
      .from("credit_purchases")
      .insert({
        user_id: userId,
        credits: plan.credits,
        price: plan.price,
        plan_name: plan.plan_name,
      });

    if (purchaseError) {
      console.error(purchaseError.message);
      alert("Error al registrar la compra");
      return;
    }

    // Luego, actualizar o crear en credits
    const { data: existingCredits } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingCredits) {
      // Si ya tiene créditos
      await supabase
        .from("credits")
        .update({
          total_credits: existingCredits.total_credits + plan.credits,
        })
        .eq("user_id", userId);
    } else {
      // Si no tiene, crear
      await supabase
        .from("credits")
        .insert({
          user_id: userId,
          total_credits: plan.credits,
          used_credits: 0,
        });
    }

    alert(`✅ Compraste ${plan.credits} créditos con éxito.`);

    router.refresh();
  };

  if (loading) return <p style={{ padding: "2rem" }}>Cargando...</p>;
  if (plans.length === 0) return <p style={{ padding: "2rem" }}>No hay planes disponibles.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🛒 Comprar Créditos</h1>

      <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              border: "1px solid #ddd",
              padding: "1.5rem",
              borderRadius: "8px",
              background: "#ffffff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <h3>{plan.plan_name}</h3>
            <p>🪙 {plan.credits} créditos</p>
            <p>💵 ${plan.price}</p>
            <button
              onClick={() => handleRealPurchase(plan)}
              style={{
                marginTop: "1rem",
                padding: "0.6rem 1rem",
                background: "#ffd700",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Comprar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
