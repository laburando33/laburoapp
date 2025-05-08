// ✅ Usar este import:
import mercadopago from "mercadopago";

// ✅ Configurar con tu token
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

// ✅ Crear preferencia de pago
export async function POST(request: Request) {
  const { title, price, credits, userId } = await request.json();

  const preference = {
    items: [
      {
        title,
        quantity: 1,
        unit_price: price,
        currency_id: "ARS",
      },
    ],
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/shop?success=true&credits=${credits}`,
      failure: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/shop?failure=true`,
    },
    auto_return: "approved",
    metadata: {
      user_id: userId,
      credits,
    },
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    return new Response(JSON.stringify({ init_point: response.body.init_point }));
  } catch (err: any) {
    console.error("Error MercadoPago:", err);
    return new Response(JSON.stringify({ error: "Error creando preferencia" }), { status: 500 });
  }
}
