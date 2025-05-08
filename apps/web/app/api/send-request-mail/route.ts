import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { professionals, request } = body;

    if (!professionals || !request) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Recorrer profesionales y enviar mail a cada uno
    for (const prof of professionals) {
      const { email, full_name } = prof;

      const leadPreview = `
        Hola ${full_name || "profesional"},

        Hay una nueva solicitud de servicio relacionada con tu rubro.

        👉 Servicio: ${request.category}
        📍 Ubicación: ${request.location}
        📝 Descripción: ${request.job_description}

        ⚠️ Los datos del cliente están protegidos.

        Para desbloquear esta solicitud y ver los datos del cliente, ingresá al panel de Laburando y gastá 1 lead.

        👉 https://laburando.com/admin

        ¡Gracias por confiar!
      `;

      await resend.emails.send({
        from: "Laburando <notificaciones@laburando.com>",
        to: email,
        subject: "📥 Nueva solicitud de servicio disponible",
        text: leadPreview
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("❌ Error al enviar correos:", err.message);
    return NextResponse.json({ error: "Error al enviar correos" }, { status: 500 });
  }
}