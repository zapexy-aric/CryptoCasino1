import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import session from 'express-session';

const clients = new Map<string, WebSocket>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    // This is a simplified way to get the user from the session.
    // In a real app, you would use a more robust session parsing mechanism.
    // @ts-ignore
    const sessionCookie = request.headers.cookie?.split(';').find(c => c.trim().startsWith('connect.sid='));
    if (!sessionCookie) {
      socket.destroy();
      return;
    }

    // This is a mock session handling. In a real app, you'd use your session store
    // to get the session data. For this example, we'll assume the user is authenticated
    // and we can get the userId from the request somehow.
    // A proper implementation would require parsing the session cookie and looking up
    // the session in the postgres store.
    // For now, we'll just assign a random ID for demonstration purposes.
    // A better approach would be to have a secure way to pass the user's session
    // token during the WebSocket handshake.

    // A simplified way to get userId. In a real app, you'd have a proper auth mechanism here.
    // We'll assume the client sends the userId in the protocol for simplicity.
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws, request) => {
    // When a connection is established, the client should send its userId.
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'auth' && data.userId) {
          clients.set(data.userId, ws);
          console.log(`WebSocket client connected: ${data.userId}`);
        }
      } catch (e) {
        console.error('Failed to parse message or invalid message format.');
      }
    });

    ws.on('close', () => {
      // Find the user and remove them from the clients map
      clients.forEach((clientWs, userId) => {
        if (clientWs === ws) {
          clients.delete(userId);
          console.log(`WebSocket client disconnected: ${userId}`);
        }
      });
    });
  });
}

export function sendBalanceUpdate(userId: string, balance: string) {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: 'balance_update', balance }));
  }
}
