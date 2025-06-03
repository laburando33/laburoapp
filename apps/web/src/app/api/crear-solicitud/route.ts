import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// import { sendNotification } from "@utils/sendNotification"; // Solo si necesitas enviar notificaciones desde esta API

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // ✅ CORRECCIÓN ESENCIAL: Asegúrate de recibir professional_id y request_id
    // Los otros campos (comentario, precio, fecha_estimada, estado) son del presupuesto.
    const { comentario, precio, fecha_estimada, estado, professional_id, request_id } = await req.json();

    // Validación de campos obligatorios para el presupuesto
    if (!comentario || !precio || !fecha_estimada || !estado || !professional_id || !request_id) {
      console.error("❌ Faltan campos obligatorios para el presupuesto:", { comentario, precio, fecha_estimada, estado, professional_id, request_id });
      return NextResponse.json({ error: "Faltan campos obligatorios para crear el presupuesto." }, { status: 400 });
    }

    // Insertar el presupuesto en la tabla 'presupuestos'
    const { data: presupuesto, error: insertError } = await supabase
      .from("presupuestos") // <<<<<<<<<<< ¡Esta es la tabla clave para el presupuesto!
      .insert([
        {
          comentario,
          precio,
          fecha_estimada,
          estado,
          professional_id, // ✅ Incluye el ID del profesional
          request_id,      // ✅ Incluye el ID de la solicitud
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("❌ Error al crear el presupuesto:", insertError.message);
      return NextResponse.json({ error: `Error creando presupuesto: ${insertError.message}` }, { status: 500 });
    }

    console.log(`✅ Presupuesto creado correctamente con ID: ${presupuesto.id} para solicitud ${request_id}`);

    // Si quieres, aquí podrías llamar a una función para notificar al cliente o al profesional
    // que el presupuesto fue creado. (Ej: await sendNotification(...);)

    return NextResponse.json({ success: true, presupuesto });
  } catch (err: any) {
    console.error("❌ Error interno al crear presupuesto en /api/crear-solicitud:", err.message);
    return NextResponse.json({ error: "Error interno al crear presupuesto." }, { status: 500 });
  }
}