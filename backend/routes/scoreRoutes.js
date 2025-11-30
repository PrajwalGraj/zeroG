const express = require("express");
const router = express.Router();

const { fetchThalaPools, fetchLiquidswapPools } = require("../services/dexFetcher");
const { scorePools } = require("../services/scoringEngine");

/* -----------------------------------------------------------
   UNIFIED FORMATTER
------------------------------------------------------------ */
function formatPool(p, dex) {
  const raw = p.raw || p;

  return {
    dex: dex,
    name: raw.name || p.name || "Unknown",
    poolAddress: raw.address || p.poolAddress || p.id || "unknown",
    tvl: Number(raw.reserve_in_usd || p.tvl || 0),
    volume24h: Number(raw.volume_usd?.h24 || p.volume24h || 0),
    volatility: Number(raw.price_change_percentage?.h24 || p.volatility || 0),
    apr: Number(raw.apr || p.apr || 0),
    raw
  };
}

/* -----------------------------------------------------------
   LOAD + FORMAT + SCORE + DEDUPE POOLS
------------------------------------------------------------ */
async function loadAllPools() {
  const [thala, liquidswap] = await Promise.all([
    fetchThalaPools(),
    fetchLiquidswapPools()
  ]);

  const formatted = [
    ...thala.map(p => formatPool(p, "thala")),
    ...liquidswap.map(p => formatPool(p, "liquidswap"))
  ];

  // Remove useless pools
  const cleaned = formatted.filter(p => p.tvl > 0 && p.volume24h > 0);

  // Score them
  let scored = scorePools(cleaned);

  // Sort descending
  scored = scored.sort((a, b) => b.score - a.score);

  // Dedupe by pool address
  const unique = new Map();
  for (const p of scored) {
    if (!unique.has(p.poolAddress)) unique.set(p.poolAddress, p);
  }

  // Return final list with guaranteed score field
  return Array.from(unique.values()).map(p => ({
    ...p,
    score: p.score ?? 0
  }));
}

/* -----------------------------------------------------------
   /api/scores/debug
------------------------------------------------------------ */
router.get("/debug", async (req, res) => {
  try {
    const thala = await fetchThalaPools();
    const liquidswap = await fetchLiquidswapPools();

    res.json({
      thala_count: thala.length,
      liquidswap_count: liquidswap.length,
      sample_thala: thala[0] || null,
      sample_liquidswap: liquidswap[0] || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------------
   /api/scores/top10 → BEST POOLS
------------------------------------------------------------ */
router.get("/top10", async (req, res) => {
  try {
    const all = await loadAllPools();
    res.json(all.slice(0, 10));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------------
   BEST STABLES
------------------------------------------------------------ */
router.get("/best-stables", async (req, res) => {
  try {
    const all = await loadAllPools();

    const stables = all.filter(p => {
      const name = p.name.toLowerCase();
      return (
        name.includes("usdc") ||
        name.includes("usdt") ||
        name.includes("usd") ||
        name.includes("usd1") ||
        name.includes("stable")
      );
    });

    res.json(stables.slice(0, 15));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------------
   BEST VOLATILE
------------------------------------------------------------ */
router.get("/best-volatile", async (req, res) => {
  try {
    const all = await loadAllPools();

    const volatile = all.filter(p => {
      const name = p.name.toLowerCase();
      return (
        !name.includes("usdc") &&
        !name.includes("usdt") &&
        !name.includes("usd") &&
        !name.includes("usd1")
      );
    });

    res.json(volatile.slice(0, 15));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------------
   HIGH APR ( > 30% )
------------------------------------------------------------ */
router.get("/high-apr", async (req, res) => {
  try {
    const all = await loadAllPools();

    const highApr = all
      .filter(p => p.apr >= 30)
      .sort((a, b) => b.apr - a.apr);

    res.json(highApr.slice(0, 20));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------------
   LOW RISK (stablecoin + low volatility)
------------------------------------------------------------ */
router.get("/low-risk", async (req, res) => {
  try {
    const all = await loadAllPools();

    const lowRisk = all.filter(p => {
      const name = p.name.toLowerCase();
      return (
        (name.includes("usdc") ||
          name.includes("usdt") ||
          name.includes("usd") ||
          name.includes("usd1")) &&
        Math.abs(p.volatility) < 0.5 &&
        p.tvl > 30000
      );
    });

    res.json(lowRisk.slice(0, 15));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
