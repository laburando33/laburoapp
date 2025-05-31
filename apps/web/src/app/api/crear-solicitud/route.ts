import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@utils/sendNotification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { nombre, comentario, servicio, location } = await req.json();

    // Validación
    if (!nombre || !comentario || !servicio || !location) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Crear solicitud
    const { data: solicitud, error: errorSolicitud } = await supabase
      .from("requests")
      .insert({
        user_email: "anonimo@laburando.com",
        job_description: comentario,
        category: servicio,
        location,
        status: "pendiente"
      })
      .select("id")
      .single();

    if (errorSolicitud) throw errorSolicitud;

    // Buscar profesionales
    const { data: profesionales } = await supabase
      .from("professionals")
      .select("user_id, full_name, phone, location, category, is_verified, onesignal_id")
      .eq("location", location)
      .eq("category", servicio)
      .eq("is_verified", true);

    const externalUserIds = [];

    for (const prof of profesionales) {
      if (prof.onesignal_id) externalUserIds.push(prof.onesignal_id);

      // Guardar en notificacion_logs
      await supabase.from("notificacion_logs").insert({
        solicitud_id: solicitud.id,
        servicio,
        ubicacion: location,
        enviados: 1
      });

      // (Opcional) Guardar relación para dashboard del profesional
      await supabase.from("paid_professionals").insert({
        solicitud_id: solicitud.id,
        profesional_id: prof.user_id
      });
    }

    // Notificar profesionales
    if (externalUserIds.length > 0) {
      await sendNotification({
        title: "🔔 Nueva solicitud disponible",
        message: `"${comentario}" en ${location}`,
        url: `https://laburando.com/professional/solicitudes/${solicitud.id}`,
        externalUserIds
      });
    } else {
      // Si no hay coincidencias → notificar al administrador
      const { data: admin } = await supabase
        .from("profiles")
        .select("onesignal_id")
        .eq("role", "admin")
        .maybeSingle();

      if (admin?.onesignal_id) {
        await sendNotification({
          title: "⚠️ Solicitud sin coincidencias",
          message: `"${comentario}" en ${location}`,
          url: `https://laburando.com/admin/solicitudes/${solicitud.id}`,
          externalUserIds: [admin.onesignal_id]
        });
      }
    }

    return NextResponse.json({ message: "Solicitud creada correctamente", solicitudId: solicitud.id });
  } catch (error: any) {
    console.error("❌ Error en creación de solicitud:", error.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
