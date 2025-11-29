const express = require("express");
const router = express.Router();

const { getPoolReserves } = require("../services/poolReserves");

// GET /api/pools/onchain/:address
router.get("/:address", async (req, res) => {
  try {
    const poolAddress = req.params.address;

    const reserves = await getPoolReserves(poolAddress);

    res.json({
      poolAddress,
      reserves
    });

  } catch (err) {
    console.error("Onchain pool error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
