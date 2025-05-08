import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs"; // ✅ correcto para App Router + cliente
import type { Database } from "@/types/supabase";

export const supabase = createPagesBrowserClient<Database>();
