"use client";

import { useState, useEffect } from "react";

export function usePools() {
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchPools() {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendUrl}/api/scores/top10`);
      const data = await res.json();
      setPools(data);
    } catch (err) {
      console.error("Error fetching pools:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPools();
  }, []);

  return { pools, loading };
}
