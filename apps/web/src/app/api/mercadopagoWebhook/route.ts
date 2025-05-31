// apps/web/src/app/api/mercadopagoWebhook/route.ts
import { NextResponse } from 'next/server'; // Importar NextResponse para App Router
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabase } from "@lib/supabase-web"; // Asegúrate de que esta ruta sea correcta

// ✅ ASEGÚRATE DE QUE ESTA VARIABLE ESTÉ BIEN CONFIGURADA EN .env.local
const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN; 

// Esta función manejará SOLO las solicitudes POST para esta ruta
export async function POST(req: Request) { // CAMBIO CLAVE: Usa 'Request' y exporta 'POST'
  // En el App Router, el cuerpo de la solicitud se parsea con req.json()
  const body = await req.json();
  const id = body.id || body.data?.id; 
  const topic = body.type || body.topic;

  console.log("--- Webhook de Mercado Pago Recibido (App Router) ---");
  console.log("Raw body:", JSON.stringify(body, null, 2)); 
  console.log("ID del pago/evento:", id);
  console.log("Tópico:", topic);

  if (!id || !topic) {
    console.error("❌ ID o Tópico faltante en la notificación.");
    return NextResponse.json({ error: "ID o Tópico faltante" }, { status: 400 });
  }

  if (topic === "payment") {
    if (!ACCESS_TOKEN) {
      console.error("❌ MERCADO_PAGO_ACCESS_TOKEN no está definido.");
      return NextResponse.json({ error: "Configuración de API incompleta" }, { status: 500 });
    }

    try {
      const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
      const paymentClient = new Payment(client);

      console.log(`🔎 Buscando detalles del pago con ID: ${id}`);
      const paymentDetails = await paymentClient.get({ id: id.toString() });

      const { metadata, status, transaction_amount } = paymentDetails;

      console.log("Detalles del Pago de MP:");
      console.log("  Status:", status);
      console.log("  Monto de la transacción:", transaction_amount);
      console.log("  Metadata:", JSON.stringify(metadata, null, 2));

      if (status === "approved") {
        console.log("✅ Pago aprobado. Procesando créditos...");
        const userId = metadata?.user_id;
        const credits = metadata?.credits;
        const plan_name = metadata?.plan_name || "Créditos vía Mercado Pago";

        if (userId && credits) {
          console.log(`📞 Llamando a RPC 'add_credits' para userId: ${userId}, créditos: ${credits}`);
          const { error: addCreditsError } = await supabase.rpc("add_credits", {
            p_user_id: userId,
            p_credits: credits,
            p_plan_name: plan_name,
            p_price: transaction_amount,
            p_provider: "Mercado Pago",
            p_status: "paid"
          });

          if (addCreditsError) {
            console.error("❌ Error al añadir créditos RPC:", addCreditsError.message);
            // No retornar error 500 para evitar reintentos de MP si el pago ya fue procesado
            return NextResponse.json({ message: "Notificación procesada, pero hubo un error al añadir créditos." }, { status: 200 });
          } else {
            console.log(`🎉 Créditos añadidos con éxito para el usuario ${userId}: ${credits}`);
          }
        } else {
          console.warn("⚠️ Metadata (userId o credits) faltante en pago aprobado de MP. No se pudo añadir créditos.");
        }
      } else {
        console.log(`ℹ️ Pago NO aprobado. Estado: ${status}. No se añaden créditos.`);
      }
      return NextResponse.json({ message: "Notificación de pago procesada" }, { status: 200 });
    } catch (err: any) {
      console.error("❌ Error grave en el webhook de Mercado Pago (catch block):", err.message);
      return NextResponse.json({ error: "Error interno del servidor en webhook" }, { status: 500 });
    }
  } else {
    console.log(`ℹ️ Webhook recibió TÓPICO desconocido: ${topic}. No procesado para créditos.`);
    return NextResponse.json({ message: "Tipo de notificación no manejado" }, { status: 200 });
  }
}