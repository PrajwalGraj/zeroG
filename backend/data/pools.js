// backend/data/pools.js

/**
 * STATIC POOL REGISTRY (MVP)
 * 
 * These addresses are placeholders.
 * Replace them with real pool addresses from:
 * - Thala DEX
 * - Liquidswap (Pontem)
 * - Merkle Trade
 */

module.exports = [
  // -----------------------
  // THALA STABLE POOLS
  // -----------------------
  {
    dex: "thala",
    poolId: "apt-usdc",
    name: "APT-USDC Stable Pool",
    lpAddress: "0x0d5b...replace_this", 
    coinA: "0x1::aptos_coin::AptosCoin",
    coinB: "0xf22bede237a07e...::asset::USDC",
  },

  {
    dex: "thala",
    poolId: "apt-usdt",
    name: "APT-USDT Stable Pool",
    lpAddress: "0x0d5b...replace_this_too",
    coinA: "0x1::aptos_coin::AptosCoin",
    coinB: "0xf22bede237a07e...::asset::USDT",
  },

  // -----------------------
  // LIQUIDSWAP POOLS
  // -----------------------
  {
    dex: "liquidswap",
    poolId: "apt-usdc-volatile",
    name: "APT-USDC Volatile Pool",
    lpAddress: "0xa5cd...replace_with_real_address",
    coinA: "0x1::aptos_coin::AptosCoin",
    coinB: "0xf22bede237a07e...::asset::USDC",
  },

  // -----------------------
  // MERKLE TRADE MARKETS
  // -----------------------
  {
    dex: "merkle",
    poolId: "eth-usdc-perp",
    name: "ETH-USDC Perp Market",
    lpAddress: "0x3bd3...replace_market_addr",
    coinA: "0xabc...::eth::ETH",
    coinB: "0xf22bede237a07e...::asset::USDC",
  }
];
