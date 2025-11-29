const express = require("express");
const router = express.Router();

const {
  fetchThalaPools,
  fetchLiquidswapPools,
  fetchMerkleMarkets,
} = require("../services/dexFetcher");

const { findPoolInfo } = require("../services/poolInfo");

// Get full metadata for a pool based on poolAddress
router.get("/info/:address", async (req, res) => {
  try {
    const poolAddress = req.params.address;
    const info = await findPoolInfo(poolAddress);

    if (!info) {
      return res.status(404).json({ error: "Pool not found" });
    }

    res.json(info);
  } catch (err) {
    console.error("Pool info error:", err);
    res.status(500).json({ error: "Failed to fetch pool info" });
  }
});


// return combined DEX pools
router.get("/all", async (req, res) => {
  try {
    const thala = await fetchThalaPools();
    const liquidswap = await fetchLiquidswapPools();
    const merkle = await fetchMerkleMarkets();

    res.json({
      thala,
      liquidswap,
      merkle,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch pools" });
  }
});

// 🔍 DEBUG ROUTE — Identify real pools by address
router.get("/debug", async (req, res) => {
  try {
    const thala = await fetchThalaPools();
    const liquidswap = await fetchLiquidswapPools();

    res.json({
      thala: thala.slice(0, 5).map(p => ({
        address: p?.attributes?.address,
        tvl: p?.attributes?.reserve_in_usd,
        price: p?.attributes?.price_usd
      })),
      liquidswap: liquidswap.slice(0, 5).map(p => ({
        address: p?.attributes?.address,
        tvl: p?.attributes?.reserve_in_usd,
        price: p?.attributes?.price_usd
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚨 VERY IMPORTANT: export router at the end
module.exports = router;
