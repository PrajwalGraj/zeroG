const axios = require("axios");

// ---- THALA ----
async function fetchThalaPools() {
  try {
    const { data } = await axios.get(
      "https://api.geckoterminal.com/api/v2/networks/aptos/pools?dex=thala",
      { headers: { "User-Agent": "Mozilla/5.0" }}
    );

    return (data?.data || []).map(p => ({
      dex: "thala",
      poolAddress: p?.attributes?.address,
      name: p?.attributes?.name,               // <-- add this
      tvl: Number(p?.attributes?.reserve_in_usd),
      volume24h: Number(p?.attributes?.volume_usd?.h24),
      volatility: Number(p?.attributes?.price_change_percentage?.h24),
      raw: p?.attributes
    }));
  } catch (err) {
    console.log("Thala error:", err.message);
    return [];
  }
}


// ---- LIQUIDSWAP ----
async function fetchLiquidswapPools() {
  try {
    const { data } = await axios.get(
      "https://api.geckoterminal.com/api/v2/networks/aptos/pools?dex=liquidswap",
      { headers: { "User-Agent": "Mozilla/5.0" }}
    );

    return (data?.data || []).map(p => ({
      dex: "liquidswap",
      poolAddress: p?.attributes?.address,
      name: p?.attributes?.name,               // <-- add this
      tvl: Number(p?.attributes?.reserve_in_usd),
      volume24h: Number(p?.attributes?.volume_usd?.h24),
      volatility: Number(p?.attributes?.price_change_percentage?.h24),
      raw: p?.attributes
    }));
  } catch (err) {
    console.log("Liquidswap error:", err.message);
    return [];
  }
}


// ---- MERKLE (real markets API) ----
async function fetchMerkleMarkets() {
  try {
    const { data } = await axios.get(
      "https://api.prod.merkle.trade/v1/markets",
      { headers: { "User-Agent": "Mozilla/5.0" }}
    );
    return data?.markets || [];
  } catch (err) {
    console.log("Merkle error:", err.message);
    return [];
  }
}

module.exports = {
  fetchThalaPools,
  fetchLiquidswapPools,
  fetchMerkleMarkets,
};
