"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-web";

export default function LogoutWrapper() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) return redirect("/login?msg=auth");
      
      }
    };
    check();
  };
   [router]
  
  );

  return null;
}
