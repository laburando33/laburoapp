// api/payments/createPreference.ts
import mercadopago from "mercadopago";
mercadopago.configure({ access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN });

export async function createPreference({ title, price, credits, userId }) {
  const preference = {
    items: [{ title, quantity: 1, unit_price: price, currency_id: "ARS" }],
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      failure: `${process.env.NEXT_PUBLIC_BASE_URL}/failure`,
    },
    auto_return: "approved",
    metadata: { user_id: userId, credits },
  };

  const response = await mercadopago.preferences.create(preference);
  return response.body.init_point;
}
