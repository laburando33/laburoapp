import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { supabase } from "@lib/supabase-web"; // Asegúrate de que este import sea correcto
import { sendNotification } from "@utils/sendNotification";

const IS_SANDBOX      = process.env.NEXT_PUBLIC_MP_SANDBOX === "true";
const ACCESS_TOKEN    = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const BASE_URL        = process.env.NEXT_PUBLIC_BASE_URL!;          // ej. http://localhost:3000

/* POST /api/payments/createPreference */
export async function POST(req: Request) {
  const { title, price, credits, userId } = await req.json();

  /* 1️⃣  modo sandbox (sin clave) => se devuelve un objeto ficticio */
  if (IS_SANDBOX || !ACCESS_TOKEN) {
    return NextResponse.json({
      preferenceId: "SANDBOX_PREF",
      initPoint:    "https://sandbox.mercadopago.com/checkout/v1/redirect?pref_id=SANDBOX"
    });
  }

  /* 2️⃣  producción real */
  try {
    const mp = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });

    const pref: Preference = {
      items: [{ title, quantity: 1, unit_price: price, currency_id: "ARS" }],
      back_urls: {
        success: `${BASE_URL}/payments/success`,
        failure: `${BASE_URL}/payments/failure`
      },
      auto_return: "approved",
      metadata: { user_id: userId, credits }
    };

    const { id, init_point } = await mp.preference.create(pref);
    return NextResponse.json({ preferenceId: id, initPoint: init_point });
  } catch (err: any) {
    console.error("❌ createPreference:", err.message);
    return NextResponse.json({ error: "Mercado Pago error" }, { status: 500 });
  }
}
