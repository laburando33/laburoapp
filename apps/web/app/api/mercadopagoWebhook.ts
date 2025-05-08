import { supabase } from "@/lib/supabase-web";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { data } = req.body;

  // 🔎 Validación de la data  - https://tu-dominio.com/api/mercadopagoWebhook (configurar el webhook en MercadoPago con esta URL)

  if (!data || !data.preference_id) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    // 🚀 Buscar en la base de datos el presupuesto relacionado
    const { data: visualizacion, error } = await supabase
      .from("visualizaciones")
      .select("profesional_id, presupuesto_id")
      .eq("preference_id", data.preference_id)
      .single();

    if (error || !visualizacion) {
      console.error("❌ No se encontró la visualización relacionada:", error?.message);
      return res.status(404).json({ error: "Visualización no encontrada" });
    }

    // 🔓 Desbloquear los datos para el profesional
    const { error: updateError } = await supabase
      .from("visualizaciones")
      .update({ habilitado: true })
      .eq("presupuesto_id", visualizacion.presupuesto_id)
      .eq("profesional_id", visualizacion.profesional_id);

    if (updateError) {
      console.error("❌ Error al desbloquear datos:", updateError.message);
      return res.status(500).json({ error: "No se pudieron desbloquear los datos" });
    }

    console.log(`✅ Datos desbloqueados para el profesional ${visualizacion.profesional_id}`);
    return res.status(200).json({ message: "Datos desbloqueados correctamente" });

  } catch (error) {
    console.error("❌ Error en el webhook de MercadoPago:", error.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
