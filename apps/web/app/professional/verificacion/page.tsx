'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import VerificacionProfesional from "@/components/professional/VerificacionProfesional";

export default function VerificacionPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user?.id) {
        console.error("Error obteniendo usuario:", error?.message);
        return;
      }
      setUserId(data.user.id);
    };

    fetchUser();
  }, []);

  if (!userId) return <p>Cargando datos del usuario...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📄 Verificación de Cuenta</h1>
      <VerificacionProfesional userId={userId} />
    </div>
  );
}
