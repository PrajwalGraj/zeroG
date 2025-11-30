const express = require("express");
const router = express.Router();

// ⭐ Thala Testnet Pools (real pools still here for when API works)
const POOLS = {
  APT_USDC:
    "0x5f598886ed53da4ea3c6c479d8192c5197153e4691abee2e19ef11402bad8d27",
  APT_USDT:
    "0x0b6dc364d5c6e9ccb6c8c99bb7d342c2fe611c114f94b2368fa15e8a3d4fbac5",
};

// ⭐ Token addresses (testnet)
const TOKEN_ADDRESSES = {
  APT: "0x1::aptos_coin::AptosCoin",
  USDC:
    "0x27e28c972a63b8c58887cf07dc2d7309f5306baae8f39fa996ba8e70ef58533::asset::USDC",
  USDT:
    "0xd2e0bd1a70ffb4053db9cb38ddb8bfdcb84ce8b063a492819e93915e6a9ef5ac::asset::USDT",
};

// ⭐ Quick ping endpoint
router.get("/ping", (req, res) => {
  res.send("Thala route loaded ✔");
});

// ⭐ MAIN QUOTE ENDPOINT WITH MOCK MODE
router.post("/quote", async (req, res) => {
  try {
    const { fromSymbol, toSymbol, amount, minOut, mock } = req.body;

    console.log("QUOTE REQ BODY:", req.body);

    // 🔥 MOCK MODE (Recommended during dev)
    if (mock === true) {
      console.log("🔥 MOCK MODE ENABLED — returning fake Thala quote");

      return res.json({
        mock: true,
        success: true,
        amountIn: amount,
        expectedOut: amount * 3, // fake rate: 1 APT → 3 USDC
        txData: {
          type: "entry_function_payload",
          function:
            "0x1::managed_coin::fake_swap_for_testing_only",
          type_arguments: [],
          arguments: [
            TOKEN_ADDRESSES[fromSymbol],
            TOKEN_ADDRESSES[toSymbol],
            amount.toString(),
            (minOut || 0).toString(),
          ],
        },
      });
    }

    // 🔥 REAL API CALL (only works when Thala is reachable)
    const poolKey = `${fromSymbol}_${toSymbol}`;
    const poolId = POOLS[poolKey];

    if (!poolId)
      return res.status(400).json({ error: "Pool not found: " + poolKey });

    const chainId = 2;

    const url = `https://testnet.api.thala.fi/amm/v1/lp/quote?chainId=${chainId}&poolId=${poolId}&fromToken=${TOKEN_ADDRESSES[fromSymbol]}&toToken=${TOKEN_ADDRESSES[toSymbol]}&amount=${amount}`;

    console.log("CALLING THALA:", url);

    const response = await fetch(url);
    const data = await response.json();

    // If Thala returns error → fallback to mock
    if (!response.ok || data.error) {
      console.log("❌ Thala API error — using fallback mock data");
      return res.json({
        fallback: true,
        success: true,
        amountIn: amount,
        expectedOut: amount * 2.8,
        txData: {
          type: "entry_function_payload",
          function:
            "0x1::managed_coin::fake_swap_for_testing_only",
          type_arguments: [],
          arguments: [
            TOKEN_ADDRESSES[fromSymbol],
            TOKEN_ADDRESSES[toSymbol],
            amount.toString(),
            (minOut || 0).toString(),
          ],
        },
      });
    }

    // SUCCESS
    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    console.error("THALA QUOTE ERROR:", err);
    return res.status(502).json({
      error: "Failed to reach Thala API",
      details: err.message,
    });
  }
});

module.exports = router;
