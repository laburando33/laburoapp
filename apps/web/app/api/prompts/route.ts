// apps/web/app/api/prompts/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // 1. Captura el body
  const body = await request.json();

  // 2. Reenvía la petición al servicio externo
  const res = await fetch("https://extensions.aitopia.ai/ai/prompts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // si necesitas auth, añade aquí Authorization: "Bearer XXX"
    },
    body: JSON.stringify(body),
  });

  // 3. Lee la respuesta y la pasas al cliente
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
