// scripts/initVault.js
// Initialize the Vault contract by calling init()

require("dotenv").config();
const { AptosClient, AptosAccount, TxnBuilderTypes, BCS } = require("aptos");

const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com";
const client = new AptosClient(NODE_URL);

async function initializeVault() {
  try {
    // Load admin account
    const adminKeyHex = (process.env.ADMIN_PRIVATE_KEY || process.env.ADMIN_KEY || "")
      .trim()
      .replace(/^0x/i, "")
      .replace(/\s/g, "");

    if (!adminKeyHex) {
      throw new Error("ADMIN_PRIVATE_KEY not found in .env");
    }

    if (adminKeyHex.length % 2 !== 0) {
      throw new Error(`Admin key has odd length: ${adminKeyHex.length}`);
    }

    const admin = new AptosAccount(Buffer.from(adminKeyHex, "hex"));
    console.log("Admin address:", admin.address().hex());

    // Check if already initialized
    try {
      const vaultResource = await client.getAccountResource(
        admin.address().hex(),
        "0x40e2eb967aa9abb469a5d3437717560c9b77b5af2f27f99c039a7c90c0bfc42d::Vault::VaultData"
      );
      console.log("⚠️  Vault already initialized!");
      console.log("Total balance:", vaultResource.data.total_balance);
      return;
    } catch (err) {
      console.log("Vault not initialized yet, proceeding with init...");
    }

    // Build init transaction
    const payload = {
      type: "entry_function_payload",
      function: "0x40e2eb967aa9abb469a5d3437717560c9b77b5af2f27f99c039a7c90c0bfc42d::Vault::init",
      type_arguments: [],
      arguments: [],
    };

    console.log("\nSubmitting init transaction...");
    const txnRequest = await client.generateTransaction(admin.address(), payload);
    const signedTxn = await client.signTransaction(admin, txnRequest);
    const transactionRes = await client.submitTransaction(signedTxn);
    
    console.log("Transaction hash:", transactionRes.hash);
    console.log("Waiting for confirmation...");
    
    await client.waitForTransaction(transactionRes.hash);
    
    console.log("✅ Vault initialized successfully!");

    // Verify initialization
    const vaultResource = await client.getAccountResource(
      admin.address().hex(),
      "0x40e2eb967aa9abb469a5d3437717560c9b77b5af2f27f99c039a7c90c0bfc42d::Vault::VaultData"
    );
    console.log("\nVault state:");
    console.log("- Total balance:", vaultResource.data.total_balance);
    
  } catch (error) {
    console.error("❌ Error initializing vault:", error.message);
    if (error.message.includes("SEQUENCE_NUMBER")) {
      console.log("\n💡 Try again in a few seconds - previous transaction may still be pending");
    }
    throw error;
  }
}

initializeVault()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
