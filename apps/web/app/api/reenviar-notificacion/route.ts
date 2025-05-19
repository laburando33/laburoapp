import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@/package/utils/sendNotification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { solicitudId, servicio, ubicacion } = await req.json();

    if (!solicitudId || !servicio || !ubicacion) {
      console.error("❌ Faltan datos en la solicitud");
      return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 });
    }

    // ✅ 1️⃣ Buscar el ID del servicio
    const { data: serviceData, error: serviceError } = await supabase
      .from("services")
      .select("id")
      .eq("name", servicio)
      .maybeSingle();

    if (serviceError || !serviceData) {
      console.error("❌ Error al buscar el servicio:", serviceError?.message);
      return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
    }

    const serviceId = serviceData.id;

    // ✅ 2️⃣ Buscar profesionales asociados al servicio y ubicación
    const { data: professionals, error: professionalsError } = await supabase
      .from("professional_services")
      .select("professional_id")
      .eq("service_id", serviceId);

    if (professionalsError) {
      console.error("❌ Error al buscar profesionales:", professionalsError.message);
      return NextResponse.json({ error: "Error al buscar profesionales." }, { status: 500 });
    }

    if (professionals.length === 0) {
      console.log("ℹ️ No se encontraron profesionales para esa categoría.");
      return NextResponse.json({ message: "No se encontraron profesionales." });
    }

    const professionalIds = professionals.map((p) => p.professional_id);

    // ✅ 3️⃣ Buscar perfiles que coincidan en ubicación
    const { data: profiles, error: profilesError } = await supabase
      .from("professionals")
      .select("external_user_id")
      .in("user_id", professionalIds)
      .eq("location", ubicacion);

    if (profilesError) {
      console.error("❌ Error al buscar perfiles:", profilesError.message);
      return NextResponse.json({ error: "Error buscando perfiles." }, { status: 500 });
    }

    const externalUserIds = profiles.map((p) => p.external_user_id).filter(Boolean);

    // ✅ 4️⃣ Enviar notificación a los profesionales correspondientes
    if (externalUserIds.length > 0) {
      await sendNotification({
        title: "🔄 Nueva solicitud en tu área",
        message: `Nueva solicitud en ${ubicacion} para ${servicio}.`,
        url: `https://localhost:3000/solicitudes/${solicitudId}`,
        externalUserIds,
      });

      console.log(`📣 Notificación enviada a: ${externalUserIds.join(", ")}`);
      return NextResponse.json({ success: true, notified: externalUserIds });
    } else {
      console.log("ℹ️ No se encontraron profesionales para notificar.");
      return NextResponse.json({ message: "No se encontraron profesionales para notificar." });
    }
  } catch (err: any) {
    console.error("❌ Error en el reenvío de notificación:", err.message);
    return NextResponse.json({ error: "Error interno en el reenvío" }, { status: 500 });
  }
}
// Este código maneja el desbloqueo de solicitudes y el reenvío de notificaciones a profesionales específicos en función de la categoría y ubicación de la solicitud.
// Se utiliza Supabase para interactuar con la base de datos y enviar notificaciones a través de OneSignal.