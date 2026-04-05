import { createServer } from "http";
import { Server, type Socket } from "socket.io";
import { getState } from "../state.js";

const WS_PORT = 8080;

let io: Server | null = null;

function replayState(socket: Socket): void {
  const state = getState();

  if (state.scene) {
    socket.emit("load_scene", { id: state.scene });
  }
  for (const body of state.bodies) {
    socket.emit("set_body", body);
  }
  for (const label of state.labels) {
    socket.emit("add_label", label);
  }
  if (state.camera) {
    socket.emit("set_camera", state.camera);
  }
  const actionMap: Record<string, string> = { playing: "play", paused: "pause", stopped: "stop" };
  socket.emit("control_sim", {
    action: actionMap[state.playback] ?? "stop",
    timeScale: state.timeScale,
  });
}

export function startSocketServer(): Server {
  const httpServer = createServer();
  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.error(`[orbital-sio] client connected: ${socket.id}`);
    replayState(socket);

    socket.on("disconnect", (reason) => {
      console.error(`[orbital-sio] client disconnected: ${socket.id} (${reason})`);
    });
  });

  httpServer.listen(WS_PORT, () => {
    console.error(`[orbital-sio] listening on http://localhost:${WS_PORT}`);
  });

  httpServer.on("error", (err) => {
    console.error(`[orbital-sio] server error: ${err.message}`);
  });

  return io;
}

export function broadcast(type: string, payload: unknown): void {
  io?.emit(type, payload);
}
