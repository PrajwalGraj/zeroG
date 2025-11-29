const express = require("express");
const router = express.Router();

const { fetchThalaPools, fetchLiquidswapPools, fetchMerkleMarkets } = require("../services/dexFetcher");
const { scorePools } = require("../services/scoringEngine");

/* -----------------------------------------------------------
   GET /api/scores/top-named → Top 10 pools (with dedupe)
------------------------------------------------------------ */
router.get("/top-named", async (req, res) => {
  try {
    const thala = await fetchThalaPools();
    const liquidswap = await fetchLiquidswapPools();
    const merkle = await fetchMerkleMarkets();

    const merged = [...thala, ...liquidswap, ...merkle];

    const scored = scorePools(merged);

    // 🔥 Deduplicate + sort
    const unique = new Map();
    for (const p of scored.sort((a, b) => b.score - a.score)) {
      if (!unique.has(p.poolAddress)) unique.set(p.poolAddress, p);
    }

    const result = Array.from(unique.values()).slice(0, 10);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------------
   GET /api/scores/all → ALL pools scored + deduped
------------------------------------------------------------ */
router.get("/all", async (req, res) => {
  try {
    console.log("Fetching pools for scoring...");

    // 1. FETCH ALL DEXES IN PARALLEL
    const [thala, liquidswap, merkle] = await Promise.all([
      fetchThalaPools(),
      fetchLiquidswapPools(),
      fetchMerkleMarkets()
    ]);

    // 2. FORMAT POOLS TO UNIFIED STRUCTURE
    const format = (p, dex) => {
      const A = p.attributes;
      return {
        dex,
        name: A?.name || p?.name || "Unknown",
        poolAddress: A?.address || p?.id || p.market_id || "unknown",
        tvl: Number(A?.reserve_in_usd || p.tvl || 0),
        volume24h: Number(A?.volume_usd?.h24 || p.volume_24h || 0),
        volatility: Number(A?.price_change_percentage?.h24 || p.price_change_24h || 0),
        raw: p
      };
    };

    const formatted = [
      ...thala.map(p => format(p, "thala")),
      ...liquidswap.map(p => format(p, "liquidswap")),
      ...merkle.map(p => format(p, "merkle"))
    ];

    // Remove pools with zero TVL / zero volume (junk)
    const cleaned = formatted.filter(p => p.tvl > 0 && p.volume24h > 0);

    // 3. SCORE
    const scored = scorePools(cleaned);

    // 4. SORT DESC
    scored.sort((a, b) => b.score - a.score);

    // 5. DEDUPLICATE (keep highest score)
    const uniqueMap = new Map();
    for (const pool of scored) {
      if (!uniqueMap.has(pool.poolAddress)) {
        uniqueMap.set(pool.poolAddress, pool);
      }
    }

    const unique = Array.from(uniqueMap.values());

    // FINAL RESPONSE
    res.json({
      count: unique.length,
      top: unique.slice(0, 20),
      all: unique
    });

  } catch (err) {
    console.error("Score API error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------------
   Utility: Fetch + Score + Deduplicate pools (used by all filters)
------------------------------------------------------------ */
async function loadAllPools() {
  const { fetchThalaPools, fetchLiquidswapPools, fetchMerkleMarkets } = require("../services/dexFetcher");
  const { scorePools } = require("../services/scoringEngine");

  const [thala, liquidswap, merkle] = await Promise.all([
    fetchThalaPools(),
    fetchLiquidswapPools(),
    fetchMerkleMarkets()
  ]);

  const format = (p, dex) => {
    const A = p.attributes;
    return {
      dex,
      name: A?.name || p?.name || "Unknown",
      poolAddress: A?.address || p?.id || p.market_id || "unknown",
      tvl: Number(A?.reserve_in_usd || p.tvl || 0),
      volume24h: Number(A?.volume_usd?.h24 || p.volume_24h || 0),
      volatility: Number(A?.price_change_percentage?.h24 || p.price_change_24h || 0),
      apr: Number(A?.apr || p.apr || 0),
      raw: p
    };
  };

  const formatted = [
    ...thala.map(p => format(p, "thala")),
    ...liquidswap.map(p => format(p, "liquidswap")),
    ...merkle.map(p => format(p, "merkle")),
  ];

  const cleaned = formatted.filter(p => p.tvl > 0 && p.volume24h > 0);

  const scored = scorePools(cleaned).sort((a, b) => b.score - a.score);

  // Deduplicate
  const unique = new Map();
  for (const p of scored) if (!unique.has(p.poolAddress)) unique.set(p.poolAddress, p);

  return Array.from(unique.values());
}

/* -----------------------------------------------------------
   1️⃣ BEST STABLES (USDC, USDT, USD1, modUSDT, etc)
------------------------------------------------------------ */
router.get("/best-stables", async (req, res) => {
  try {
    const all = await loadAllPools();

    const stables = all.filter(p =>
      p.name.toLowerCase().includes("usdc") ||
      p.name.toLowerCase().includes("usdt") ||
      p.name.toLowerCase().includes("usd") ||
      p.name.toLowerCase().includes("usd1") ||
      p.name.toLowerCase().includes("stable")
    );

    res.json(stables.slice(0, 15)); // top 15 stables
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------------
   2️⃣ BEST VOLATILE (remove stables)
------------------------------------------------------------ */
router.get("/best-volatile", async (req, res) => {
  try {
    const all = await loadAllPools();

    const volatile = all.filter(p =>
      !p.name.toLowerCase().includes("usdc") &&
      !p.name.toLowerCase().includes("usdt") &&
      !p.name.toLowerCase().includes("usd") &&
      !p.name.toLowerCase().includes("usd1")
    );

    res.json(volatile.slice(0, 15));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------------
   3️⃣ HIGH APR (APR > 30%)
------------------------------------------------------------ */
router.get("/high-apr", async (req, res) => {
  try {
    const all = await loadAllPools();

    const highApr = all
      .filter(p => p.apr && p.apr >= 30)
      .sort((a, b) => b.apr - a.apr);

    res.json(highApr.slice(0, 20));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------------------------------------
   4️⃣ LOW RISK (Stablecoins + low volatility)
------------------------------------------------------------ */
router.get("/low-risk", async (req, res) => {
  try {
    const all = await loadAllPools();

    const lowRisk = all.filter(p =>
      (
        p.name.toLowerCase().includes("usdc") ||
        p.name.toLowerCase().includes("usdt") ||
        p.name.toLowerCase().includes("usd") ||
        p.name.toLowerCase().includes("usd1")
      )
      && Math.abs(p.volatility) < 0.5      // low volatility
      && p.tvl > 30000                     // pools with liquidity
    );

    res.json(lowRisk.slice(0, 15));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
