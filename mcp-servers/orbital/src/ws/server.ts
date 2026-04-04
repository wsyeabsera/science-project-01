import { WebSocketServer, WebSocket } from "ws";
import { getState } from "../state.js";

const WS_PORT = 8080;

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

function replayState(ws: WebSocket): void {
  const state = getState();
  const send = (msg: unknown) => ws.send(JSON.stringify(msg));

  if (state.scene) {
    send({ type: "load_scene", payload: { id: state.scene } });
  }
  for (const body of state.bodies) {
    send({ type: "set_body", payload: body });
  }
  for (const label of state.labels) {
    send({ type: "add_label", payload: label });
  }
  if (state.camera) {
    send({ type: "set_camera", payload: state.camera });
  }
  const actionMap: Record<string, string> = { playing: "play", paused: "pause", stopped: "stop" };
  send({ type: "control_sim", payload: { action: actionMap[state.playback] ?? "stop", timeScale: state.timeScale } });
}

export function startWsServer(): WebSocketServer {
  wss = new WebSocketServer({ port: WS_PORT });

  wss.on("listening", () => {
    console.error(`[orbital-ws] listening on ws://localhost:${WS_PORT}`);
  });

  wss.on("error", (err) => {
    console.error(`[orbital-ws] server error: ${err.message}`);
    if ((err as NodeJS.ErrnoException).code === "EADDRINUSE") {
      console.error(`[orbital-ws] port ${WS_PORT} already in use — broadcasts disabled`);
    }
  });

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.error(`[orbital-ws] client connected (total: ${clients.size})`);
    replayState(ws);

    ws.on("message", (data) => {
      console.error("[orbital-ws] message from sim:", data.toString());
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.error(`[orbital-ws] client disconnected (total: ${clients.size})`);
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
