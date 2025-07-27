// src/server/ws-server.ts

import https from 'https';
import fs from 'fs';
import WebSocket from 'ws';

const SSL_KEY_PATH = process.env.SSL_KEY_PATH || 'ssl/key.pem';
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || 'ssl/cert.pem';

const server = https.createServer({
  key: fs.readFileSync(SSL_KEY_PATH),
  cert: fs.readFileSync(SSL_CERT_PATH),
});

const wss = new (WebSocket as any).Server({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.send(JSON.stringify({ type: 'info', message: 'WebSocket connected (secure)' }));
  ws.on('message', (msg: Buffer) => {
    // Optionally handle incoming messages from clients
    console.log('Received:', msg.toString());
  });
});

// Broadcast function for order/log updates
export function broadcastUpdate(data: any) {
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

server.listen(4001, () => {
  console.log('WebSocket server running on wss://localhost:4001');
});

/**
 * Usage:
 * - Call broadcastUpdate({ type: 'order', ... }) from your API/routes when an order/log changes
 * - Admin dashboard connects to wss://localhost:4001 for real-time updates
 * - Set SSL_KEY_PATH and SSL_CERT_PATH in your environment or use default ssl/key.pem and ssl/cert.pem
 */
