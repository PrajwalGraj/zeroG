const express = require("express");
const router = express.Router();
const { createLaunch, commitLaunch } = require("../utils/contractWrapper");

// Create Launch
// Body: { token, cap_per_wallet, window_seconds }
router.post("/create", async (req, res) => {
  try {
    const { token, cap_per_wallet, window_seconds } = req.body;

    if (!token || !cap_per_wallet || !window_seconds) {
      return res.status(400).json({
        error: "token, cap_per_wallet, and window_seconds are required",
      });
    }

    const tx = await createLaunch(token, cap_per_wallet, window_seconds);

    return res.json({
      success: true,
      txHash: tx.hash,
      creator: tx.sender,
      message: "Launch created successfully!",
    });
  } catch (err) {
    console.error("Launch create error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// Commit to Launch
// Body: { launch_creator, amount }
router.post("/commit", async (req, res) => {
  try {
    const { launch_creator, amount } = req.body;

    if (!launch_creator || !amount) {
      return res.status(400).json({
        error: "launch_creator and amount are required",
      });
    }

    const tx = await commitLaunch(launch_creator, amount);

    return res.json({
      success: true,
      txHash: tx.hash,
      message: "Commit successful!",
    });
  } catch (err) {
    console.error("Commit error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;
