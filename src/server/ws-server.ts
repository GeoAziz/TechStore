// src/server/ws-server.ts

import https from 'https';
import fs from 'fs';
import WebSocket from 'ws';
import { auth } from '../lib/firebase-admin';

const SSL_KEY_PATH = process.env.SSL_KEY_PATH || 'ssl/key.pem';
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || 'ssl/cert.pem';
const WS_SECRET = process.env.WS_SECRET;

const server = https.createServer({
  key: fs.readFileSync(SSL_KEY_PATH),
  cert: fs.readFileSync(SSL_CERT_PATH),
});

const wss = new (WebSocket as any).Server({ server });

const authenticatedClients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket, req: any) => {
  const url = new URL(req.url || '', `https://${req.headers.host}`);
  const token = url.searchParams.get('token');
  const secret = url.searchParams.get('secret');

  if (!WS_SECRET || secret !== WS_SECRET) {
    ws.close(4001, 'Invalid server secret');
    return;
  }

  if (!token) {
    ws.close(4001, 'Authentication required');
    return;
  }

  auth.verifyIdToken(token)
    .then((decoded) => {
      (ws as any).uid = decoded.uid;
      (ws as any).role = decoded.role || 'client';
      authenticatedClients.add(ws);
      ws.send(JSON.stringify({ type: 'info', message: 'WebSocket connected (authenticated)', uid: decoded.uid }));

      ws.on('message', (msg: Buffer) => {
        console.log('Received from', decoded.uid, ':', msg.toString());
      });

      ws.on('close', () => {
        authenticatedClients.delete(ws);
      });
    })
    .catch(() => {
      ws.close(4001, 'Invalid authentication token');
    });
});

export function broadcastUpdate(data: any) {
  authenticatedClients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

server.listen(4001, () => {
  console.log('WebSocket server running on wss://localhost:4001');
});
