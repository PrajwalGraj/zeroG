const express = require("express");
const app = express();

const PORT = 4001;
const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`PID: ${process.pid}`);
});

console.log("After listen() call");

// Keep alive
setInterval(() => {
  console.log("Still alive...");
}, 5000);
