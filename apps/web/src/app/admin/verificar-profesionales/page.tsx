"use client";

import { useEffect, useState } from "react";
import VerificarProfesionales from "@components/admin/VerificarProfesionales";
export default function VerificarProfesionalesPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>✅ Verificar Profesionales</h1>
      <VerificarProfesionales />
    </div>
  );
}
