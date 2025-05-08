// /admin/actions/verificarProfesional.ts

import { supabase } from "@/lib/supabase-web";

/**
 * Verifica a un profesional cambiando su estado en la base de datos.
 * @param user_id - UUID del usuario profesional a verificar.
 */
export async function verificarProfesional(user_id: string): Promise<void> {
  if (!user_id) {
    throw new Error("El user_id es obligatorio para verificar al profesional.");
  }

  const { error } = await supabase
    .from("professionals")
    .update({
      verificacion_status: "verificado",
      is_verified: true,
    })
    .eq("user_id", user_id);

  if (error) {
    console.error("❌ Error al verificar profesional:", error.message);
    throw new Error(`No se pudo verificar el profesional: ${error.message}`);
  }

  console.log("✅ Profesional verificado correctamente:", user_id);
}
