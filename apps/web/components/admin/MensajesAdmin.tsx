// components/admin/MensajesAdmin.tsx
"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import styles from "@/styles/admin.module.css";

const MensajesAdmin = () => {
  // ✅ Traer los profesionales usando el hook reutilizable
  const { data: profesionales, loading, error } = useFetch("professionals", {
    orderBy: "full_name",
    ascending: true,
  });

  // ✅ Estados para controlar el formulario
  const [selected, setSelected] = useState<string[]>([]);
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ✅ Enviar el mensaje
  const handleSend = async () => {
    if (!asunto || !mensaje || selected.length === 0) {
      setStatusMessage("❌ Todos los campos son obligatorios.");
      return;
    }

    setIsSending(true);
    setStatusMessage("🔄 Enviando notificaciones...");

    try {
      const res = await fetch("/api/admin/enviar-mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asunto, mensaje, recipients: selected }),
      });

      const result = await res.json();

      if (result.success) {
        setStatusMessage("✅ Mensajes enviados correctamente.");
        setAsunto("");
        setMensaje("");
        setSelected([]);
      } else {
        setStatusMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error al enviar mensajes:", error);
      setStatusMessage("❌ Error al enviar los mensajes.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <p className={styles.loading}>🔄 Cargando profesionales...</p>;
  if (error) return <p className={styles.error}>❌ Error al cargar datos: {error}</p>;

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>✉️ Enviar Mensajes Masivos</h1>

      <input
        type="text"
        placeholder="Asunto"
        value={asunto}
        onChange={(e) => setAsunto(e.target.value)}
        className={styles.inputField}
      />

      <textarea
        placeholder="Mensaje"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        className={styles.textArea}
      />

      <select
        multiple
        className={styles.inputField}
        onChange={(e) => {
          const options = Array.from(e.target.selectedOptions, (option) => option.value);
          setSelected(options);
        }}
      >
        {profesionales.map((p) => (
          <option key={p.user_id} value={p.email}>
            {p.full_name} — {p.email}
          </option>
        ))}
      </select>

      <button
        onClick={handleSend}
        className={styles.loginButton}
        disabled={isSending || selected.length === 0}
      >
        {isSending ? "Enviando..." : "Enviar Mensajes"}
      </button>

      {statusMessage && <p style={{ marginTop: "1rem" }}>{statusMessage}</p>}
    </div>
  );
};

export default MensajesAdmin;
