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

    // ✅ Verificación de campos
    const camposObligatorios = { nombre, comentario, servicio, location };
    for (const [campo, valor] of Object.entries(camposObligatorios)) {
      if (!valor) {
        return NextResponse.json({ error: `Falta el campo obligatorio: ${campo}.` }, { status: 400 });
      }
    }

    // ✅ Guardar solicitud anónima
    let newRequest;
    try {
      const { data, error } = await supabase
        .from("requests")
        .insert({
          user_email: "anonimo@laburando.com",
          job_description: comentario,
          category: servicio,
          location,
          status: "pendiente",
        })
        .select("id")
        .maybeSingle();

      if (error) throw error;
      newRequest = data;
    } catch (error) {
      console.error("❌ Error insertando solicitud:", error.message);
      return NextResponse.json({ error: "Error al guardar la solicitud." }, { status: 500 });
    }

    // ✅ Buscar profesionales coincidentes
    let profesionales = [];
    try {
      console.log(`🛠️ Buscando profesionales para categoría: ${servicio} en ${location}`);
      
      const { data, error } = await supabase
        .from("professionals")
        .select("full_name, onesignal_id, phone")
        .eq("category", servicio)
        .eq("location", location)
        .eq("is_verified", true);

      if (error) {
        console.error("❌ Error buscando profesionales en Supabase:", error.message);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("⚠️ No se encontraron profesionales para esa búsqueda.");
      }

      profesionales = data;
    } catch (error) {
      console.error("❌ Error buscando profesionales:", error.message);
      return NextResponse.json({ error: "Error buscando profesionales." }, { status: 500 });
    }

    const externalUserIds = profesionales.map((p) => p.onesignal_id).filter(Boolean);

    // ✅ Obtener el OneSignal ID del administrador
    let adminUserId = null;
    try {
      const { data: adminData, error: adminError } = await supabase
        .from("profiles")
        .select("onesignal_id")
        .eq("role", "admin")
        .maybeSingle();

      if (adminError || !adminData?.onesignal_id) {
        console.error("⚠️ No se encontró el Admin o no tiene OneSignal ID registrado");
      } else {
        adminUserId = adminData.onesignal_id;
      }
    } catch (err) {
      console.error("❌ Error obteniendo el OneSignal ID del administrador:", err.message);
    }

    // ✅ Enviar notificación híbrida a profesionales
    if (externalUserIds.length > 0) {
      await sendNotification({
        title: "🔔 Nuevo pedido disponible",
        message: `"${comentario}" en ${location}. Solicitado por un cliente.`,
        url: `https://laburando.com/solicitudes/${newRequest.id}`,
        externalUserIds
      });
      console.log(`📣 Notificación enviada a: ${externalUserIds.join(", ")}`);
    }

    // ✅ Notificación al administrador si no hay profesionales
    if (adminUserId) {
      await sendNotification({
        title: "🔔 Pedido sin coincidencias",
        message: `No se encontraron profesionales para "${servicio}" en "${location}".`,
        url: `https://laburando.com/admin/solicitudes/${newRequest.id}`,
        externalUserIds: [adminUserId]
      });
      console.log(`⚠️ Notificación enviada al administrador: ${adminUserId}`);
    }

    return NextResponse.json({ message: "Solicitud creada y notificada con éxito." });
  } catch (err) {
    console.error("❌ Error interno:", err.message);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}


// Este código maneja la creación de solicitudes anónimas en la plataforma Laburando.
// Primero verifica si todos los campos obligatorios están presentes.
// Luego guarda la solicitud anónima en la tabla correspondiente.
// Finalmente, busca profesionales coincidentes y envía una notificación híbrida. 