"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./BudgetRequestModal.module.css";

const allServices = [
  "Albañil", "Técnico de aire acondicionado", "Tarquino", "Electricista", "Durlock",
  "Impermeabilización de techos", "Pulidor de pisos", "Pintor interior", "Pintor de alturas",
  "Electricista matriculado", "Vidriería y cerramientos", "Colocación de redes de balcones",
  "Mudanza y fletes", "Pequeños arreglos", "Plomería", "Soldador", "Destapaciones pluviales y cloacales"
];

const allLocations = {
  "Ciudad de Buenos Aires": ["Palermo", "Recoleta", "Caballito", "Belgrano"],
  "Zona Norte GBA": ["San Isidro", "Vicente López", "Tigre"],
  "Zona Sur GBA": ["Lanús", "Avellaneda", "Lomas de Zamora"],
  "Zona Oeste GBA": ["Morón", "Ituzaingó", "Merlo"],
  "La Plata": ["Casco Urbano", "City Bell", "Gonnet"],
  "Rosario": ["Centro", "Echesortu", "Fisherton"],
  "Córdoba": ["Nueva Córdoba", "Alta Córdoba", "Centro"],
  "Mendoza": ["Godoy Cruz", "Guaymallén", "Ciudad"],
  "Mar del Plata": ["Playa Grande", "Centro", "Constitución"]
};

const steps = [
  { questions: ["¿Qué servicio necesitás?", "¿Con qué urgencia? (opcional)"], fields: ["servicio", "urgencia"] },
  { questions: ["¿Dónde se realizará?", "Barrio o zona"], fields: ["ubicacion", "barrio"] },
  { questions: ["¿Querés subir una foto? (opcional)", "Comentarios adicionales (opcional)"], fields: ["foto", "comentarios"] },
  { questions: ["Nombre y apellido", "Email", "Teléfono"], fields: ["nombre", "email", "telefono"] }
];

export default function BudgetRequestModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone: string) => /^[0-9\s()+-]{6,}$/.test(phone);

  const validateStep = () => {
    const requiredFields = steps[step].fields.filter((f) => !["foto", "comentarios", "urgencia"].includes(f));
    for (const field of requiredFields) {
      const value = formData[field]?.trim();
      if (!value) return false;
      if (field === "email" && !validateEmail(value)) return false;
      if (field === "telefono" && !validatePhone(value)) return false;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) {
      alert("Por favor completá correctamente todos los campos obligatorios.");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) {
      alert("Por favor completá correctamente todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    let foto_url = null;

    try {
      if (file) {
        const path = `presupuestos/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("presupuestos")
          .upload(path, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("presupuestos").getPublicUrl(path);
        foto_url = data.publicUrl;
      }

      const { data, error } = await supabase
        .from("presupuestos")
        .insert([{
          servicio: formData.servicio,
          urgencia: formData.urgencia || null,
          ubicacion: formData.ubicacion,
          tipo_propiedad: formData.barrio,
          foto_url,
          comentarios: formData.comentarios || null,
          nombre: formData.nombre,
          contacto: `${formData.email} | ${formData.telefono}`
        }])
        .select()
        .single();

      if (error) throw error;

      await fetch("/api/reenviar-notificacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solicitudId: data.id,
          servicio: data.servicio,
          ubicacion: data.ubicacion,
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 4500);
    } catch (err: any) {
      console.error("❌ Error al enviar presupuesto:", err.message);
      alert("❌ Hubo un error al enviar el presupuesto.");
    } finally {
      setLoading(false);
    }
  };

  const { questions, fields } = steps[step];
  const progress = ((step + 1) / steps.length) * 100;
  const barrios = formData.ubicacion ? allLocations[formData.ubicacion] || [] : [];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {success ? (
          <div className={styles.successContainer}>
            <div className={styles.checkmark}>✔</div>
            <p className={styles.successMessage}>
              ¡Gracias por confiar en Laburando App! <br />
              En breve recibirás hasta 4 presupuestos.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h2>Solicitar presupuesto</h2>
              <button onClick={onClose}>✕</button>
            </div>

            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <div className={styles.stepContent}>
              {questions.map((q, i) => (
                <div key={i} className={styles.inputGroup}>
                  <label>{q}</label>
                  {fields[i] === "foto" ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  ) : fields[i] === "servicio" ? (
                    <select value={formData.servicio || ""} onChange={(e) => handleChange("servicio", e.target.value)}>
                      <option value="">Seleccioná un servicio</option>
                      {allServices.map((s, index) => (
                        <option key={index} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : fields[i] === "ubicacion" ? (
                    <select value={formData.ubicacion || ""} onChange={(e) => handleChange("ubicacion", e.target.value)}>
                      <option value="">Seleccioná una zona</option>
                      {Object.keys(allLocations).map((loc, index) => (
                        <option key={index} value={loc}>{loc}</option>
                      ))}
                    </select>
                  ) : fields[i] === "barrio" ? (
                    <select value={formData.barrio || ""} onChange={(e) => handleChange("barrio", e.target.value)} disabled={!barrios.length}>
                      <option value="">Seleccioná un barrio</option>
                      {barrios.map((barrio, index) => (
                        <option key={index} value={barrio}>{barrio}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={fields[i] === "email" ? "email" : "text"}
                      value={formData[fields[i]] || ""}
                      onChange={(e) => handleChange(fields[i], e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              {step > 0 && <button onClick={prevStep}>Atrás</button>}
              {step < steps.length - 1 ? (
                <button onClick={nextStep}>Siguiente</button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Enviando..." : "Enviar"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
