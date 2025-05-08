import { supabase } from "./supabase";

export const redirectByUserRole = async (userId: string, navigation: any) => {
  const { data, error } = await supabase
    .from("professionals")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error consultando rol:", error.message);
    return navigation.replace("Dashboard");
  }

  if (data) {
    return navigation.replace("ProfessionalDashboard");
  } else {
    return navigation.replace("Dashboard");
  }
};
