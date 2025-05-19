import { supabase } from "@/lib/supabase-web";

export async function createProfessionalProfile(user: any) {
  try {
    console.log("👤 Usuario autenticado:", user?.id);

    if (!user?.id) {
      console.error("❌ Usuario no autenticado o sin ID válido.");
      return;
    }

    // 🔍 1️⃣ Revisar si el profesional ya está registrado
    const { data, error } = await supabase
      .from("professionals")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("❌ Error al consultar la tabla professionals:", error.message);
      return;
    }

    if (data) {
      console.log("✅ Profesional ya existe en la base de datos:", user.id);
      return;
    }

    // ✏️ 2️⃣ Si no existe, creamos el perfil en Supabase
    const metadata = user.user_metadata || {};
    const { error: insertError } = await supabase.from("professionals").insert({
      user_id: user.id,
      email: user.email,
      full_name: metadata.name || "",
      phone: metadata.phone || "",
      category: metadata.category || "",
      is_verified: false, // Asumo que no está verificado al momento de registrarse
    });

    if (insertError) {
      console.error("❌ Error al crear el perfil del profesional:", insertError.message);
    } else {
      console.log("🎉 Profesional creado exitosamente:", user.id);
    }

  } catch (err) {
    console.error("❌ Error inesperado:", err.message);
  }
}
