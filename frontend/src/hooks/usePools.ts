"use client";

import { useState, useEffect } from "react";

export function usePools() {
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchPools() {
    try {
      const res = await fetch("http://localhost:4000/api/scores/top10");
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
