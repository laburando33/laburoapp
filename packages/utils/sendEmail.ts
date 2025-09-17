// lib/sendEmail.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface EmailParams {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: EmailParams) {
  try {
    const res = await resend.emails.send({
      from: "Laburando <no-reply@laburando.com>",
      to,
      subject,
      text,
    });

    console.log("✅ Email enviado a:", to);
    return res;
  } catch (error: any) {
    console.error("❌ Error al enviar email:", error.message);
    throw error;
  }
}
// Este código es una función que envía un correo electrónico utilizando la API de Resend.
// La función toma un objeto con los parámetros del correo (destinatario, asunto y texto) y utiliza la API de Resend para enviar el correo.