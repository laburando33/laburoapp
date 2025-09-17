"use client";

import { useState } from "react";
// Importa la instancia de Supabase del lado del cliente web solo si la usas para otras cosas
// Si solo la usabas para el insert, puedes eliminarla por completo.
// Si aún necesitas cargar datos (como la lista de servicios/ubicaciones dinámicamente), manténla.
// import { supabase } from "@lib/supabase-web"; // REMOVE THIS LINE IF YOU ARE NOT UPLOADING FILES DIRECTLY FROM THE CLIENT

import styles from "./BudgetRequestModal.module.css"; // Archivo CSS para estilos

// Datos estáticos para servicios y ubicaciones
// Si estos datos son muy grandes o dinámicos, podrían cargarse desde una API o Supabase
const allServices = [
  "Albañil", "Técnico de aire acondicionado", "Tarquino", "Electricista", "Durlock",
  "Impermeabilización de techos", "Pulidor de pisos", "Pintor interior", "Pintor de alturas",
  "Electricista matriculado", "Vidriería y cerramientos", "Colocación de redes de balcones",
  "Mudanza y fletes", "Pequeños arreglos", "Plomería", "Soldador", "Destapaciones pluviales y cloacales"
];

const allLocations: { [key: string]: string[] } = {
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

// Definición de los pasos del formulario, preguntas y campos asociados
const steps = [
  { questions: ["¿Qué servicio necesitás?", "¿Con qué urgencia? (opcional)"], fields: ["servicio", "urgencia"] },
  { questions: ["¿Dónde se realizará? (Ciudad/Zona)", "Dirección completa"], fields: ["ubicacion", "direccion"] },
  { questions: ["¿Querés subir una foto? (opcional)", "Comentarios adicionales (opcional)"], fields: ["foto", "comentarios"] },
  { questions: ["Nombre y apellido", "Email", "Teléfono"], fields: ["nombre", "email", "telefono"] }
];

interface BudgetRequestModalProps {
  onClose: () => void; // Función para cerrar el modal
  initialData?: any; // Agregado para soportar initialData si es necesario, aunque no se usa en este ejemplo
}

export default function BudgetRequestModal({ onClose, initialData }: BudgetRequestModalProps) {
  const [step, setStep] = useState(0); // Estado para controlar el paso actual del formulario
  const [formData, setFormData] = useState<any>({
    servicio: initialData?.servicio || "",
    ubicacion: initialData?.ubicacion || "",
    direccion: "", // Initialize direccion as it's a new field
    // ... initialize other fields as needed
  }); // Estado para almacenar los datos del formulario
  const [file, setFile] = useState<File | null>(null); // Estado para el archivo de la foto
  const [success, setSuccess] = useState(false); // Estado para indicar si la solicitud fue exitosa
  const [loading, setLoading] = useState(false); // Estado para indicar si se está enviando la solicitud
  const [message, setMessage] = useState<{ type: 'error' | 'info', text: string } | null>(null); // Estado para mensajes al usuario

  // Maneja el cambio de valor en los campos del formulario
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setMessage(null); // Limpia cualquier mensaje al cambiar un campo
  };

  // Valida el formato de un email
  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  // Valida el formato de un número de teléfono (mínimo 6 dígitos, permite espacios, paréntesis, guiones, más)
  const validatePhone = (phone: string) => /^[0-9\s()+-]{6,}$/.test(phone);

  // Valida los campos obligatorios del paso actual
  const validateStep = () => {
    // Filtra los campos que son obligatorios para el paso actual
    const requiredFields = steps[step].fields.filter((f) => !["foto", "comentarios", "urgencia"].includes(f));
    for (const field of requiredFields) {
      const value = formData[field]?.trim();
      if (!value) {
        setMessage({ type: 'error', text: "Por favor completá todos los campos obligatorios." });
        return false;
      }
      if (field === "email" && !validateEmail(value)) {
        setMessage({ type: 'error', text: "Por favor ingresá un email válido." });
        return false;
      }
      if (field === "telefono" && !validatePhone(value)) {
        setMessage({ type: 'error', text: "Por favor ingresá un teléfono válido." });
        return false;
      }
    }
    return true;
  };

  // Avanza al siguiente paso del formulario
  const nextStep = () => {
    if (!validateStep()) {
      return; // Si la validación falla, no avanza
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
    setMessage(null); // Limpia mensajes al avanzar
  };

  // Retrocede al paso anterior del formulario
  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 0));
    setMessage(null); // Limpia mensajes al retroceder
  };

  // Maneja el envío final del formulario
  const handleSubmit = async () => {
    if (!validateStep()) {
      return; // Si la validación falla, no envía
    }

    setLoading(true); // Activa el estado de carga
    setMessage(null); // Limpia mensajes
    // let foto_url: string | null = null; // This will now be handled by the API route if you send the file there

    try {
      // If you need to upload files, you should send them to your API route
      // which will then handle the Supabase Storage upload on the server side.
      // For simplicity, this example will send the file as part of the FormData.
      // However, for large files or more robust handling, consider a dedicated
      // upload API route or using a client-side upload *if* your Supabase policies allow it.

      // Prepara el payload para tu API Route /api/requests
      // Asegúrate de que los nombres de los campos coincidan con lo que espera tu route.ts
      const payload = {
        user_email: formData.email,
        job_description: formData.comentarios || "", // Combina comentarios y cualquier otra información
        category: formData.servicio,
        location: `${formData.ubicacion}, ${formData.direccion}`, // Combina ubicación y dirección
        // Añade cualquier otro campo que necesites pasar a tu API Route y que route.ts pueda procesar
        // Por ejemplo, si quieres guardar la urgencia, tendrás que añadir una columna 'urgencia' a 'requests'
        // y manejarla en tu API Route.
        urgency: formData.urgencia || null, // Optional, ensure your route.ts handles this
        // photo_file_base64: file ? await convertFileToBase64(file) : null, // If you want to send the file as base64
        // Or, you can use FormData and send the file directly if your API route is set up for it.
        // For simple JSON requests, sending base64 is an option for smaller files.
        // The original `route.ts` does not handle file uploads.
        // If you need to upload photos, you'll need to modify `src/app/api/requests/route.ts` to handle file uploads
        // (e.g., using Multer or similar for Node.js, or streaming the file directly to Supabase storage from the server).
        // For now, photo_url will be null as we are not uploading it from the client directly to Supabase Storage.
      };


      const response = await fetch("/api/requests/new", { // <-- APUNTA A TU API ROUTE
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error desconocido al enviar la solicitud.");
      }

      const result = await response.json();
      console.log("Solicitud enviada con éxito desde el modal:", result.solicitud);


      setSuccess(true); // Muestra el mensaje de éxito
      // Cierra el modal después de un tiempo
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 4500);
    } catch (err: any) {
      console.error("❌ Error al enviar presupuesto:", err.message);
      setMessage({ type: 'error', text: "❌ Hubo un error al enviar el presupuesto. Por favor, intentá de nuevo." });
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  // Obtiene las preguntas y campos del paso actual
  const { questions, fields } = steps[step];
  // Calcula el progreso de la barra
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {success ? (
          // Contenedor de éxito
          <div className={styles.successContainer}>
            <div className={styles.checkmark}>✔</div>
            <p className={styles.successMessage}>
              ¡Gracias por confiar en Laburando App! <br />
              En breve recibirás hasta 4 presupuestos.
            </p>
          </div>
        ) : (
          // Contenido del formulario paso a paso
          <>
            <div className={styles.header}>
              <h2>Solicitar presupuesto</h2>
              <button onClick={onClose} className={styles.closeButton}>✕</button>
            </div>

            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            {message && (
              <div className={`${styles.messageBox} ${styles[message.type]}`}>
                {message.text}
              </div>
            )}

            <div className={styles.stepContent}>
              {questions.map((q, i) => (
                <div key={i} className={styles.inputGroup}>
                  <label>{q}</label>
                  {/* Renderizado condicional de inputs basado en el tipo de campo */}
                  {fields[i] === "foto" ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className={styles.fileInput}
                    />
                  ) : fields[i] === "servicio" ? (
                    <select
                      value={formData.servicio || ""}
                      onChange={(e) => handleChange("servicio", e.target.value)}
                      className={styles.selectInput}
                    >
                      <option value="">Seleccioná un servicio</option>
                      {allServices.map((s, index) => (
                        <option key={index} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : fields[i] === "ubicacion" ? (
                    <select
                      value={formData.ubicacion || ""}
                      onChange={(e) => handleChange("ubicacion", e.target.value)}
                      className={styles.selectInput}
                    >
                      <option value="">Seleccioná una zona</option>
                      {Object.keys(allLocations).map((loc, index) => (
                        <option key={index} value={loc}>{loc}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={fields[i] === "email" ? "email" : "text"}
                      value={formData[fields[i]] || ""}
                      onChange={(e) => handleChange(fields[i], e.target.value)}
                      className={styles.textInput}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              {step > 0 && (
                <button onClick={prevStep} className={styles.actionButton}>Atrás</button>
              )}
              {step < steps.length - 1 ? (
                <button onClick={nextStep} className={styles.actionButton}>Siguiente</button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className={styles.actionButton}>
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