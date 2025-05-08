import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, title, message } = await req.json();

  if (!userId || !title || !message) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const response = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.ONESIGNAL_APP_ID,
      include_external_user_ids: [userId],
      channel_for_external_user_ids: "push",
      headings: { en: title },
      contents: { en: message },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data.errors || "Falló el envío" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id });
}
