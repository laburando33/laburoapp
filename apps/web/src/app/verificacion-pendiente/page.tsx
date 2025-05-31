'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase-web'; // ✅ Esto es correcto, ya que uses createPagesBrowserClient
import styles from '@styles/admin.module.css';
import { verificarProfesional } from '@admin/actions/verificarProfesional.ts'; // Asegúrate de que esta ruta sea correcta


interface Verificacion {
  user_id: string;
  estado: string;
  dni_url: string;
  certificado_url: string;
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

  const fetchPendientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('verificaciones_profesionales')
        .select(`
          user_id,
          estado,
          dni_url,
          certificado_url,
          trabajos_urls,
          professionals (
            full_name,
            email
          )
        `)
        .eq('estado', 'pendiente');

      if (error) throw error;
      setPendientes(data || []);
    } catch (err: any) {
      setError('Error al cargar verificaciones.');
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendientes();
  }, []);

  const confirmarAccion = async (
    pro: Verificacion,
    nuevoEstado: 'verificado' | 'rechazado'
  ) => {
    const confirm = window.confirm(
      `¿Confirmás marcar como "${nuevoEstado}" a ${pro.professionals.full_name}?`
    );
    if (!confirm) return;

    try {
      // Actualizar verificación
      await supabase
        .from('verificaciones_profesionales')
        .update({
          estado: nuevoEstado,
          verified_at: new Date().toISOString(),
        })
        .eq('user_id', pro.user_id);

      // Actualizar y registrar historial con función server
      await verificarProfesional(pro.user_id, nuevoEstado, '');

      alert(`✅ Profesional ${nuevoEstado}`);
      fetchPendientes();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>🛂 Verificación de Profesionales</h1>

      <button onClick={fetchPendientes} className={styles.secondaryButton}>
        🔄 Recargar lista
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
                <a href={pro.dni_url} target="_blank">📄 DNI</a> |{' '}
                <a href={pro.certificado_url} target="_blank">📄 Certificado</a> |{' '}
                {pro.trabajos_urls?.map((url, idx) => (
                  <a key={idx} href={url} target="_blank">📁 Trabajo {idx + 1}</a>
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
