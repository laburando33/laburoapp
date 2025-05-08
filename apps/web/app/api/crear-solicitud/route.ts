import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-web";
import { sendNotification } from "@/lib/sendNotification";

export async function POST(req: Request) {
  try {
    const { nombre, comentario, servicio, location } = await req.json();

    if (!nombre || !comentario || !servicio || !location) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    // 1. Guardar solicitud anónima
    const { error } = await supabase.from("requests").insert({
      user_email: "anonimo@laburando.com",
      job_description: comentario,
      category: servicio,
      location,
      status: "pendiente",
    });

    if (error) {
      console.error("Error insertando solicitud:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Buscar profesionales coincidentes
    const { data: profesionales } = await supabase
      .from("professionals")
      .select("full_name, onesignal_id, phone")
      .eq("category", servicio)
      .eq("location", location)
      .eq("is_verified", true);

    // 3. Enviar notificación push
    for (const prof of profesionales || []) {
      if (prof.onesignal_id) {
        await sendNotification({
          playerId: prof.onesignal_id,
          title: "Nuevo pedido disponible",
          message: `"${comentario}" en ${location}. Solicitado por un cliente.`,
        });
      }

      // opcional: enviar WhatsApp con tu lógica actual
    }

    return NextResponse.json({ message: "Solicitud creada y notificada con éxito." });
  } catch (err) {
    console.error("Error interno:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
