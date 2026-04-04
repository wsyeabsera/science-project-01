import { useSimStore } from "../store/index.js";
import type { WsMessage } from "../../../../mcp-servers/orbital/src/types.js";

// Re-export WsMessage so App.tsx can use it if needed
export type { WsMessage };

let socket: WebSocket | null = null;

export function connectBridge(wsUrl = "ws://localhost:8080"): () => void {
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("[bridge] connected to orbital MCP server");
  };

  socket.onmessage = (event: MessageEvent<string>) => {
    let msg: WsMessage;
    try {
      msg = JSON.parse(event.data) as WsMessage;
    } catch {
      console.warn("[bridge] unparseable message", event.data);
      return;
    }

    const store = useSimStore.getState();

    switch (msg.type) {
      case "load_scene":
        store.loadScene(msg.payload.id);
        break;
      case "set_body":
        store.setBody(msg.payload);
        break;
      case "control_sim": {
        const playbackMap: Record<string, "playing" | "paused" | "stopped"> = {
          play: "playing",
          pause: "paused",
          stop: "stopped",
          reset: "stopped",
        };
        store.setPlayback(playbackMap[msg.payload.action] ?? "stopped");
        if (msg.payload.timeScale !== undefined) store.setTimeScale(msg.payload.timeScale);
        if (msg.payload.action === "reset") store.reset();
        break;
      }
      case "set_camera":
        store.setCamera(msg.payload);
        break;
      case "add_label":
        store.addLabel(msg.payload);
        break;
      default:
        console.warn("[bridge] unknown message type:", (msg as { type: string }).type);
    }
  };

  socket.onerror = (e) => console.error("[bridge] error", e);

  socket.onclose = () => {
    console.log("[bridge] disconnected");
    socket = null;
  };

  return () => {
    socket?.close();
    socket = null;
  };
}

export function sendBridgeMessage(msg: WsMessage): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("[bridge] socket not open, dropping message:", msg.type);
    return;
  }
  socket.send(JSON.stringify(msg));
}
