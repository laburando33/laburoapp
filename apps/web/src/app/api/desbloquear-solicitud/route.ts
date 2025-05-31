import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@utils/sendNotification";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { solicitudId, profesionalId } = await req.json();

    if (!solicitudId || !profesionalId) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // ✅ Verificar si ya está desbloqueado
    const { data: existing } = await supabase
      .from("paid_professionals")
      .select("id")
      .eq("solicitud_id", solicitudId)
      .maybeSingle()
      .eq("user_id", userId);// Verificar si el profesional ya desbloqueó la solicitud
    if (existing) {
      return NextResponse.json({ success: true, alreadyUnlocked: true });
    }

    // ✅ Verificar créditos del profesional
    const { data: credit } = await supabase
      .from("professional_credits")
      .select("credits, external_user_id")
      .eq("user_id", userId)
      .maybeSingle();

      if (!credit || credit.credits < 20) {
      return NextResponse.json({ error: "Créditos insuficientes" }, { status: 402 });
    }

    // ✅ Descontar 1 crédito
    await supabase
      .from("professional_credits")
      .update({ credits: credit.credits - 20 })
      .eq("user_id", userId)

    // ✅ Registrar el desbloqueo
    await supabase.from("paid_professionals").insert({
      solicitud_id: solicitudId,
      profesional_id: profesionalId,
      unlocked_at: new Date().toISOString(),
    });

    // ✅ Enviar notificación al profesional
    if (credit.external_user_id) {
      await sendNotification({
        title: "🔓 Solicitud Desbloqueada",
        message: "Has desbloqueado una nueva solicitud. ¡Revisa los detalles!",
        url: `https://localhost:3000/solicitudes/${solicitudId}`,
        externalUserIds: [credit.external_user_id]
      });
    }

    return NextResponse.json({ success: true, message: "Solicitud desbloqueada y notificación enviada." });
  } catch (err: any) {
    console.error("❌ Error al desbloquear solicitud:", err.message);
    return NextResponse.json({ error: "Error al desbloquear la solicitud" }, { status: 500 });
  }
}

// Este código maneja el desbloqueo de solicitudes por parte de profesionales en la plataforma Laburando.
// Primero verifica si la solicitud ya fue desbloqueada por el profesional.
// Luego verifica si el profesional tiene créditos suficientes para desbloquear la solicitud.
// Desconta el crédito del profesional y guarda el desbloqueo en la tabla correspondiente.
// Finalmente, envía una notificación híbrida al profesional y al cliente.