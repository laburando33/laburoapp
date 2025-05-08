import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // solo en backend
);

export async function POST(req: Request) {
  const { userId, credits, amount = 0, plan_name = "Sin Plan", coupon = null } = await req.json();

  if (!userId || !credits) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // ✅ Cálculo seguro del precio final
  const finalPrice = amount || credits * 1000; // podés ajustar el valor base por crédito

  // Sumar créditos (RPC)
  const { error: rpcError } = await supabase.rpc("add_credits", {
    uid: userId,
    creditos: credits,
  });

  if (rpcError) {
    console.error("❌ RPC Error:", rpcError);
    return NextResponse.json({ error: "Error al sumar créditos" }, { status: 500 });
  }

  // Obtener datos del profesional
  const { data: prof } = await supabase
    .from("professionals")
    .select("full_name, email, phone, category")
    .eq("user_id", userId)
    .maybeSingle();

  // Insertar en credit_purchases
  const { error: insertError } = await supabase.from("credit_purchases").insert({
    user_id: userId,
    credits,
    price: finalPrice,
    plan_name,
    coupon,
    nombre: prof?.full_name || "—",
    email: prof?.email || "—",
    telefono: prof?.phone || "—",
    servicio: prof?.category || "—",
  });

  if (insertError) {
    console.error("❌ Error insertando en credit_purchases:", insertError);
    return NextResponse.json({ error: "No se pudo registrar la compra" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
