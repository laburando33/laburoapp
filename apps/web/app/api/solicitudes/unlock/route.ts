import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@/lib/sendNotification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    console.log("📌 Iniciando desbloqueo de contacto...");

    const { userId, solicitudId } = await req.json();
    console.log(`✅ UserId: ${userId}, SolicitudId: ${solicitudId}`);

    // 🔍 Validación: solicitudId debe ser un UUID
    if (!/^[0-9a-fA-F-]{36}$/.test(solicitudId)) {
      console.error("❌ ID de solicitud inválido, debe ser un UUID.");
      return NextResponse.json({ error: "ID de solicitud inválido." }, { status: 400 });
    }

    // ✅ 1️⃣ Verificar si ya está desbloqueado
    const { data: existing, error: checkError } = await supabase
      .from("paid_professionals")
      .select("id")
      .eq("solicitud_id", solicitudId)
      .eq("profesional_id", userId)
      .maybeSingle();

    if (checkError) {
      console.error("❌ Error al verificar desbloqueo existente:", checkError.message);
      return NextResponse.json({ error: "Error verificando desbloqueo." }, { status: 500 });
    }

    if (existing) {
      console.log("⚠️ Ya estaba desbloqueado previamente.");
      return NextResponse.json({ success: true, alreadyUnlocked: true });
    }

    // ✅ 2️⃣ Verificar créditos
    const { data: credit, error: creditError } = await supabase
      .from("professional_credits")
      .select("credits")
      .eq("professional_id", userId)
      .maybeSingle();

    if (creditError) {
      console.error("❌ Error al verificar créditos:", creditError.message);
      return NextResponse.json({ error: "Error verificando créditos." }, { status: 500 });
    }

    if (!credit || credit.credits < 20) {
      console.log("⚠️ Créditos insuficientes.");
      return NextResponse.json({ error: "Créditos insuficientes" }, { status: 402 });
    }

    // ✅ 3️⃣ Descontar créditos y registrar desbloqueo
    await supabase
      .from("professional_credits")
      .update({ credits: credit.credits - 20 })
      .eq("professional_id", userId);

    await supabase
      .from("paid_professionals")
      .insert({
        solicitud_id: solicitudId,
        profesional_id: userId,
        unlocked_at: new Date().toISOString()
      });

    await sendNotification({
      title: "🔓 Solicitud Desbloqueada",
      message: `Has desbloqueado los datos para la solicitud ${solicitudId}.`,
      url: `https://localhost:3000/solicitudes/${solicitudId}`,
      externalUserIds: [userId]
    });

    console.log("✅ Desbloqueo realizado correctamente.");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error en desbloqueo (Exception):", err.message);
    return NextResponse.json({ error: "Error interno en el desbloqueo" }, { status: 500 });
  }
}
