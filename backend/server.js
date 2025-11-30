require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Global error handlers to prevent crashes
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

// ⭐ Thala route — only once
app.use("/api/thala", require("./routes/thalaRoutes"));

// OFF-CHAIN DEX pool data
app.use("/api/pools", require("./routes/poolsApiRoutes"));

// ON-CHAIN reserves route
app.use("/api/pools/onchain", require("./routes/poolsRoutes"));

// Launchpad
app.use("/api/launch", require("./routes/launchRoutes"));

// Scoring
app.use("/api/scores", require("./routes/scoreRoutes"));

// Panora
app.use("/api/panora", require("./routes/panoraRoutes"));

// Root
app.get("/", (req, res) => {
  res.send({ status: "ZeroG backend running ✔" });
});

// Express error handler (must be after all routes)
app.use((err, req, res, next) => {
  console.error("❌ Express error:", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: err.message || String(err) });
});

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully');
  server.close(() => process.exit(0));
});

// Explicitly keep the event loop alive (workaround for Express 5.x issue)
const keepAlive = setInterval(() => {}, 1000000);
process.on('exit', () => clearInterval(keepAlive));
