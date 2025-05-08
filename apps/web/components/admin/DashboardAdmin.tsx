
'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./DashboardAdmin.module.css";

interface Profesional {
  user_id: string;
  full_name: string;
  email: string;
  is_verified: boolean;
}

interface Solicitud {
  id: number;
  user_email: string;
  job_description: string;
  location: string;
  created_at: string;
  status: string;
}

export default function DashboardAdmin() {
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  useEffect(() => {
    const fetchProfesionales = async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("user_id, full_name, email, is_verified");

      if (data) {
        setProfesionales(data.filter(p => p.email && p.full_name));
      } else {
        console.error("Error al cargar profesionales:", error?.message);
      }
    };

    const fetchSolicitudes = async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setSolicitudes(data);
      } else {
        console.error("Error al cargar solicitudes:", error?.message);
      }
    };

    fetchProfesionales();
    fetchSolicitudes();
  }, []);

  return (
    <div className={styles.container}>
      <h1>📊 Dashboard Admin</h1>
      <section>
        <h2>Profesionales Registrados</h2>
        <ul>
          {profesionales.map((p) => (
            <li key={p.user_id}>
              {p.full_name} - {p.email} - {p.is_verified ? "✅ Verificado" : "❌ No verificado"}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Solicitudes de Servicios</h2>
        <ul>
          {solicitudes.map((s) => (
            <li key={s.id}>
              {s.user_email} - {s.job_description} ({s.status})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
