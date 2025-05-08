// app/profesionales/list.ts

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getProfessionalsByService(servicio: string) {
  const { data, error } = await supabase
    .from("professional_services")
    .select(`
      professionals (
        user_id,
        full_name,
        email,
        phone,
        avatar_url,
        location,
        category
      ),
      services (
        name
      )
    `)
    .eq("services.name", servicio);

  if (error) {
    console.error("Error al traer profesionales:", error.message);
    return [];
  }

  return data;
}
