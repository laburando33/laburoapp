// src/components/admin/VerificarProfesionales.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@lib/supabase-web';
import styles from '@styles/admin.module.css';
import { verificarProfesional } from '@admin/actions/verificarProfesional';

// Define la interfaz de tus datos de verificación
interface Verificacion {
  user_id: string;
  estado: string; // Esto es el estado de la tabla verificaciones_profesionales
  dni_url: string;
  certificado_url: string;
  constancia_domicilio_url: string; // ✅ Asegúrate de que esta esté en tu esquema y la estás seleccionando
  trabajos_urls: string[];
  professionals: {
    full_name: string;
    email: string;
  };
}

export default function VerificacionAdminPage() {
  const [pendientes, setPendientes] = useState<Verificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('verificaciones_profesionales')
        .select(`
          user_id,
          estado,
          dni_url,
          certificado_url,
          constancia_domicilio_url,
          trabajos_urls,
          professionals (
            full_name,
            email
          )
        `)
        .eq('estado', 'pendiente');

      if (fetchError) {
        throw new Error(`Error al cargar las verificaciones pendientes: "${fetchError.details}" (line ${fetchError.line}, column ${fetchError.column})`);
      }
      setPendientes(data || []);
    } catch (err: any) {
      console.error('Error en fetchPendientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendientes();
  }, [fetchPendientes]);

  const confirmarAccion = async (
    pro: Verificacion,
    estado: 'verificado' | 'rechazado'
  ) => {
    let comentario: string | null = null;

    if (estado === 'rechazado') {
      comentario = prompt('Ingrese un comentario para el rechazo (opcional):');
      if (comentario === null) {
        return;
      }
    }

    try {
      const result = await verificarProfesional(
        pro.user_id,
        estado, // 'verificado' o 'rechazado'
        comentario || '',
        pro.professionals.full_name,
        pro.professionals.email
      );

      if (!result.success) {
        alert(`Error al realizar la acción: ${result.error}`);
        console.error('Error al verificar/rechazar:', result.error);
      } else {
        alert(`Profesional ${estado} correctamente.`);
        fetchPendientes();
      }
    } catch (err: any) {
      alert(`Error inesperado: ${err.message}`);
      console.error('Error inesperado al verificar/rechazar:', err);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Verificación de Profesionales</h1>
      <button onClick={fetchPendientes} className={styles.refreshButton}>
        Actualizar lista
      </button>

      {loading ? (
        <p className={styles.loading}>⏳ Cargando...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : pendientes.length === 0 ? (
        <p>No hay verificaciones pendientes.</p>
      ) : (
        <ul className={styles.cardList}>
          {pendientes.map((pro) => (
            <li key={pro.user_id} className={styles.cardItem}>
              <div>
                <strong>{pro.professionals.full_name}</strong> – {pro.professionals.email}
              </div>
              <div className={styles.fileLinks}>
                <a href={pro.dni_url} target="_blank" rel="noopener noreferrer">📄 DNI</a> |{' '}
                <a href={pro.certificado_url} target="_blank" rel="noopener noreferrer">📄 Certificado</a> |{' '}
                {pro.constancia_domicilio_url && (
                    <>
                        <a href={pro.constancia_domicilio_url} target="_blank" rel="noopener noreferrer">📄 Constancia Domicilio</a> |{' '}
                    </>
                )}
                {pro.trabajos_urls?.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer">📁 Trabajo {idx + 1}</a>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => confirmarAccion(pro, 'verificado')}
                  className={styles.primaryButton}
                >
                  ✅ Verificar
                </button>
                <button
                  onClick={() => confirmarAccion(pro, 'rechazado')}
                  className={styles.dangerButton}
                >
                  ❌ Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}