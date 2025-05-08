import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { requestId } = await req.json();

  const { data: request } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (!request) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  // Buscar profesionales de esa categoría
  const { data: professionals } = await supabase
    .from("professional_services")
    .select("professional_id")
    .eq("service_id", request.category); // ⚠️ Ajusta si `category` es texto o id

  if (!professionals || professionals.length === 0) {
    return NextResponse.json({ error: "No hay profesionales en esa categoría" });
  }

  // Simulamos notificación
  const notifiedIds = professionals.map((p) => p.professional_id);
  console.log(`📣 Notificar a profesionales: ${notifiedIds.join(", ")}`);

  return NextResponse.json({ success: true, notified: notifiedIds });
}
