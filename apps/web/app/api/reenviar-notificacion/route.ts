import { supabase } from "@/lib/supabase-web";
import { sendNotification } from "@/lib/sendNotification";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { solicitudId, servicio, ubicacion } = await req.json();

  if (!solicitudId || !servicio || !ubicacion) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  try {
    // Buscar profesionales con coincidencia por categoría y zona
    const { data: profesionales, error } = await supabase
      .from("professionals")
      .select("user_id, onesignal_id")
      .ilike("category", `%${servicio}%`)
      .ilike("location", `%${ubicacion}%`);

    if (error) throw error;

    if (!profesionales.length) {
      return NextResponse.json(
        { error: "No hay profesionales para esta zona/servicio" },
        { status: 404 }
      );
    }

    // Filtrar los que ya desbloquearon
    const { data: yaDesbloquearon } = await supabase
      .from("paid_professionals")
      .select("profesional_id")
      .eq("solicitud_id", solicitudId);

    const idsDesbloqueados = new Set(yaDesbloquearon?.map((d) => d.profesional_id));

    const destinatarios = profesionales.filter(
      (p) => p.onesignal_id && !idsDesbloqueados.has(p.user_id)
    );

    if (!destinatarios.length) {
      return NextResponse.json(
        { error: "Todos los profesionales ya fueron notificados o desbloquearon." },
        { status: 403 }
      );
    }

    // Enviar notificación a cada profesional
    for (const p of destinatarios) {
      await sendNotification({
        title: "Nueva solicitud en tu zona",
        message: `¡Un cliente necesita ${servicio} en ${ubicacion}!`,
        url: "https://laburando.app/dashboard",
      });
    }

    // Registrar en log
    await supabase.from("notificacion_logs").insert([
      {
        solicitud_id: solicitudId,
        servicio,
        ubicacion,
        enviados: destinatarios.length,
      },
    ]);

    return NextResponse.json({ success: true, count: destinatarios.length });
  } catch (err: any) {
    console.error("❌ Error en /api/reenviar-notificacion:", err.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
