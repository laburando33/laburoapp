'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-web';
import styles from './MensajesAdmin.module.css';

export default function MensajesAdmin() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const enviarMensajes = async () => {
    if (!subject.trim() || !message.trim()) {
      setStatus('⚠️ Completá asunto y mensaje.');
      return;
    }

    setLoading(true);
    setStatus(null);

    const { data, error } = await supabase.functions.invoke('email-masivo', {
      body: { subject, message },
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setStatus('❌ Error al enviar correos.');
    } else {
      setSubject('');
      setMessage('');
      setStatus(`✅ Correos enviados correctamente.`);
    }
  };

  return (
    <div className={styles.container}>
      <h1>📬 Enviar Mail Masivo</h1>

      <input
        type="text"
        className={styles.input}
        placeholder="Asunto del mensaje"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />

      <textarea
        className={styles.textarea}
        placeholder="Escribí tu mensaje aquí..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={enviarMensajes}
        className={styles.sendBtn}
        disabled={loading}
      >
        {loading ? 'Enviando...' : '📤 Enviar a todos'}
      </button>

      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
    </div>
  );
}
