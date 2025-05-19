"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";

interface FetchOptions {
  filter?: Record<string, string | number | boolean>;
  orderBy?: string;
  ascending?: boolean;
}

export function useFetch(table: string, options?: FetchOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(table).select("*");

      if (options?.filter) {
        Object.keys(options.filter).forEach((key) => {
          query = query.eq(key, options.filter![key]);
        });
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) {
        console.error("❌ Error en la solicitud:", fetchError.message);
        setError(fetchError.message);
        setData([]);
      } else {
        setData(fetchedData ?? []);
      }
    } catch (err: any) {
      console.error("❌ Error al conectar con Supabase:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table, JSON.stringify(options)]);

  return { data, loading, error, refetch: fetchData };
}
