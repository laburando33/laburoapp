import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: adminProfile } = await supabase
    .from("professionals")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminProfile?.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  const { user_id, credits, amount } = await req.json();

  if (!user_id || credits <= 0) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const insertRes = await supabase.from("credit_purchases").insert({
    user_id,
    credits,
    amount,
    plan_name: "Carga manual",
  });

  if (insertRes.error) {
    return NextResponse.json({ error: insertRes.error.message }, { status: 500 });
  }

  await supabase.rpc("increment_total_credits", {
    user_id_param: user_id,
    amount_param: credits,
  });

  return NextResponse.json({ success: true });
}
