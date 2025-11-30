// backend/routes/vaultRoutes.js
const express = require("express");
const router = express.Router();
const { AptosClient, AptosAccount } = require("aptos");

const NODE = process.env.APTOS_NODE_URL || "https://fullnode.mainnet.aptoslabs.com";
const client = new AptosClient(NODE);

let admin = null;

// Initialize admin account from private key
if (process.env.ADMIN_PRIVATE_KEY || process.env.ADMIN_KEY) {
  try {
    let adminKey = (process.env.ADMIN_PRIVATE_KEY || process.env.ADMIN_KEY || "").trim();
    // Remove 0x prefix and any whitespace
    adminKey = adminKey.replace(/^0x/i, "").replace(/\s/g, "");
    
    // Ensure even length
    if (adminKey.length % 2 !== 0) {
      throw new Error(`Invalid key length: ${adminKey.length} (must be even)`);
    }
    
    admin = new AptosAccount(Buffer.from(adminKey, "hex"));
    console.log("✅ Admin account loaded for vault withdrawals");
    console.log(`   Admin address: ${admin.address().hex()}`);
  } catch (err) {
    console.error("⚠️ Failed to load admin account:", err.message);
  }
} else {
  console.warn("⚠️ ADMIN_PRIVATE_KEY not set in .env - vault withdrawals will fail");
}

router.post("/withdraw", async (req, res) => {
  try {
    if (!admin) {
      return res.status(500).json({ 
        error: "Admin account not configured. Contact support." 
      });
    }

    const { user, amount } = req.body;

    if (!user || !amount) {
      return res.status(400).json({ 
        error: "Missing required fields: user, amount" 
      });
    }

    const OCTA = 100_000_000;
    const amountOcta = (amount * OCTA).toFixed(0);

    const payload = {
      type: "entry_function_payload",
      function: "0x40e2eb967aa9abb469a5d3437717560c9b77b5af2f27f99c039a7c90c0bfc42d::Vault::withdraw",
      type_arguments: [],
      arguments: [user, amountOcta],
    };

    const txnRequest = await client.generateTransaction(admin.address(), payload);
    const signedTxn = await client.signTransaction(admin, txnRequest);
    const tx = await client.submitTransaction(signedTxn);
    
    await client.waitForTransaction(tx.hash);

    res.json({
      success: true,
      message: "Withdraw submitted successfully",
      txHash: tx.hash,
    });
  } catch (err) {
    console.error("Vault withdraw error:", err);
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
