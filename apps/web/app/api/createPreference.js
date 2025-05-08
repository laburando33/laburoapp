// apps/web/pages/api/createPreference.js

import mercadopago from "mercadopago";

// Configurar el access token desde variables de entorno
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { title, unit_price, quantity } = req.body;

    const preference = {
      items: [
        {
          title,
          unit_price: Number(unit_price),
          quantity: Number(quantity),
        },
      ],
      back_urls: {
        success: "http://localhost:3000/success",
        failure: "http://localhost:3000/failure",
        pending: "http://localhost:3000/pending",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);

    res.status(200).json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Error creando preferencia:", error.message);
    res.status(500).json({ error: "Error al crear la preferencia de pago" });
  }
}
