import { supabase } from "./supabase-web"
import { sendNotification } from "./sendNotification"

interface PresupuestoRequest {
  id: string
  servicio: string
  ubicacion: string
}

export async function notifyProfessionals(presupuesto: PresupuestoRequest) {
  const { servicio, ubicacion } = presupuesto

  // Buscar profesionales verificados que coincidan con el servicio y zona
  const { data: profesionales, error } = await supabase
    .from("profiles")
    .select("id, external_user_id")
    .eq("tipo_servicio", servicio)
    .eq("zona_trabajo", ubicacion)
    .eq("estado", "verificado")

  if (error) {
    console.error("❌ Error al buscar profesionales:", error.message)
    return
  }

  const userIds = (profesionales || [])
    .map((p) => p.external_user_id)
    .filter((id) => !!id)

  if (userIds.length === 0) {
    console.log("ℹ️ No hay profesionales verificados con external_user_id para notificar")
    return
  }

  await sendNotification({
    title: "📩 Nueva solicitud en tu zona",
    message: `Hay un pedido de presupuesto para ${servicio} en ${ubicacion}.`,
    externalUserIds: userIds,
  })

  console.log(`✅ Notificación enviada a ${userIds.length} profesionales`)
}
