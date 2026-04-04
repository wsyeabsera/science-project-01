import { WebSocketServer, WebSocket } from "ws";

const WS_PORT = 8080;

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function startWsServer(): WebSocketServer {
  wss = new WebSocketServer({ port: WS_PORT });

  wss.on("listening", () => {
    console.log(`[orbital-ws] listening on ws://localhost:${WS_PORT}`);
  });

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log(`[orbital-ws] client connected (total: ${clients.size})`);

    ws.on("message", (data) => {
      console.log("[orbital-ws] message from sim:", data.toString());
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`[orbital-ws] client disconnected (total: ${clients.size})`);
    });
  });

  return wss;
}

export function broadcast(message: unknown): void {
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
