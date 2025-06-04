//works as of 6/3/2025
const http = require("http");
const WebSocket = require("ws");
const osc = require("osc");

// WebSocket Server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// OSC UDP Port to Unreal
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 9000, // optional, can be anything unused
  remoteAddress: "192.168.86.28",
  remotePort: 8000
});

udpPort.open();

wss.on("connection", (ws) => {
  console.log("✅ Phone connected via WebSocket");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === "motion" || data.type === "orientation") {
        udpPort.send({
          address: `/sensor/${data.type}`,
          args: Object.entries(data).filter(([k]) => k !== "type").map(([k, v]) => ({
            type: "f",
            value: parseFloat(v) || 0
          }))
        });
      }
    } catch (err) {
      console.error("❌ Failed to parse message:", err);
    }
  });
});

server.listen(8000, "0.0.0.0", () => {
  console.log("🌐 WebSocket server listening on port 8000");
});
