// src/app/api/verificar-profesional/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 1. Logear el usuario autenticado para depuración de RLS
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("❌ API: No authenticated user found for verification action.", userError?.message || "No user object.");
      return NextResponse.json({ error: "Unauthorized: No authenticated user." }, { status: 401 });
    }
    console.log(`✅ API: Authenticated user ID: ${user.id}`);
    console.log(`✅ API: Authenticated user email: ${user.email}`);
    console.log(`✅ API: Authenticated user metadata:`, user.user_metadata);

    // Verificar si el usuario autenticado tiene el rol 'admin'
    if (user.user_metadata?.role !== 'admin') {
      console.warn(`⚠️ API: Authenticated user is not an admin. Role: ${user.user_metadata?.role}`);
      return NextResponse.json({ error: "Forbidden: Not an admin." }, { status: 403 });
    }

    const { user_id, estado, comentario } = await req.json();

    if (!user_id || !estado) {
      return NextResponse.json({ error: "Faltan user_id o estado" }, { status: 400 });
    }

    // 2. Obtener el 'full_name' del profesional para el historial
    // Esto es necesario porque 'verification_history.full_name' es NOT NULL
    const { data: professionalData, error: fetchProfError } = await supabase
      .from("professionals")
      .select("full_name")
      .eq("user_id", user_id)
      .single(); // Esperamos un único resultado

    if (fetchProfError) {
      console.error("❌ Error al obtener el nombre del profesional para historial:", fetchProfError.message);
      return NextResponse.json({ error: "Error al obtener datos del profesional para historial." }, { status: 500 });
    }

    const professionalFullName = professionalData.full_name;

    // 3. Actualiza la tabla de profesionales
    const { error: profError } = await supabase
      .from("professionals")
      .update({
        verificacion_status: estado,
        comentario: estado === "rechazado" ? comentario : null,
        is_verified: estado === "verificado",
        verified_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    if (profError) {
      console.error("❌ Error al actualizar profesional:", profError.message);
      return NextResponse.json({ error: profError.message }, { status: 500 });
    }

    // 4. Registra en historial de verificación
    const { error: histError } = await supabase.from("verification_history").insert({
      user_id,
      status: estado,
      comentario,
      verified_at: new Date().toISOString(),
      full_name: professionalFullName, // <-- ¡Aquí se añade el full_name!
    });

    if (histError) {
      console.error("❌ Error al registrar en historial de verificación:", histError.message);
      return NextResponse.json({ error: histError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error inesperado en la API de verificación:", error.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}