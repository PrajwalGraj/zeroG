// backend/utils/onchain.js
const { AptosClient } = require("aptos");
require("dotenv").config();

const NODE = process.env.APTOS_NODE || "https://fullnode.testnet.aptoslabs.com";
const client = new AptosClient(NODE);

/**
 * Generic helper: try to read several common resource types that DEX pools use.
 * Returns { ok: true, data } or { ok: false, error }
 */
async function readAnyResource(address, candidates) {
  for (const r of candidates) {
    try {
      const res = await client.getAccountResource(address, r);
      if (res && res.data) return { ok: true, resourceType: r, data: res.data };
    } catch (e) {
      // ignore and try next
    }
  }
  return { ok: false, error: "not_found" };
}

/**
 * Known resource type candidates (common patterns on Aptos DEXs).
 * Add more when you discover a new DEX resource type.
 */
const COMMON_POOL_RESOURCES = [
  // Thala v2 / swap pair resource patterns
  "0x7730cd28ee1cdc9e999336cbc430f99e7c44397c0aa77516f6f23a78559bb5::swap::TokenPairReserve",
  // Liquidswap common pool (example token pair resource)
  "0x1::liquidity_pool::PoolLiquidity",
  // Generic TokenPairReserve pattern (gecko/etc use this style)
  "0xC7EFB4076DBE143CB...::swap::TokenPairReserve", // placeholder to show pattern
];

/**
 * Parse a TokenPairReserve-like shape into { reserveA, reserveB, lpSupply, fee } (best-effort).
 * We don't assume exact field names; attempt several common ones.
 */
function normalizeReserveData(data) {
  // common field names seen: reserve_x/reserve_y, reserve_a/reserve_b, x_reserve/y_reserve, lp_supply, lp_supply_amount
  const get = (keys) => {
    for (const k of keys) {
      if (k in data) return data[k];
    }
    return null;
  };

  return {
    reserveA: get(["reserve_x", "reserve_a", "x_reserve", "reserve0", "reserve1"]) || null,
    reserveB: get(["reserve_y", "reserve_b", "y_reserve", "reserve1", "reserve0"]) || null,
    lpSupply: get(["lp_supply", "lp_supply_amount", "supply", "total_supply"]) || null,
    fee: get(["fee_bps", "fee", "pool_fee", "fee_percent"]) || null,
    raw: data
  };
}

/**
 * Public: getPoolReserves(pool)
 * pool.lpAddress must be an on-chain account that stores the pool resource.
 */
async function getPoolReserves(pool) {
  const address = pool.lpAddress;
  if (!address) return null;

  // try known candidates first, then fallback to reading any resource on account
  const candidates = [
    // common names used by popular DEXes (you can expand)
    `${pool.modulePrefix ?? "0x1"}::swap::TokenPairReserve`,   // try common pattern
    "0x1::liquidity_pool::PoolLiquidity",
    // fallback: try a short list; readAll is expensive so we avoid it
    ...COMMON_POOL_RESOURCES
  ];

  const result = await readAnyResource(address, candidates);
  if (!result.ok) {
    // last-resort: attempt to fetch all resources and pick the first with reserve-like fields
    try {
      const all = await client.getAccountResources(address);
      for (const r of all) {
        const d = r.data || {};
        if (("reserve_x" in d) || ("reserve_a" in d) || ("lp_supply" in d)) {
          return normalizeReserveData(d);
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  return normalizeReserveData(result.data);
}

module.exports = { getPoolReserves, normalizeReserveData };
