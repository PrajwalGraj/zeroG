console.log("Starting...");
console.log("PID:", process.pid);

setInterval(() => {
  console.log("Alive at", new Date().toISOString());
}, 2000);
