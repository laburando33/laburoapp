import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs"; // ✅ correcto para App Router + cliente
import type { Database } from "@shared/types/supabase"; // <--- Ahora se importa desde @shared

export const supabase = createPagesBrowserClient<Database>();
