const WebSocket = require('ws');
require("dotenv").config();


const websocketUrl = "secure.ws.teneo.pro";
const wsConnectionString = `wss://${websocketUrl}/websocket`;

const accessToken = process.env.AT;
const version = "v0.2";
const wsUrl = `${wsConnectionString}?accessToken=${encodeURIComponent(accessToken)}&version=${encodeURIComponent(version)}`;

let socket = null;
let pingInterval = null;

function connectWebSocket() {
    socket = new WebSocket(wsUrl);

    socket.on('open', () => {
        console.log("✅ Connected to WebSocket server");
        startPinging();
    });

    socket.on('message', (data) => {
        try {
            const parsed = JSON.parse(data);
            console.log("📨 Message Received:", parsed);

            // যেমন: pointsTotal, pointsToday, etc.
            if (parsed.pointsTotal !== undefined) {
                console.log("📊 Points Today:", parsed.pointsToday);
                console.log("📈 Points Total:", parsed.pointsTotal);
            }
        } catch (err) {
            console.error("❌ JSON parse error:", err);
        }
    });

    socket.on('close', () => {
        console.warn("🔌 WebSocket Disconnected");
        stopPinging();

        // Reconnect logic (optional)
        setTimeout(() => {
            console.log("🔁 Trying to reconnect...");
            connectWebSocket();
        }, 5000);
    });

    socket.on('error', (err) => {
        console.error("❗ WebSocket error:", err);
    });
}

function startPinging() {
    stopPinging(); // ensure no duplicate interval
    pingInterval = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "PING" }));
            console.log("📤 Sent PING");
        }
    }, 10000); // Every 10 sec
}

function stopPinging() {
    if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
    }
}

module.exports = {

    connectWebSocket

}
