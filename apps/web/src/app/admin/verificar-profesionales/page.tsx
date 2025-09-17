// src/app/admin/verificar-profesionales/page.tsx
"use client";

import { useEffect, useState } from "react"; // Estas importaciones no son estrictamente necesarias aquí, pero no causan daño
import VerificarProfesionales from "@components/admin/VerificarProfesionales"; // Asegúrate que esta ruta es correcta
export default function VerificarProfesionalesPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <VerificarProfesionales />
    </div>
  );
}