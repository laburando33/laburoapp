import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@utils/sendNotification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // solo en backend
);

export async function POST(req: Request) {
  try {
    const { userId, credits, amount = 0, plan_name = "Sin Plan", coupon = null } = await req.json();

    if (!userId || !credits) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // ✅ Verificar si el usuario existe
    const { data: userData, error: userError } = await supabase
      .from("professionals")
      .select("full_name, email, phone, category, external_user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (userError || !userData) {
      return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 });
    }

    // ✅ Verificar si ya existe un registro en professional_credits
    const { data: creditData, error: creditError } = await supabase
      .from("professional_credits")
      .select("credits")
      .eq("professional_id", userId)
      .maybeSingle();

    if (creditError) {
      console.error("❌ Error verificando créditos:", creditError.message);
      return NextResponse.json({ error: "Error al verificar créditos" }, { status: 500 });
    }

    if (creditData) {
      // ✅ Actualizar créditos si ya existe
      const { error: updateError } = await supabase
        .from("professional_credits")
        .update({
          credits: creditData.credits + credits,
        })
        .eq("professional_id", userId);

      if (updateError) {
        console.error("❌ Error al actualizar créditos:", updateError.message);
        return NextResponse.json({ error: "Error al actualizar créditos" }, { status: 500 });
      }
    } else {
      // ✅ Crear el registro si no existe
      const { error: insertError } = await supabase
        .from("professional_credits")
        .insert({
          professional_id: userId,
          credits: credits,
        });

      if (insertError) {
        console.error("❌ Error al crear registro de créditos:", insertError.message);
        return NextResponse.json({ error: "Error al crear registro de créditos" }, { status: 500 });
      }
    }

    // ✅ Calcular el precio total
    const finalPrice = amount || credits * 1000;

    // ✅ Registrar en el historial de compras
    const { error: insertHistoryError } = await supabase.from("credit_purchases").insert({
      user_id: userId,
      credits,
      price: finalPrice,
      plan_name,
      coupon,
      nombre: userData.full_name || "—",
      email: userData.email || "—",
      telefono: userData.phone || "—",
      servicio: userData.category || "—",
    });

    if (insertHistoryError) {
      console.error("❌ Error insertando en credit_purchases:", insertHistoryError.message);
      return NextResponse.json({ error: "No se pudo registrar la compra" }, { status: 500 });
    }

    // ✅ Enviar notificación al usuario
    if (userData.external_user_id) {
      await sendNotification({
        title: "💳 Créditos Añadidos",
        message: `Se han añadido ${credits} créditos a tu cuenta. Plan: ${plan_name}`,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/professional/perfil`,
        externalUserIds: [userData.external_user_id]
      });
    }

    console.log(`✅ Créditos añadidos correctamente para ${userData.full_name}`);
    return NextResponse.json({ ok: true, message: "Créditos añadidos correctamente y notificación enviada." });

  } catch (err: any) {
    console.error("❌ Error en el proceso de recarga:", err.message);
    return NextResponse.json({ error: "Error en el proceso de recarga" }, { status: 500 });
  }
}
