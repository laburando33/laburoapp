import { supabase } from "./supabase-web";
import { User } from "@supabase/supabase-js";

export async function createProfessionalProfile(user: User) {
  if (!user || !user.id) {
    console.error("⚠️ Usuario inválido o no autenticado");
    return;
  }

  console.log("👤 Usuario autenticado:", user.id);
  const userId = user.id;

  try {
    // Verifica si ya existe el profesional
    const { data: existing, error: selectError } = await supabase
      .from("professionals")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("🔍 Error buscando profesional:", selectError.message);
      return;
    }

    if (existing) {
      console.log("✅ Profesional ya registrado:", existing.user_id);
      return;
    }

    // Inserta el profesional si no existe
    const { error: insertError } = await supabase.from("professionals").insert([
      {
        user_id: userId,
        full_name: user.user_metadata?.full_name ?? "Sin nombre",
        email: user.email ?? "",
        phone: user.user_metadata?.phone ?? "",
        location: user.user_metadata?.location ?? "",
        category: user.user_metadata?.category ?? "",
        role: user.user_metadata?.role ?? "profesional",
        is_verified: false,
        verificacion_status: "pendiente",
      },
    ]);

    if (insertError) {
      console.error("❌ Error al insertar profesional:", insertError.message);
      return;
    }

    console.log("✅ Profesional insertado correctamente.");
  } catch (err) {
    console.error("💥 Error inesperado en createProfessionalProfile:", err);
  }
}
