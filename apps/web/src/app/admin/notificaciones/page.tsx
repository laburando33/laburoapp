'use client';

import { useState } from 'react';
import { supabase } from '@lib/supabase-web';
import styles from '@styles/admin.module.css';

export default function AdminNotificacionesPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const enviarNotificacion = async () => {
    if (!title.trim() || !message.trim()) {
      setStatus('⚠️ Completá todos los campos.');
      return;
    }

    setLoading(true);
    setStatus(null);

    const { data, error } = await supabase.functions.invoke('notificacion-push', {
      body: { title, message },
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setStatus('❌ Hubo un error al enviar la notificación.');
    } else {
      setTitle('');
      setMessage('');
      setStatus(`✅ Notificación enviada a ${data?.recipients ?? 'usuarios'} con éxito.`);
    }
  };

  return (
    <main className={styles.profileContainer}>
      <h1 className={styles.title}>🔔 Notificación Push a Profesionales</h1>

      <input
        type="text"
        placeholder="Título de la notificación"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.inputField}
      />

      <textarea
        placeholder="Escribí el mensaje..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={styles.textareaField}
        rows={5}
      />

      <button
        onClick={enviarNotificacion}
        className={styles.primaryButton}
        disabled={loading}
      >
        {loading ? 'Enviando...' : '📤 Enviar Notificación'}
      </button>

      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
    </main>
  );
}
