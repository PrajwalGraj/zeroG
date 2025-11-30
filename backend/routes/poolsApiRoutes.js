const express = require("express");
const router = express.Router();

const {
  fetchThalaPools,
  fetchLiquidswapPools,
  fetchMerkleMarkets,
} = require("../services/dexFetcher");

// =========================
// TEST EACH DEX ENDPOINT
// =========================

// GET /api/pools/thala
router.get("/thala", async (req, res) => {
  try {
    const data = await fetchThalaPools();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pools/liquidswap
router.get("/liquidswap", async (req, res) => {
  try {
    const data = await fetchLiquidswapPools();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pools/merkle
router.get("/merkle", async (req, res) => {
  try {
    const data = await fetchMerkleMarkets();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pools/all → combine data
router.get("/all", async (req, res) => {
  try {
    const thala = await fetchThalaPools();
    const liquidswap = await fetchLiquidswapPools();
    const merkle = await fetchMerkleMarkets();

    res.json({ thala, liquidswap, merkle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
