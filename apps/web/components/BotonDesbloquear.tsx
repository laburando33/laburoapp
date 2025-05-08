import { useState, useEffect } from "react";
import { desbloquearDatos } from "@/lib/GestionPresupuestos";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-web";

interface BotonDesbloquearProps {
  profesionalId: string;
  presupuestoId: string;
}

export default function BotonDesbloquear({ profesionalId, presupuestoId }: BotonDesbloquearProps) {
  const [loading, setLoading] = useState(false);
  const [habilitado, setHabilitado] = useState(false);
  const router = useRouter();

  // ✅ Cargar el estado inicial desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("visualizaciones")
        .select("habilitado")
        .eq("profesional_id", profesionalId)
        .eq("presupuesto_id", presupuestoId)
        .single();

      if (data) setHabilitado(data.habilitado);
    };

    fetchData();

    // 🔄 Polling para actualizar el estado cada 5 segundos
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [profesionalId, presupuestoId]);

  const handleUnlock = async () => {
    if (habilitado) {
      alert("Ya tienes acceso a los datos.");
      return;
    }

    setLoading(true);

    try {
      // 🔄 Generar preferencia de pago
      const response = await fetch("/api/createPreference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Desbloqueo de datos de contacto",
          unit_price: 10, // Precio en dólares o moneda configurada
          quantity: 1,
          profesional_id: profesionalId,
          presupuesto_id: presupuestoId
        }),
      });

      const { init_point } = await response.json();
      window.open(init_point, "_blank");

      alert("Redirigiendo a MercadoPago para completar el pago.");
    } catch (error) {
      console.error("❌ Error al desbloquear datos:", error);
      alert("Hubo un problema al desbloquear los datos. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUnlock}
      disabled={loading || habilitado}
      className={`px-4 py-2 mt-4 ${habilitado ? "bg-green-500" : "bg-blue-500"} text-white rounded-lg`}
    >
      {loading ? "Procesando..." : habilitado ? "Datos desbloqueados" : "Pagar y desbloquear"}
    </button>
  );
}
