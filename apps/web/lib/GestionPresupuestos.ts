import { supabase } from "@/lib/supabase-web";
import { sendNotification } from "./sendNotification";

interface PresupuestoRequest {
  id: string;
  servicio: string;
  ubicacion: string;
  email: string;
  telefono: string;
}

export async function notificarProfesionales(presupuesto: PresupuestoRequest) {
  const { servicio, ubicacion } = presupuesto;

  // 🔍 Buscar profesionales verificados que coincidan con el servicio y ubicación
  const { data: profesionales, error } = await supabase
    .from("professionals")
    .select("id, external_user_id")
    .eq("category", servicio)
    .eq("location", ubicacion)
    .eq("is_verified", true);

  if (error) {
    console.error("❌ Error al buscar profesionales:", error.message);
    return;
  }

  const userIds = (profesionales || [])
    .map((p) => p.external_user_id)
    .filter((id) => !!id);

  if (userIds.length === 0) {
    console.log("ℹ️ No hay profesionales verificados para notificar");
    return;
  }

  // 🔔 Enviar notificación
  await sendNotification({
    title: "📩 Nueva solicitud de presupuesto en tu zona",
    message: `Un nuevo presupuesto está disponible en ${ubicacion}.`,
    externalUserIds: userIds,
  });

  console.log(`✅ Notificación enviada a ${userIds.length} profesionales`);

  // 🚀 Crear registros de visualización con datos ocultos
  const visualizaciones = profesionales.map((pro) => ({
    presupuesto_id: presupuesto.id,
    profesional_id: pro.id,
    visto: false,
    habilitado: false,
  }));

  const { error: insertError } = await supabase
    .from("visualizaciones")
    .insert(visualizaciones);

  if (insertError) {
    console.error("❌ Error al crear visualizaciones:", insertError.message);
  } else {
    console.log("✅ Visualizaciones creadas correctamente");
  }
}

export async function desbloquearDatos(profesionalId: string, presupuestoId: string) {
  // ⚡ Actualizar la visualización para habilitar los datos
  const { data, error } = await supabase
    .from("visualizaciones")
    .select("*")
    .eq("presupuesto_id", presupuestoId)
    .eq("habilitado", true);

  if (data.length >= 4) {
    console.log("⚠️ Ya hay 4 profesionales con datos habilitados");
    return;
  }

  const { error: updateError } = await supabase
    .from("visualizaciones")
    .update({ habilitado: true })
    .eq("presupuesto_id", presupuestoId)
    .eq("profesional_id", profesionalId);

  if (updateError) {
    console.error("❌ Error al habilitar datos:", updateError.message);
  } else {
    console.log("✅ Datos habilitados para el profesional");
  }
}
