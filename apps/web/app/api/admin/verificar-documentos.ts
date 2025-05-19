// api/admin/verificar-documentos.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { profesionalId, estado, comentario } = await req.json();

    const { error } = await supabase
      .from("verificaciones_profesionales")
      .update({
        estado,
        comentario,
        verified_at: new Date().toISOString(),
      })
      .eq("user_id", profesionalId);

    if (error) {
      console.error("❌ Error al actualizar verificación:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error en el servidor:", error.message);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}
