// src/app/admin/actions/verificarProfesional.ts
'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function verificarProfesional(
  user_id: string,
  nuevoEstado: 'verificado' | 'rechazado' | 'pendiente',
  comentario: string = '',
  professionalName: string = '',
  professionalEmail: string = ''
): Promise<{ success: boolean; error?: string }> {

  if (!user_id || !nuevoEstado) {
    return { success: false, error: 'Faltan datos para verificar.' };
  }

  const updates = {
    verificacion_status: nuevoEstado,
    is_verified: nuevoEstado === 'verificado',
    comentario,
    verified_at: nuevoEstado === 'verificado' ? new Date().toISOString() : null
  }

  const { error: updateError } = await supabaseAdmin
    .from('professionals')
    .update(updates)
    .eq('user_id', user_id)

  if (updateError) {
    console.error('Error actualizando estado en professionals:', updateError);
    return { success: false, error: `Error actualizando estado: ${updateError.message}` };
  }

  const { error: histError } = await supabaseAdmin.from('verification_history').insert({
    user_id,
    full_name: professionalName,
    email: professionalEmail,
    // Aseguramos que ambas columnas 'estado' y 'status' reciban el mismo valor
    // Esto es necesario porque ambas son NOT NULL según tu esquema.
    estado: nuevoEstado, // Columna 'estado' en verification_history
    status: nuevoEstado, // ✅ Columna 'status' en verification_history (¡nueva adición!)
    comentario
  })

  if (histError) {
    console.error('Error guardando historial:', histError);
    return { success: false, error: `Error guardando historial: ${histError.message}` };
  }

  return { success: true };
}