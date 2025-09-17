"use client";

import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";
import styles from "./SettingsAdmin.module.css";
import { toast } from "react-hot-toast";

interface Settings {
  unlock_price: number;
  default_credits: number;
  email_subject_default: string;
  email_body_default: string;
  enable_notifications: boolean;
}

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle()
    if (error) {
      console.error("❌ Error cargando settings:", error.message);
      toast.error("Error al cargar configuración.");
    } else {
      setSettings(data);
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev!,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("platform_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "default");

    if (error) {
      toast.error("❌ Error al guardar configuración.");
      console.error(error.message);
    } else {
      toast.success("✅ Configuración actualizada.");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading || !settings) return <p className={styles.loading}>⏳ Cargando configuración...</p>;

  return (
    <div className={styles.container}>
      <h1>⚙️ Configuración de la Plataforma</h1>

      <label>💰 Precio por desbloqueo ($ ARS)</label>
      <input
        type="number"
        name="unlock_price"
        value={settings.unlock_price}
        onChange={handleChange}
        className={styles.input}
      />

      <label>🎁 Créditos iniciales al registrarse</label>
      <input
        type="number"
        name="default_credits"
        value={settings.default_credits}
        onChange={handleChange}
        className={styles.input}
      />

      <label>📨 Asunto del email por defecto</label>
      <input
        type="text"
        name="email_subject_default"
        value={settings.email_subject_default}
        onChange={handleChange}
        className={styles.input}
      />

      <label>📨 Cuerpo del email por defecto</label>
      <textarea
        name="email_body_default"
        value={settings.email_body_default}
        onChange={handleChange}
        className={styles.textarea}
      />

      <label>
        <input
          type="checkbox"
          name="enable_notifications"
          checked={settings.enable_notifications}
          onChange={handleChange}
        />
        📣 Habilitar notificaciones automáticas
      </label>

      <button onClick={handleSave} className={styles.button}>
        Guardar cambios
      </button>
    </div>
  );
}
