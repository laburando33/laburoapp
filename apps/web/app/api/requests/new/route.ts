import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ONESIGNAL_API_URL = "https://onesignal.com/api/v1/notifications";

export async function POST(req: Request) {
  const body = await req.json();
  const { user_email, job_description, category, location } = body;

  // 1. Crear solicitud
  const { data: createdRequest, error: insertError } = await supabase
    .from("requests")
    .insert([{ user_email, job_description, category, location }])
    .select()
    .maybeSingle();

  if (insertError) {
    return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
  }

  // 2. Obtener profesionales que ofrecen ese servicio
  const { data: pros } = await supabase
    .from("professional_services")
    .select("professional_id")
    .eq("service_id", category);

  const professionalIds = pros?.map((p) => p.professional_id) || [];

  // 3. Obtener tokens OneSignal de esos profesionales
  const { data: tokens } = await supabase
    .from("professionals")
    .select("onesignal_id")
    .in("user_id", professionalIds)
    .neq("onesignal_id", null);

  const playerIds = tokens?.map((t) => t.onesignal_id).filter(Boolean);

  if (!playerIds || playerIds.length === 0) {
    return NextResponse.json({ success: true, info: "No se encontraron destinatarios." });
  }

  // 4. Enviar notificación push
  const payload = {
    app_id: process.env.ONESIGNAL_APP_ID,
    include_player_ids: playerIds,
    headings: { en: "¡Nueva solicitud disponible!" },
    contents: {
      en: `Un cliente solicita: ${job_description}`,
    },
    url: "https://tusitio.com/admin", // Puedes redirigir al panel profesional
  };

  const resp = await fetch(ONESIGNAL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.json();
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }

  return NextResponse.json({ success: true, request: createdRequest });
}
