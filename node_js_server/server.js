const WebSocket = require("ws");
const osc = require("osc");

// === CONFIGURATION ===
const WEBSOCKET_PORT = 8000;
const OSC_ADDRESS = "127.0.0.1";
const OSC_PORT = 8000;

// === OSC SETUP ===
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,
  remoteAddress: OSC_ADDRESS,
  remotePort: OSC_PORT,
  metadata: false,
});

udpPort.open();
udpPort.on("ready", () => {
  console.log(`✅ OSC ready: Sending to ${OSC_ADDRESS}:${OSC_PORT}`);
});

// === WEBSOCKET SERVER ===
const wss = new WebSocket.Server({ port: WEBSOCKET_PORT }, () => {
  console.log(`🌐 WebSocket server listening on ws://localhost:${WEBSOCKET_PORT}`);
});

wss.on("connection", (ws) => {
  console.log("📱 Phone connected");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "orientation") {
        // Example: Send orientation data to Unreal
        udpPort.send({
          address: "/device/orientation",
          args: [
            { type: "f", value: data.alpha || 0 },
            { type: "f", value: data.beta || 0 },
            { type: "f", value: data.gamma || 0 }
          ]
        });
      }

    } catch (err) {
      console.error("⚠️ Error parsing message:", err);
    }
  });

  ws.on("close", () => {
    console.log("📴 Phone disconnected");
  });
});
