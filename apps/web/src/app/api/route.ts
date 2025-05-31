import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "API de Laburando App funcionando correctamente." }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const { endpoint, body } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: "Falta el parámetro 'endpoint'." }, { status: 400 });
    }

    const response = await fetch(`http://localhost:3000/api/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.error("❌ Error en el enrutador API:", err.message);
    return NextResponse.json({ error: "Error en el enrutador API." }, { status: 500 });
  }
}