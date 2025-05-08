// apps/mobile/roleRedirect.ts
import { supabase } from "./lib/supabase";
import { navigationRef } from "./navigationRef";

export const roleRedirect = async (userId: string) => {
  const { data, error } = await supabase
    .from("professionals")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("❌ Error obteniendo rol:", error.message);
    return;
  }

  if (data) {
    navigationRef.navigate("Dashboard");
  } else {
    navigationRef.navigate("InvitadoHome");
  }
};
