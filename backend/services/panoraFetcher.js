const axios = require("axios");

async function fetchPanoraPools() {
  try {
    const { data } = await axios.get(
      "https://api.panora.exchange/api/v1/liquidity/pools",
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    // Data format: data[i] contains pool analytics
    return data;
  } catch (err) {
    console.log("Panora API Error:", err.message);
    return [];
  }
}

module.exports = { fetchPanoraPools };
