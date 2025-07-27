// src/server/https-server.js
// Example HTTPS server for WebSocket (ws) and API
const fs = require('fs');
const https = require('https');
const { Server } = require('ws');

const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH || 'ssl/key.pem', 'utf8');
const certificate = fs.readFileSync(process.env.SSL_CERT_PATH || 'ssl/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials);
const wss = new Server({ server: httpsServer });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'info', message: 'Secure WebSocket connected' }));
});

httpsServer.listen(443, () => {
  console.log('HTTPS & Secure WebSocket server running on port 443');
});

/**
 * To use:
 * - Place your SSL key/cert in ssl/key.pem and ssl/cert.pem (or set SSL_KEY_PATH/SSL_CERT_PATH)
 * - Update WebSocket client to use wss://yourdomain.com
 * - Use HTTPS for Next.js and n8n endpoints in production
 * - Set strong secrets in .env and never commit them
 */
