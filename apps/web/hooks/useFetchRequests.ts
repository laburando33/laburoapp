import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-web";

export const useFetchRequests = (filters: Record<string, any> = {}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const query = supabase.from("requests").select("*");

        // Aplicar filtros
        Object.entries(filters).forEach(([key, value]) => {
          query.eq(key, value);
        });

        const { data, error } = await query;

        if (error) throw error;
        setRequests(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [filters]);

  return { requests, loading, error };
};
