import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@packages/utils/sendNotification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, requestId } = await req.json();

    // Cargar solicitud
    const { data: request, error } = await supabase
      .from("requests")
      .select("*, user_email")
      .eq("id", requestId)
      .maybeSingle();

    if (error || !request) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    // Verificar si ya desbloqueó
    const { data: existing, error: checkError } = await supabase
      .from("paid_professionals")
      .select("id")
      .eq("solicitud_id", requestId)
      .eq("profesional_id", userId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existing) {
      return NextResponse.json({ success: true, alreadyUnlocked: true });
    }

    // Desbloquear solicitud
    const { error: insertError } = await supabase
      .from("paid_professionals")
      .insert({
        solicitud_id: requestId,
        profesional_id: userId,
        unlocked_at: new Date().toISOString(),
      });

    if (insertError) throw insertError;

    // 🔔 Enviar notificación al profesional
    await sendNotification({
      title: "Solicitud desbloqueada con éxito",
      message: `Has desbloqueado la solicitud para ${request.job_description} en ${request.location}.`,
      url: `https:localhost:3000/solicitudes/${requestId}`,
      externalUserIds: [userId]
    });

    console.log(`📣 Notificación enviada a: ${userId}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error en desbloqueo:", err.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
