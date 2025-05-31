import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@lib/supabase-web";
/* ───────── helpers ───────── */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const BASE_URL        = process.env.NEXT_PUBLIC_BASE_URL!;
const IS_SANDBOX      = process.env.NEXT_PUBLIC_MP_SANDBOX === "true";

/* ───────── POST handler ───────── */
export async function POST(req: Request) {
  try {
    const { title, credits, price } = await req.json();

    /* 1️⃣ Usuario autenticado */
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    /* 2️⃣ Sandbox local: devolver punto ficticio y listo */
    if (IS_SANDBOX || !MP_ACCESS_TOKEN) {
      return NextResponse.json({
        preferenceId: "SANDBOX_PREFERENCE_ID",
        initPoint:    "https://sandbox.mercadopago.com/checkout/v1/redirect?pref_id=SANDBOX"
      });
    }

    /* 3️⃣ Producción: Mercado Pago real */
    const mp = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

    const preference: Preference = {
      items: [{
        title,
        quantity: 1,
        unit_price: price,
        currency_id: "ARS"
      }],
      back_urls: {
        success: `${BASE_URL}/payments/success`,
        failure: `${BASE_URL}/payments/failure`
      },
      auto_return: "approved",
      metadata: {
        user_id:  user.id,
        credits
      }
    };

    const { id, init_point } = await mp.preference.create(preference);
    return NextResponse.json({ preferenceId: id, initPoint: init_point });
  } catch (err: any) {
    console.error("❌ createPreference:", err.message);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
