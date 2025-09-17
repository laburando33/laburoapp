import { NextResponse } from "next/server";
import { supabase } from "@lib/supabase-web";
import { sendEmail } from "@utils/sendEmail";

export async function POST(req: Request) {
  const { subject, body, filtro, email } = await req.json();

  let destinatarios: string[] = [];

  if (filtro === "email" && email) {
    destinatarios = [email];
  } else {
    let query = supabase.from("professionals").select("email");

    if (filtro === "no_verificados") {
      query = query.eq("verificacion_status", "no_verificado");
    } else if (filtro === "sin_creditos") {
      query = query.lte("credits", 0);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    destinatarios = data?.map((p) => p.email).filter(Boolean);
  }

  const fallos: string[] = [];

  for (const to of destinatarios) {
    try {
      await sendEmail({ to, subject, text: body });
    } catch (e) {
      fallos.push(to);
    }
  }

  if (fallos.length > 0) {
    return NextResponse.json(
      { message: `Fallaron algunos envíos`, errores: fallos },
      { status: 207 }
    );
  }

  return NextResponse.json({ success: true });
}
