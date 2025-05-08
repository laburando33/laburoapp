import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export const useProtectedRoute = (navigation: any) => {
  useEffect(() => {
    const validate = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigation.replace("Welcome");
      }
    };

    validate();
  }, []);
};
