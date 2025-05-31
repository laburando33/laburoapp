// /professional/shop/page.tsx
"use client";

import Shop from "@components/professional/Shop";
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase-web";

export default function ShopPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  if (!userId) {
    return <p>⚠️ Debes iniciar sesión para acceder a esta página.</p>;
  }

  return <Shop userId={userId} />;
}
