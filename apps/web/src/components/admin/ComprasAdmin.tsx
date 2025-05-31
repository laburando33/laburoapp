// ComprasAdmin.tsx (Con suscripción en tiempo real)
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "./ComprasAdmin.module.css";

interface Compra {
  id: string;
  plan_name: string;
  credits: number;
  price: number;
  provider: string;
  status: string;
  created_at: string;
  professionals: { full_name: string; email: string } | null;
}

export default function ComprasAdmin() {
  const [rows, setRows] = useState<Compra[]>([]);

  useEffect(() => {
    // 1. Cargar datos iniciales
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from("credit_purchases")
        .select("*, professionals(full_name,email)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching initial data:", error.message);
      } else {
        setRows(data as Compra[]);
      }
    };

    fetchInitialData();

    // 2. Configurar la suscripción en tiempo real
    const subscription = supabase
      .channel("credit_purchases_channel") // Puedes usar un nombre de canal único
      .on(
        "postgres_changes",
        {
          event: "*", // Escucha todos los eventos: INSERT, UPDATE, DELETE
          schema: "public",
          table: "credit_purchases", // La tabla a la que te suscribes
        },
        (payload) => {
          console.log("Cambio en tiempo real recibido:", payload);

          // Lógica para actualizar el estado basada en el tipo de evento
          if (payload.eventType === "INSERT") {
            // Cuando se inserta una nueva compra
            setRows((prevRows) => [payload.new as Compra, ...prevRows]); // Añadir al principio
          } else if (payload.eventType === "UPDATE") {
            // Cuando se actualiza una compra existente
            setRows((prevRows) =>
              prevRows.map((row) =>
                row.id === (payload.new as Compra).id ? (payload.new as Compra) : row
              )
            );
          } else if (payload.eventType === "DELETE") {
            // Cuando se elimina una compra
            setRows((prevRows) =>
              prevRows.filter((row) => row.id !== (payload.old as Compra).id)
            );
          }
        }
      )
      .subscribe();

    // 3. Limpiar la suscripción cuando el componente se desmonte
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []); // Este efecto se ejecuta una sola vez al montar el componente, pero mantiene la suscripción activa.

  return (
    <div className={styles.container}>
      <h1>💳 Historial de Compras</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Profesional</th><th>Email</th><th>Plan</th><th>Créditos</th><th>Precio</th><th>Origen</th><th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.professionals?.full_name ?? "—"}</td>
              <td>{r.professionals?.email ?? "—"}</td>
              <td>{r.plan_name}</td>
              <td>{r.credits}</td>
              <td>${r.price.toFixed(2)}</td>
              <td>{r.provider}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}