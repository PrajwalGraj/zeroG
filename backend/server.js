const express = require("express");
const app = express();
app.use(express.json());

// ===== ROUTES =====

// OFF-CHAIN DEX pool data (GeckoTerminal)
const poolsApiRoutes = require("./routes/poolsApiRoutes");
app.use("/api/pools", poolsApiRoutes);

// ON-CHAIN reserves route
const poolsRoutes = require("./routes/poolsRoutes");
app.use("/api/pools/onchain", poolsRoutes);

// Launchpad engine
const launchRoutes = require("./routes/launchRoutes");
app.use("/api/launch", launchRoutes);

// Scoring engine (ALL scoring endpoints)
const scoreRoutes = require("./routes/scoreRoutes");
app.use("/api/scores", scoreRoutes);

// Panora (optional)
const panoraRoutes = require("./routes/panoraRoutes");
app.use("/api/panora", panoraRoutes);

// Root
app.get("/", (req, res) => {
  res.send({ status: "ZeroG backend running ✔" });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
