const { AptosClient, AptosAccount } = require("aptos");
require("dotenv").config();

const NODE = process.env.APTOS_NODE || "https://fullnode.testnet.aptoslabs.com";
const client = new AptosClient(NODE);

let deployer = null;

if (process.env.DEPLOYER_PRIVATE_KEY) {
  const hex = process.env.DEPLOYER_PRIVATE_KEY.replace("0x", "");
  const bytes = Buffer.from(hex, "hex"); // convert to raw bytes
  deployer = new AptosAccount(bytes);    // create AptosAccount
} else {
  console.warn("⚠️ DEPLOYER_PRIVATE_KEY missing in .env");
}

module.exports = { client, deployer };
