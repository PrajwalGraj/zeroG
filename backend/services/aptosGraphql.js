const axios = require("axios");

const APTOS_GQL = "https://api.mainnet.aptoslabs.com/v1/graphql";

async function runQuery(query, variables = {}) {
  try {
    const res = await axios.post(
      APTOS_GQL,
      {
        query,
        variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        timeout: 20000,
      }
    );

    if (res.data.errors) {
      throw new Error(JSON.stringify(res.data.errors));
    }

    return res.data.data;
  } catch (err) {
    console.log("GraphQL ERROR:", err.message);
    throw err;
  }
}

module.exports = { runQuery };
