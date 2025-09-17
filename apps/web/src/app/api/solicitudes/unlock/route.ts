// app/api/solicitudes/unlock/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@utils/sendNotification";   // ajusta import si hace falta

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

    // 1️⃣ ¿Ya desbloqueó esta solicitud?
    const { data: existing, error: exErr } = await supabase
      .from("paid_professionals")
      .select("id")
      .eq("solicitud_id", solicitudId)
      .eq("profesional_id", profesionalId)
      .maybeSingle();

    if (exErr) throw exErr;
    if (existing) {
      return NextResponse.json({ success: true, alreadyUnlocked: true });
    }

    // 2️⃣ Obtener saldo del profesional
    const { data: credit, error: crErr } = await supabase
      .from("credits")                // ← tabla correcta
      .select("balance, external_user_id")
      .eq("user_id", profesionalId)   // ← columna correcta
      .maybeSingle();

    if (crErr) throw crErr;
    if (!credit || credit.balance < 20) {
      return NextResponse.json({ error: "Créditos insuficientes" }, { status: 402 });
    }

    // 3️⃣ Descontar 20 créditos en un solo paso
    const { error: updErr } = await supabase
      .from("credits")
      .update({ balance: credit.balance - 20 })
      .eq("user_id", profesionalId);

    if (updErr) throw updErr;

    // 4️⃣ Registrar el desbloqueo
    const { error: insErr } = await supabase
      .from("paid_professionals")
      .insert({
        solicitud_id: solicitudId,
        profesional_id: profesionalId,
        unlocked_at: new Date().toISOString(),
      });

    if (insErr) throw insErr;

    // 5️⃣ Notificar al profesional
    if (credit.external_user_id) {
      await sendNotification({
        title: "🔓 Solicitud Desbloqueada",
        message: "Has desbloqueado una nueva solicitud. ¡Revisa los detalles!",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/professional/solicitudes`,
        externalUserIds: [credit.external_user_id],
      });
    }

    return NextResponse.json({ success: true, message: "Desbloqueo exitoso" });
  } catch (err: any) {
    console.error("❌ Error al desbloquear solicitud:", err.message);
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 });
  }
}
