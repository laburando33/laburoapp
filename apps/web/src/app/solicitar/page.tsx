"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@lib/supabase-web";
import { sendNotification } from "@utils/sendNotification";

/*************  ✨ Windsurf Command ⭐  *************/
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
/*******  54bde7e0-6243-40b8-83f1-5b6f4e6a5abb  *******/
export default function SolicitarPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [form, setForm] = useState({
    user_email: "",
    phone: "",
    job_description: "",
    category: "",
    location: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const categoria = searchParams.get("categoria");
    const location = searchParams.get("location");
    setForm((prev) => ({
      ...prev,
      category: categoria || "",
      location: location || ""
    }));
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.user_email || !form.category || !form.location || !form.job_description) {
      alert("Por favor completá todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("requests").insert([form]);

    if (error) {
      alert("❌ Error al crear la solicitud");
      console.error(error);
    } else {
      await sendNotification({
        title: `Nueva solicitud de ${form.category}`,
        message: `${form.location} - ${form.job_description}`,
      });

      alert("✅ Solicitud enviada correctamente.");
      router.push("/");
    }

    setLoading(false);
  };

  return (
    <main style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
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

      <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 20px" }}>
        {loading ? "Enviando..." : "Enviar solicitud"}
      </button>
    </main>
  );
}
