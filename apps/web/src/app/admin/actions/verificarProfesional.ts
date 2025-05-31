// lib/actions/verificarProfesional.ts
'use server'

import { supabase } from '@lib/supabase-web'

/**
 * Cambia el estado de verificación de un profesional y lo registra en el historial.
 */
export async function verificarProfesional(
  user_id: string,
  nuevoEstado: 'verificado' | 'rechazado' | 'pendiente',
  comentario: string = ''
): Promise<void> {
  if (!user_id || !nuevoEstado) {
    throw new Error('Faltan datos para verificar.')
  }

  const updates = {
    verificacion_status: nuevoEstado,
    is_verified: nuevoEstado === 'verificado',
    comentario,
    verified_at: nuevoEstado === 'verificado' ? new Date().toISOString() : null
  }

  const { error: updateError } = await supabase
    .from('professionals')
    .update(updates)
    .eq('user_id', user_id)

  if (updateError) throw new Error(`Error actualizando estado: ${updateError.message}`)

  const { error: histError } = await supabase.from('verification_history').insert({
    user_id,
    estado: nuevoEstado,
    comentario
  })

  if (histError) throw new Error(`Error guardando historial: ${histError.message}`)
}
