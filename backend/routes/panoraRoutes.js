const express = require("express");
const { getPanoraQuote } = require("../services/panoraFetcher");

const router = express.Router();

router.post("/quote", async (req, res) => {
  try {
    const query = req.body || {};

    if (!query.fromTokenAddress || !query.toTokenAddress) {
      return res.status(400).json({ error: "Missing token addresses" });
    }
    if (!query.toWalletAddress) {
      return res.status(400).json({ error: "Missing toWalletAddress" });
    }
    if (!query.fromTokenAmount && !query.toTokenAmount) {
      return res.status(400).json({ error: "Send fromTokenAmount OR toTokenAmount" });
    }

    const result = await getPanoraQuote(query);

    return res.status(result.status).json(result.data);
  } catch (err) {
    console.error("Panora Route Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
