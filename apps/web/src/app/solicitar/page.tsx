"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@lib/supabase-web"; // Asegúrate de que esta ruta sea correcta
import { sendNotification } from "@utils/sendNotification"; // Esta importación puede no ser necesaria si la notificación se maneja en el backend

/************* ✨ Windsurf Command ⭐  *************/
/**
 * Página para solicitar presupuesto.
 *
 * La página utiliza el hook `useSearchParams` para obtener los parámetros de
 * la URL, como la categoría y la ubicación. Luego utiliza el hook `useState` para
 * guardar el formulario en el estado local.
 *
 * El formulario tiene los siguientes campos obligatorios:
 * - `user_email`: el correo electrónico del usuario que solicita el presupuesto
 * - `category`: la categoría del servicio
 * - `location`: la ubicación del servicio
 * - `job_description`: la descripción del problema
 *
 * El formulario también tiene un campo opcional `phone` para el teléfono del
 * usuario.
 *
 * Al hacer submit del formulario, se llama a la función `handleSubmit` que
 * inserta una nueva solicitud en la tabla `requests` de Supabase y envía una
 * notificación a los profesionales con la función `sendNotification`. Si hay un
 * error, se muestra un alert con el mensaje de error.
 *
 * La página utiliza el hook `useRouter` para redirigir al usuario a la página
 * principal después de enviar la solicitud.
 */
/******* 54bde7e0-6243-40b8-83f1-5b6f4e6a5abb  *******/
export default function SolicitarPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [form, setForm] = useState({
    user_email: "",
    phone: "",
    category: searchParams.get("category") || "",
    location: searchParams.get("location") || "",
    job_description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      // ✅ Aquí llamamos a TU PROPIO ENDPOINT DE API (/api/requests)
      // Este endpoint ya se encarga de insertar en Supabase y de la notificación.
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviamos los datos directamente como los espera el backend
        body: JSON.stringify({
          user_email: form.user_email,
          job_description: form.job_description,
          category: form.category,
          location: form.location,
          // 'phone' no es parte del esquema de la tabla 'requests' en tu route.ts.
          // Si lo necesitas, debes añadirlo a la tabla 'requests' y a tu route.ts.
          // Por ahora, lo dejamos fuera o lo integras en job_description.
          // phone: form.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error desconocido al enviar solicitud.');
      }

      const result = await response.json();
      console.log('Solicitud enviada con éxito:', result.solicitud); // Log de la solicitud creada
      alert('¡Solicitud de presupuesto enviada con éxito!');
      router.push('/'); // Redirigir a la página principal
    } catch (error: any) {
      alert('Error al enviar la solicitud: ' + error.message);
      console.error(error);
    }
  };

  return (
    <main style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h1>📋 Solicitar presupuesto</h1>

      <input
        type="email"
        name="user_email"
        placeholder="Tu correo electrónico"
        value={form.user_email}
        onChange={handleChange}
        required
        style={{ width: "100%", margin: "10px 0", padding: 10 }}
      />

      <input
        type="text"
        name="phone"
        placeholder="Teléfono (opcional)"
        value={form.phone}
        onChange={handleChange}
        style={{ width: "100%", margin: "10px 0", padding: 10 }}
      />

      <input
        type="text"
        name="category"
        placeholder="Categoría del servicio"
        value={form.category}
        onChange={handleChange}
        required
        style={{ width: "100%", margin: "10px 0", padding: 10 }}
      />

      <input
        type="text"
        name="location"
        placeholder="Ubicación"
        value={form.location}
        onChange={handleChange}
        required
        style={{ width: "100%", margin: "10px 0", padding: 10 }}
      />

      <textarea
        name="job_description"
        placeholder="Descripción del problema"
        value={form.job_description}
        onChange={handleChange}
        rows={4}
        required
        style={{ width: "100%", margin: "10px 0", padding: 10 }}
      />

      <button onClick={handleSubmit} disabled={!form.user_email || !form.category || !form.location || !form.job_description} style={{ padding: 10, backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
        Enviar Solicitud
      </button>
    </main>
  );
}