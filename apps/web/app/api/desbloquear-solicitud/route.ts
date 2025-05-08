import { supabase } from "@/lib/supabase-web"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { solicitudId, profesionalId } = await req.json()

  if (!solicitudId || !profesionalId) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
  }

  try {
    // Verificar si ya desbloqueó
    const { data: existing, error: checkError } = await supabase
      .from("paid_professionals")
      .select("id")
      .eq("solicitud_id", solicitudId)
      .eq("profesional_id", profesionalId)
      .maybeSingle()

    if (checkError) throw checkError
    if (existing) {
      return NextResponse.json({ success: true, alreadyUnlocked: true })
    }

    // Verificar si hay cupo (máximo 4)
    const { count, error: countError } = await supabase
      .from("paid_professionals")
      .select("*", { count: "exact", head: true })
      .eq("solicitud_id", solicitudId)

    if (countError) throw countError
    if ((count || 0) >= 4) {
      return NextResponse.json({ error: "Límite de desbloqueos alcanzado" }, { status: 403 })
    }

    // Verificar créditos
    const { data: credit, error: creditError } = await supabase
      .from("professional_credits")
      .select("credits")
      .eq("professional_id", profesionalId)
      .maybeSingle()

    if (creditError) throw creditError
    if (!credit || credit.credits < 1) {
      return NextResponse.json({ error: "Créditos insuficientes" }, { status: 402 })
    }

    // Descontar 1 crédito
    const { error: updateCreditError } = await supabase
      .from("professional_credits")
      .update({ credits: credit.credits - 1 })
      .eq("professional_id", profesionalId)

    if (updateCreditError) throw updateCreditError

    // Guardar desbloqueo
    const { error: insertError } = await supabase
      .from("paid_professionals")
      .insert({
        solicitud_id: solicitudId,
        profesional_id: profesionalId,
        unlocked_at: new Date().toISOString(),
      })

    if (insertError) throw insertError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("❌ Error en desbloqueo:", err.message)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
