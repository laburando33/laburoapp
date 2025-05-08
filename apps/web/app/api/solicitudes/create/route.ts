// app/api/solicitudes/create/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const { email, description, category, location } = body;

  const { data: newRequest, error } = await supabase
    .from("requests")
    .insert({
      user_email: email,
      job_description: description,
      category,
      location,
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Error al crear solicitud:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // 🚀 Buscar profesionales que ofrecen este servicio
  const { data: pros } = await supabase
    .from("professional_services")
    .select("professional_id")
    .eq("service_id", category); // Asegurate que category sea el ID, no el nombre

  const professionalIds = pros?.map((p) => p.professional_id) || [];

  // ✅ Cargar emails (o teléfonos) de los profesionales
  const { data: professionals } = await supabase
    .from("professionals")
    .select("email, full_name")
    .in("user_id", professionalIds);

  for (const pro of professionals || []) {
    console.log(`📧 Enviando notificación a ${pro.email}`);
    // Acá podés integrar SendGrid, OneSignal, Twilio o WhatsApp API
  }

  return NextResponse.json({ success: true });
}
