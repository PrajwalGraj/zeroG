// backend/services/panoraFetcher.js

const PANORA_ENDPOINT = "https://api.panora.exchange/swap";
const API_KEY = process.env.PANORA_API_KEY;

async function getPanoraQuote(query) {
  try {
    const qs = new URLSearchParams(query).toString();
    const url = `${PANORA_ENDPOINT}?${qs}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
      },
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (err) {
    console.error("Panora Fetch Error:", err);
    throw new Error("Failed to fetch Panora swap quote");
  }
}

module.exports = { getPanoraQuote };
