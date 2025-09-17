import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("status", "desbloqueada")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error obteniendo solicitudes desbloqueadas:", error.message);
      return NextResponse.json({ error: "Error al obtener solicitudes desbloqueadas." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Error interno del servidor:", err.message);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
