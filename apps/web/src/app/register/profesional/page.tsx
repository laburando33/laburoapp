// src/app/register/profesional/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@lib/supabase-web";
import { toast } from "react-hot-toast";
import styles from "./register.module.css";

const allServices = [
  "Albañil", "Técnico de aire acondicionado", "Tarquino", "Electricista",
  "Durlock", "Impermeabilización de techos", "Pulidor de pisos",
  "Pintor interior", "Pintor de alturas", "Electricista matriculado",
  "Vidriería y cerramientos", "Colocación de redes de balcones", "Mudanza y fletes",
  "Pequeños arreglos", "Plomería", "Soldador", "Destapaciones pluviales y cloacales"
];

const allLocations = [
  "Ciudad de Buenos Aires", "Zona Norte GBA", "Zona Sur GBA",
  "Zona Oeste GBA", "La Plata", "Rosario", "Córdoba", "Mendoza", "Mar del Plata"
];

export default function RegistroProfesional() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    repeatPassword: "",
    phone: "+54",
    location: "",
    address: "",
    category: "",
    acepta: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.repeatPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (!form.acepta) {
      toast.error("Debes aceptar los Términos y Condiciones");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone,
            location: `${form.location}, ${form.address}`,
            category: form.category,
            role: "profesional",
            is_professional: true,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
      });

      if (error || !data.user) {
        toast.error("Error al registrar: " + error?.message);
        return;
      }

      const { error: profileError } = await supabase.from("professionals").insert({
        user_id: data.user.id,
        email: form.email,
        full_name: form.full_name,
        phone: form.phone,
        location: `${form.location}, ${form.address}`,
        category: form.category,
        is_verified: false,
        role: "profesional",
        created_at: new Date(),
      });

      if (profileError) {
        toast.error("Error al crear perfil: " + profileError.message);
      } else {
        toast.success("Revisá tu correo para confirmar tu cuenta.");
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch (e) {
      toast.error("Error inesperado: " + e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.profileContainer}>
      <h1 className={styles.title}>Registro Profesional</h1>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <label>Nombre completo</label>
        <input name="full_name" value={form.full_name} onChange={handleChange} required />

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />

        <label>Contraseña</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />

        <label>Repetir contraseña</label>
        <input name="repeatPassword" type="password" value={form.repeatPassword} onChange={handleChange} required />

        <label>Teléfono</label>
        <input name="phone" type="tel" value={form.phone} onChange={handleChange} required />

        <label>Localidad</label>
        <select name="location" value={form.location} onChange={handleChange} required>
          <option value="">Seleccionar...</option>
          {allLocations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
        </select>

        <label>Domicilio</label>
        <input name="address" value={form.address} onChange={handleChange} required />

        <label>Categoría</label>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Seleccionar...</option>
          {allServices.map((serv, i) => <option key={i} value={serv}>{serv}</option>)}
        </select>

        <label>
          <input type="checkbox" name="acepta" checked={form.acepta} onChange={handleChange} /> Acepto los Términos y Condiciones
        </label>

        <button type="submit" className={styles.saveButton} disabled={loading}>
          {loading ? "Registrando..." : "Registrarme"}
        </button>
      </form>
    </main>
  );
}
