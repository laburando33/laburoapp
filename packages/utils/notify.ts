import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@packages/utils/sendNotification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
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
      .eq("service_id", request.category);

    if (!professionals || professionals.length === 0) {
      return NextResponse.json({ error: "No hay profesionales en esa categoría" });
    }

    // Obtener los IDs de los profesionales
    const professionalIds = professionals.map((p) => p.professional_id);

    // Obtener los externalUserIds para OneSignal
    const { data: profiles } = await supabase
      .from("professionals")
      .select("external_user_id")
      .in("user_id", professionalIds);

    const externalUserIds = profiles.map((p) => p.external_user_id).filter(Boolean);

    if (externalUserIds.length > 0) {
      await sendNotification({
        title: "Nueva solicitud disponible",
        message: `Un cliente solicita: ${request.job_description} en ${request.location}`,
        url: "https://laburando.com/solicitudes",
        externalUserIds
      });
    }

    console.log(`📣 Notificar a profesionales: ${externalUserIds.join(", ")}`);

    return NextResponse.json({ success: true, notified: externalUserIds });
  } catch (err: any) {
    console.error("❌ Error en el envío de notificaciones:", err.message);
    return NextResponse.json({ error: "Error al enviar notificaciones" }, { status: 500 });
  }
}
