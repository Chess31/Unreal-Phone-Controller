const http = require("http");
const WebSocket = require("ws");
const osc = require("osc");

// WebSocket Server with basic HTTP response
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket + OSC Server is running.\n");
});

const wss = new WebSocket.Server({ server });

// OSC UDP Port to Unreal
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 9000, // can be any unused port
  remoteAddress: "192.168.86.30", // replace with your Unreal Engine machine IP
  remotePort: 8000
});

udpPort.open();

wss.on("connection", (ws) => {
  console.log("✅ Phone connected via WebSocket");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // Only process known types
      if (["motion", "orientation", "quaternion"].includes(data.type)) {
        udpPort.send({
          address: `/sensor/${data.type}`,
          args: Object.entries(data)
            .filter(([k]) => k !== "type")
            .map(([_, v]) => ({
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

const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 WebSocket server listening on port ${PORT}`);
});