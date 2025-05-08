// /admin/VerificarProfesionales.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import { verificarProfesional } from "@/app/admin/actions/verificarProfesional";

export default function VerificarProfesionales() {
  const [pendientes, setPendientes] = useState<any[]>([]);

  useEffect(() => {
    const fetchPendientes = async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("verificacion_status", "no_verificado");

      if (error) {
        console.error("Error obteniendo profesionales pendientes:", error.message);
        return;
      }

      setPendientes(data || []);
    };

    fetchPendientes();
  }, []);

  const handleVerificar = async (user_id: string) => {
    try {
      await verificarProfesional(user_id);
      setPendientes((prev) => prev.filter((p) => p.user_id !== user_id));
    } catch (err) {
      alert("Error al verificar profesional");
    }
  };

  return (
    <div>
      <h2>📝 Profesionales pendientes de verificación</h2>
      {pendientes.length === 0 ? (
        <p>No hay profesionales pendientes.</p>
      ) : (
        <ul>
          {pendientes.map((pro) => (
            <li key={pro.user_id}>
              <strong>{pro.full_name}</strong> – {pro.email}
              <button onClick={() => handleVerificar(pro.user_id)}>✅ Verificar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
