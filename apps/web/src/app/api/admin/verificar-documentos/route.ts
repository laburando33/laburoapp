import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { supabase} from "@lib/supabase-web"; // Asegúrate de que este import sea correcto

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { user_id, estado, comentario } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: "Falta user_id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("professionals")
      .update({
        verificacion_status: estado || "verificado",
        comentario: comentario || "Actualizado desde debug endpoint",
        is_verified: estado === "verificado",
        verified_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
