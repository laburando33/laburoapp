import { NextResponse } from "next/server";
// Ya no necesitamos crear el cliente aquí, lo importamos desde el archivo centralizado.
// import { createClient } from "@supabase/supabase-js"; 
import { sendNotification } from "@utils/sendNotification"; // Tu utilidad de notificación

// Importa la instancia de Supabase de servidor centralizada desde tu paquete utils
import { supabaseServer } from "@utils/supabase-server"; // Asegúrate de que la ruta sea correcta según tu configuración de alias

// Eliminamos esta línea ya que importaremos supabaseServer
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

export async function POST(req: Request) {
  try {
    const { requestId } = await req.json();

    // 1️⃣ Buscar solicitud
    // Ahora usamos supabaseServer en lugar de la instancia local 'supabase'
    const { data: request, error: requestError } = await supabaseServer // Utiliza supabaseServer
      .from("requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();

    if (requestError || !request) {
      console.error("❌ Error al buscar la solicitud:", requestError?.message);
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    // 2️⃣ Buscar profesionales asociados al servicio
    // Ahora usamos supabaseServer
    const { data: professionals, error: professionalsError } = await supabaseServer // Utiliza supabaseServer
      .from("professional_services")
      .select("professional_id")
      .eq("service_id", request.category);

    if (professionalsError || !professionals || professionals.length === 0) {
      console.log("ℹ️ No hay profesionales disponibles para esta categoría");
      return NextResponse.json({ message: "No se encontraron profesionales." });
    }

    // 3️⃣ Obtener los externalUserIds para OneSignal y Expo
    const professionalIds = professionals.map((p) => p.professional_id);

    // Ahora usamos supabaseServer
    const { data: profiles, error: profilesError } = await supabaseServer // Utiliza supabaseServer
      .from("professionals")
      .select("external_user_id")
      .in("user_id", professionalIds);

    if (profilesError || !profiles) {
      console.error("❌ Error al buscar perfiles:", profilesError.message);
      return NextResponse.json({ error: "Error buscando profesionales." }, { status: 500 });
    }

    const externalUserIds = profiles.map((p) => p.external_user_id).filter(Boolean);

    // 4️⃣ Enviar notificación híbrida
    if (externalUserIds.length > 0) {
      await sendNotification({
        title: "Nueva solicitud disponible",
        message: `Un cliente solicita: ${request.job_description} en ${request.location}`,
        url: `https://laburando.com/solicitudes/${requestId}`,
        externalUserIds
      });
    }

    console.log(`📣 Notificación enviada a: ${externalUserIds.join(", ")}`);

    return NextResponse.json({ success: true, notified: externalUserIds });
  } catch (err: any) {
    console.error("❌ Error interno en el envío de notificaciones:", err.message);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}