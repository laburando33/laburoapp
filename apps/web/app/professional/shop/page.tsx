"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from './shop.module.css';

interface CreditPlan {
  id: number;
  plan_name: string;
  credits: number;
  price: number;
}

export default function Shop() {
  const [plans, setPlans] = useState<CreditPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("credit_plans")
        .select("*");

      if (error) {
        console.error("❌ Error al cargar los planes de crédito:", error.message);
      } else {
        setPlans(data);
      }
      setLoading(false);
    };

    fetchPlans();
  }, []);

  const handlePurchase = async (plan: CreditPlan) => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error("❌ Usuario no autenticado");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("credit_purchases").insert({
      user_id: userData.user.id,
      plan_name: plan.plan_name,
      credits: plan.credits,
      price: plan.price,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("❌ Error al realizar la compra:", error.message);
    } else {
      alert("✅ Compra realizada exitosamente. Los créditos se añadirán en breve.");
    }

    setLoading(false);
  };

  return (
    <div className={styles.shopContainer}>
      <h2 className={styles.title}>Compra de Créditos</h2>
      {loading && <p>Cargando planes...</p>}
      {!loading && plans.length > 0 ? (
        plans.map((plan) => (
          <div key={plan.id} className={styles.planCard}>
            <h3>{plan.plan_name}</h3>
            <p>{plan.credits} Créditos</p>
            <p>${plan.price}</p>
            <button 
              onClick={() => handlePurchase(plan)} 
              className={styles.purchaseButton}
              disabled={loading}
            >
              Comprar
            </button>
          </div>
        ))
      ) : (
        <p>No hay planes disponibles</p>
      )}
    </div>
  );
}
