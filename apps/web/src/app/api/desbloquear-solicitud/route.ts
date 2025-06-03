import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@utils/sendNotification"; // Asegúrate de que la ruta sea correcta

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { solicitudId, profesionalId } = await req.json(); // Se espera profesionalId

    if (!solicitudId || !profesionalId) {
      return NextResponse.json({ error: "Faltan datos requeridos (solicitudId, profesionalId)" }, { status: 400 });
    }

    // ✅ Verificar si ya está desbloqueado por este profesional
    const { data: existing, error: checkError } = await supabase
      .from("paid_professionals")
      .select("id")
      .eq("solicitud_id", solicitudId)
      .eq("profesional_id", profesionalId) // ✅ CORRECCIÓN: Usar profesionalId aquí
      .maybeSingle();

    if (checkError) {
      console.error("❌ Error al verificar desbloqueo existente:", checkError.message);
      throw checkError;
    }
    if (existing) {
      return NextResponse.json({ success: true, alreadyUnlocked: true, message: "La solicitud ya fue desbloqueada por este profesional." });
    }

    // ✅ Verificar créditos del profesional
    const { data: credit, error: creditError } = await supabase
      .from("professional_credits")
      .select("credits, external_user_id") // Asegúrate de que external_user_id esté en esta tabla o se pueda obtener
      .eq("user_id", profesionalId) // Usar profesionalId para buscar créditos
      .maybeSingle();

    if (creditError) {
      console.error("❌ Error al obtener créditos del profesional:", creditError.message);
      throw creditError;
    }

    if (!credit || credit.credits < 20) {
      return NextResponse.json({ error: "Créditos insuficientes" }, { status: 402 });
    }

    // ✅ Descontar 20 créditos (según tu código, antes era 1)
    const { error: updateCreditError } = await supabase
      .from("professional_credits")
      .update({ credits: credit.credits - 20 })
      .eq("user_id", profesionalId); // Usar profesionalId para actualizar créditos

    if (updateCreditError) {
      console.error("❌ Error al descontar créditos:", updateCreditError.message);
      throw updateCreditError;
    }

    // ✅ Registrar el desbloqueo
    const { error: insertUnlockError } = await supabase
      .from("paid_professionals")
      .insert({
        solicitud_id: solicitudId,
        profesional_id: profesionalId,
        unlocked_at: new Date().toISOString(),
      });

    if (insertUnlockError) {
      console.error("❌ Error al registrar el desbloqueo:", insertUnlockError.message);
      throw insertUnlockError;
    }

    // ✅ Enviar notificación al profesional (si tiene external_user_id)
    if (credit.external_user_id) {
      // Cargar la descripción de la solicitud para la notificación
      const { data: request, error: requestError } = await supabase
        .from("requests")
        .select("job_description, location")
        .eq("id", solicitudId)
        .maybeSingle();

      if (requestError) {
        console.warn("⚠️ No se pudo obtener la descripción de la solicitud para la notificación:", requestError.message);
      }

      await sendNotification({
        title: "🔓 Solicitud Desbloqueada",
        message: `Has desbloqueado la solicitud: "${request?.job_description || 'sin descripción'}" en ${request?.location || 'ubicación desconocida'}. ¡Revisa los detalles!`,
        url: `https://localhost:3000/professional/solicitudes/${solicitudId}`, // Ajusta la URL según tu app
        externalUserIds: [credit.external_user_id]
      });
    }

    return NextResponse.json({ success: true, message: "Solicitud desbloqueada y notificación enviada." });
  } catch (err: any) {
    console.error("❌ Error en la ruta de desbloqueo de solicitud:", err.message);
    return NextResponse.json({ error: `Error al desbloquear la solicitud: ${err.message}` }, { status: 500 });
  }
}