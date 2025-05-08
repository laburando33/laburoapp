import { supabase } from "@/lib/supabase-web";

export async function createProfessionalProfile(user: any) {
  console.log("👤 Usuario autenticado:", user?.id);

  if (!user?.id) return;

  // Revisa si ya existe el profesional
  const { data, error } = await supabase
    .from("professionals")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("❌ Error consultando profesionales:", error.message);
    return;
  }

  if (data) {
    console.log("✅ Profesional ya registrado:", user.id);
    return;
  }

  // Si no existe, lo crea
  const { error: insertError } = await supabase.from("professionals").insert({
    user_id: user.id,
    email: user.email,
    full_name: user.user_metadata?.name || "",
    phone: user.user_metadata?.phone || "",
    category: user.user_metadata?.category || "",
  });

  if (insertError) {
    console.error("❌ Error creando profesional:", insertError.message);
  } else {
    console.log("🎉 Profesional creado con éxito:", user.id);
  }
}
