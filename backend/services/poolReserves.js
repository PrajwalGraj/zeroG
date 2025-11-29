const { runQuery } = require("./aptosGraphql");

// Fetch all fungible asset balances owned by a pool account.
// This gives the token reserves for that liquidity pool.
async function getPoolReserves(poolAddress) {
  const query = `
    query PoolReserves($addr: String!) {
      current_fungible_asset_balances(
        where: { owner_address: { _eq: $addr } }
        limit: 200
      ) {
        owner_address
        asset_type
        amount
      }
    }
  `;

  const result = await runQuery(query, { addr: poolAddress });

  return result.current_fungible_asset_balances || [];
}

module.exports = { getPoolReserves };
