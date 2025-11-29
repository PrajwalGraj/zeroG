// Normalize to 0-1
function normalize(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

// Detect volatility to classify pool type
function isStable(volatility) {
  return Math.abs(volatility) < 0.5;
}

// Auto fee based on volatility
function getFeeRate(volatility) {
  return isStable(volatility) ? 0.0004 : 0.003;
}

// Derive APR from volume + fee + TVL
function computeAPR(volume24h, tvl, volatility) {
  if (!tvl || tvl == 0) return 0;

  const feeRate = getFeeRate(volatility);
  const dailyFees = volume24h * feeRate;
  const apr = (dailyFees * 365) / tvl;

  return apr; // raw APR (e.g. 0.21 = 21%)
}

function scorePools(pools) {
  if (!pools || pools.length === 0) return [];

  // First: compute APR for each pool
  const enriched = pools.map(pool => {
    const apr = computeAPR(
      Number(pool.volume24h),
      Number(pool.tvl),
      Number(pool.volatility)
    );

    return {
      ...pool,
      apr
    };
  });

  // Extract all metrics for normalization
  const aprs = enriched.map(p => p.apr);
  const tvls = enriched.map(p => p.tvl);
  const volumes = enriched.map(p => p.volume24h);
  const vols = enriched.map(p => Math.abs(p.volatility));

  const maxAPR = Math.max(...aprs);
  const maxTVL = Math.max(...tvls);
  const maxVolume = Math.max(...volumes);
  const maxVolatility = Math.max(...vols);

  const dexScores = {
    thala: 0.9,
    liquidswap: 0.85,
    merkle: 0.8,
  };

  // Compute final score
  return enriched.map(p => {
    const aprNorm = normalize(p.apr, 0, maxAPR);
    const tvlNorm = normalize(p.tvl, 0, maxTVL);
    const volumeNorm = normalize(p.volume24h, 0, maxVolume);
    const volatilityNorm = normalize(Math.abs(p.volatility), 0, maxVolatility);

    const dexNorm = dexScores[p.dex] || 0.5;

    const score =
      (aprNorm * 0.35) +
      (tvlNorm * 0.20) +
      (volumeNorm * 0.25) +
      (dexNorm * 0.10) -
      (volatilityNorm * 0.15);

    return {
      ...p,
      apr: Number((p.apr * 100).toFixed(2)),   // APR in %
      score: Number(score.toFixed(4)),
    };
  });
}

module.exports = { scorePools };
