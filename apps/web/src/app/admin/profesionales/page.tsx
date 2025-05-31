"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "./ProfesionalesAdmin.module.css";
import Link from "next/link";

interface Profesional {
  user_id: string;
  full_name: string;
  email: string;
  credits: number;
  verificacion_status: string;
  is_verified: boolean;
  created_at: string;
}

export default function ProfesionalesAdmin() {
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [filtro, setFiltro] = useState("");

  const fetchProfesionales = async () => {
    const { data, error } = await supabase
      .from("professionals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error al cargar profesionales:", error.message);
      return;
    }

    setProfesionales(data || []);
  };

  useEffect(() => {
    fetchProfesionales();
  }, []);

  const filtrados = profesionales.filter((pro) =>
    pro.full_name.toLowerCase().includes(filtro.toLowerCase()) ||
    pro.email.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h1>👨‍🔧 Profesionales Registrados</h1>

      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className={styles.input}
      />

      {filtrados.length === 0 ? (
        <p>No se encontraron profesionales.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Verificación</th>
              <th>Créditos</th>
              <th>Registrado</th>
              <th>Perfil</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((pro) => (
              <tr key={pro.user_id}>
                <td>{pro.full_name}</td>
                <td>{pro.email}</td>
                <td>
                  {pro.verificacion_status === "verificado" ? "✅" :
                   pro.verificacion_status === "no_verificado" ? "❌" : "⏳"}
                </td>
                <td>{pro.credits ?? 0}</td>
                <td>{new Date(pro.created_at).toLocaleDateString()}</td>
                <td>
                  <Link href={`/admin/profile/${pro.user_id}`}>
                    <button className={styles.viewButton}>Ver</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
