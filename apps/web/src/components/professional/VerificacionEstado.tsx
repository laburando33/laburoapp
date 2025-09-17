// src/components/professional/VerificacionEstado.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web"; // Asegúrate de que esta ruta sea correcta
import { toast } from "react-hot-toast"; // Si usas react-hot-toast

interface VerificacionEstadoProps {
  userId: string;
}

export default function VerificacionEstado({ userId }: VerificacionEstadoProps) {
  const [estado, setEstado] = useState<string>("no_verificado"); // Estado inicial
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar el estado inicial del profesional
    supabase
      .from("professionals")
      .select("verificacion_status")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setEstado(data.verificacion_status);
      });
  }, [userId]);

  const solicitarVerificacion = async () => {
    setLoading(true);
    // Asume que los documentos ya fueron cargados antes de esta acción.
    // Esta acción solo cambia el status a 'pendiente'.
    const { error } = await supabase
      .from("professionals")
      .update({ verificacion_status: "pendiente" })
      .eq("user_id", userId);

    if (!error) {
      setEstado("pendiente");
      toast.success("✅ Solicitud de verificación enviada. ¡Pronto la revisaremos!");
    } else {
      console.error("❌ Error al solicitar verificación:", error.message);
      toast.error("❌ Error al enviar solicitud: " + error.message);
    }
    setLoading(false);
  };

  if (estado !== "no_verificado") {
    // Si ya está pendiente, verificado o rechazado, no muestra el botón de solicitud
    return null;
  }

  return (
    <div className="border p-4 rounded-lg shadow mt-4">
      <h2 className="text-lg font-semibold mb-2">Solicitar Verificación</h2>
      <p className="mb-3 text-gray-700">
        Para empezar a recibir solicitudes, necesitamos verificar tu perfil. Por favor, sube los documentos necesarios.
      </p>
      {estado === "no_verificado" && (
        <button
          onClick={solicitarVerificacion}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Solicitar Verificación"}
        </button>
      )}
    </div>
  );
}