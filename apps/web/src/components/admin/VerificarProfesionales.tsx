// src/app/admin/verificar-profesionales/page.tsx
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
  professionals: { // Relación con la tabla 'professionals' para obtener el nombre y email
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
        .from('verificaciones_profesionales') // Correcto: consulta la tabla de verificaciones
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
    // Opcional: Suscripción Realtime para actualizaciones en tiempo real si se añaden nuevas verificaciones
    const channel = supabase
      .channel('verificaciones_pendientes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'verificaciones_profesionales', filter: 'estado=eq.pendiente' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Cuando una nueva solicitud pendiente llega, añadirla a la lista
            setPendientes((prev) => [...prev, payload.new as Verificacion]);
          } else if (payload.eventType === 'UPDATE' && payload.new.estado !== 'pendiente') {
            // Cuando una solicitud deja de ser pendiente (se verifica/rechaza), removerla
            setPendientes((prev) => prev.filter((p) => p.user_id !== payload.old?.user_id));
          }
          // Si una existente pasa a pendiente, también la agregamos
          if (payload.eventType === 'UPDATE' && payload.new.estado === 'pendiente' && !pendientes.some(p => p.user_id === payload.new.user_id)) {
            fetchPendientes(); // O una lógica más fina para añadirla directamente
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Dependencias: solo se ejecuta una vez al montar


  const confirmarAccion = async (pro: Verificacion, estado: 'verificado' | 'rechazado') => {
    const comentario = estado === 'rechazado' ? prompt('Ingrese un comentario para el rechazo (opcional):') : null;

    if (estado === 'rechazado' && comentario === null) {
      // Si se cancela el prompt de rechazo
      return;
    }

    try {
      const result = await verificarProfesional({
        user_id: pro.user_id,
        estado,
        comentario: comentario || undefined, // undefined para no enviar null si no hay comentario
      });

      if (result.error) {
        alert(`Error al realizar la acción: ${result.error}`);
        console.error('Error al verificar/rechazar:', result.error);
      } else {
        alert(`Profesional ${estado} correctamente.`);
        fetchPendientes(); // Vuelve a cargar la lista para reflejar el cambio
      }
    } catch (err: any) {
      alert(`Error inesperado: ${err.message}`);
      console.error('Error inesperado al verificar/rechazar:', err);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>✅ Verificar Profesionales</h1>
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