const {
  fetchThalaPools,
  fetchLiquidswapPools,
} = require("./dexFetcher");

// Extract metadata from a raw Gecko Terminal pool
function extractPoolMetadata(pool, dex) {
  const a = pool.attributes;

  return {
    dex,
    address: a.address,
    pair: a.name,
    tokenA: a.base_token?.symbol,
    tokenAType: a.base_token?.address,
    tokenB: a.quote_token?.symbol,
    tokenBType: a.quote_token?.address,
    tvl: Number(a.reserve_in_usd || 0),
    volume24h: Number(a.volume_usd?.h24 || 0),
    volatility: Number(a.price_change_percentage?.h24 || 0),
    raw: a
  };
}

async function findPoolInfo(poolAddress) {
  const [thala, liquidswap] = await Promise.all([
    fetchThalaPools(),
    fetchLiquidswapPools()
  ]);

  const matchThala = thala.find(
    p => p?.attributes?.address?.toLowerCase() === poolAddress.toLowerCase()
  );

  if (matchThala) {
    return extractPoolMetadata(matchThala, "thala");
  }

  const matchLiquidswap = liquidswap.find(
    p => p?.attributes?.address?.toLowerCase() === poolAddress.toLowerCase()
  );

  if (matchLiquidswap) {
    return extractPoolMetadata(matchLiquidswap, "liquidswap");
  }

  return null;
}

module.exports = { findPoolInfo };
