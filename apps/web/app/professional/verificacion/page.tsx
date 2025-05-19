"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";
import styles from "./verificacion.module.css";

interface VerificationStatus {
  status: string;
  verified_at: string | null;
}

export default function Verificacion() {
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVerification = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error("❌ Usuario no autenticado");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("verification_history")
        .select("status, verified_at")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (error) {
        console.error("❌ Error al cargar verificación:", error.message);
      } else {
        setVerification(data);
      }

      setLoading(false);
    };

    fetchVerification();
  }, []);

  return (
    <div className={styles.verificationContainer}>
      <h2 className={styles.title}>Estado de Verificación</h2>
      {loading ? (
        <p>Cargando información...</p>
      ) : verification ? (
        <div className={styles.statusContainer}>
          <p><strong>Estado:</strong> {verification.status}</p>
          {verification.verified_at && (
            <p><strong>Verificado el:</strong> {new Date(verification.verified_at).toLocaleDateString()}</p>
          )}
        </div>
      ) : (
        <p>No se encontraron datos de verificación.</p>
      )}
    </div>
  );
}
