import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId, requestId } = await req.json();

  // Cargar solicitud
  const { data: request, error } = await supabase
    .from("requests")
    .select("paid_professionals, max_professionals")
    .eq("id", requestId)
    .maybeSingle();

  if (error || !request) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  const yaPago = request.paid_professionals?.includes(userId);
  const max = request.max_professionals || 4;

  if (yaPago) {
    return NextResponse.json({ success: true, message: "Ya desbloqueaste esta solicitud" });
  }

  if (request.paid_professionals.length >= max) {
    return NextResponse.json({ error: "Cupo agotado para esta solicitud" }, { status: 403 });
  }

  // Verificar créditos
  const { data: creditData } = await supabase
    .from("credits")
    .select("total_credits, used_credits")
    .eq("user_id", userId)
    .maybeSingle();

  const disponibles = (creditData?.total_credits || 0) - (creditData?.used_credits || 0);
  if (disponibles <= 0) {
    return NextResponse.json({ error: "Créditos insuficientes" }, { status: 403 });
  }

  // Actualizamos créditos y request
  const { error: credErr } = await supabase.rpc("add_used_credit", {
    uid: userId,
    cantidad: 1,
  });

  const { error: updateErr } = await supabase
    .from("requests")
    .update({
      paid_professionals: [...request.paid_professionals, userId],
    })
    .eq("id", requestId);

  if (credErr || updateErr) {
    return NextResponse.json({ error: "Error al procesar pago" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
