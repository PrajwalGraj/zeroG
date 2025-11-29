const express = require("express");
const router = express.Router();

const { fetchPanoraPools } = require("../services/panoraFetcher");

router.get("/all", async (req, res) => {
  const pools = await fetchPanoraPools();
  res.json(pools);
});

module.exports = router;
