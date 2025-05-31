"use client";

import { useState } from "react";
import styles from "./MensajesAdmin.module.css";
import { toast } from "react-hot-toast";

export default function MensajesAdmin() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [emailPersonalizado, setEmailPersonalizado] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    if (!subject || !body) {
      toast.error("✉️ Completá asunto y mensaje.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/enviar-masivo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        body,
        filtro,
        email: filtro === "email" ? emailPersonalizado : null,
      }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("✅ Emails enviados correctamente.");
      setSubject("");
      setBody("");
      setEmailPersonalizado("");
    } else {
      const error = await res.json();
      toast.error("❌ Error: " + error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1>📧 Enviar correo a profesionales</h1>

      <label>Asunto</label>
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className={styles.input}
        placeholder="Ej. ¡Nueva promoción disponible!"
      />

      <label>Mensaje</label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className={styles.textarea}
        placeholder="Escribí el cuerpo del mensaje aquí..."
      />

      <label>Destinatarios</label>
      <select
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className={styles.select}
      >
        <option value="todos">Todos los profesionales</option>
        <option value="no_verificados">Solo no verificados</option>
        <option value="sin_creditos">Solo sin créditos</option>
        <option value="email">Email específico</option>
      </select>

      {filtro === "email" && (
        <input
          type="email"
          value={emailPersonalizado}
          onChange={(e) => setEmailPersonalizado(e.target.value)}
          className={styles.input}
          placeholder="ejemplo@email.com"
        />
      )}

      <button onClick={handleEnviar} disabled={loading} className={styles.button}>
        {loading ? "Enviando..." : "Enviar correo"}
      </button>
    </div>
  );
}
