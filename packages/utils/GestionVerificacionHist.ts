import { supabase } from "@lib/supabase-web";


export type VerifHistRow =
  Database["public"]["Tables"]["verification_history"]["Row"];

export async function fetchMiHistorial(): Promise<VerifHistRow[]> {
  const { data, error } = await supabase
    .from("verification_history")
    .select("*")
    .order("verified_at", { ascending: false });

  if (error) throw error;
  return data;
}
