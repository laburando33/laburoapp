import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { user_email, job_description, category, location } = await req.json();

    // ✅ Insertar la solicitud en la base de datos
    const { data: solicitud, error: solicitudError } = await supabase
      .from("requests")
      .insert([{
        user_email,
        job_description,
        category,
        location
      }])
      .select()
      .maybeSingle();

    if (solicitudError) {
      console.error("❌ Error al crear la solicitud:", solicitudError.message);
      return NextResponse.json({ error: "Error creando solicitud." }, { status: 500 });
    }

    console.log(`✅ Solicitud creada correctamente con ID: ${solicitud.id}`);

    return NextResponse.json({ success: true, solicitud });
  } catch (err: any) {
    console.error("❌ Error al crear solicitud:", err.message);
    return NextResponse.json({ error: "Error interno al crear solicitud." }, { status: 500 });
  }
}
