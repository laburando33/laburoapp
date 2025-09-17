"use client";
import { useEffect, useState } from "react";
import { fetchMiHistorial, VerifHistRow } from "@utils/GestionVerificacionHist";

export default function useMiHistorial() {
  const [data, setData] = useState<VerifHistRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMiHistorial().then(setData).finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
