import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@utils/sendNotification";
import { supabase } from "@lib/supabase-web";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // service_role ✅
);

export async function POST(req: Request) {
  try {
    const { userId, credits, price , plan_name, coupon = null } = await req.json();

    if (!userId || !credits) {
      return NextResponse.json({ success: false, error: "Faltan datos" }, { status: 400 });
    }

    /* ───── 1. acreditamos saldo e historial en una sola RPC ───── */
    const { error } = await supabase.rpc("add_credits", {
      p_professional_id: userId,
      p_credits: credits,
      p_plan_name: plan_name,
      p_price: price, // precio 0 porque es carga manual
      p_coupon: coupon || null, // puede ser null si no hay cupón
      p_provider: "Manual",
      p_status: "paid"
    });

    if (error) {
      console.error("❌ add_credits:", error.message);
      return NextResponse.json({ success: false, error: "Error al añadir créditos" }, { status: 500 });
    }

    /* ───── 2. datos para la notificación push ───── */
    const { data: prof } = await supabase
      .from("professionals")
      .select("full_name, email, external_user_id")
      .eq("user_id", userId)
      .single();

    if (prof?.external_user_id) {
      await sendNotification({
        title: "💳 Créditos añadidos",
        message: `Se han acreditado ${credits} créditos.`,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/professional/perfil`,
        externalUserIds: [prof.external_user_id]
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Fallo inesperado" }, { status: 500 });
  }
}