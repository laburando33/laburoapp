"use client";

import { useEffect, useState } from "react";

interface Solicitud {
  id: string;
  user_email: string;
  job_description: string;
  category: string;
  location: string;
  status: string;
  created_at: string;
}

export default function SolicitudesDesbloqueadas() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch inicial para obtener todas las solicitudes desbloqueadas
  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/solicitudes-desbloqueadas", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("❌ Error al cargar solicitudes desbloqueadas");
        return;
      }

      const data = await response.json();
      setSolicitudes(data);
    } catch (error) {
      console.error("❌ Error al obtener las solicitudes desbloqueadas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">📋 Solicitudes Desbloqueadas</h2>

      {loading ? (
        <p>Cargando solicitudes...</p>
      ) : solicitudes.length === 0 ? (
        <p>No se encontraron solicitudes desbloqueadas.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Descripción</th>
              <th className="border p-2">Servicio</th>
              <th className="border p-2">Ubicación</th>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Creado</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((solicitud) => (
              <tr key={solicitud.id}>
                <td className="border p-2">{solicitud.id}</td>
                <td className="border p-2">{solicitud.user_email}</td>
                <td className="border p-2">{solicitud.job_description}</td>
                <td className="border p-2">{solicitud.category}</td>
                <td className="border p-2">{solicitud.location}</td>
                <td className="border p-2">{solicitud.status}</td>
                <td className="border p-2">{new Date(solicitud.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
// Este componente muestra una tabla con las solicitudes desbloqueadas  