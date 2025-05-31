'use client';

import { useEffect } from "react";

export default function TestFetch() {
  useEffect(() => {
    fetch('/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
      },
      body: JSON.stringify({
        prompt: "Tu mensaje aquí"
      })
    })
      .then(response => response.json())
      .then(data => console.log("🟢 Respuesta del servidor:", data))
      .catch(error => console.error("🔴 Error en el fetch:", error));
  }, []);

  return (
    <div>
      <h1>Test Fetch Component</h1>
      <p>Revisa la consola para ver el resultado.</p>
    </div>
  );
}
