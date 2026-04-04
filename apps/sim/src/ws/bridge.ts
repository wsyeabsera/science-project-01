import { useSimStore } from "../store";

export type BridgeMessage =
  | { type: "bodies"; payload: Parameters<ReturnType<typeof useSimStore.getState>["setBodies"]>[0] }
  | { type: "playback"; payload: ReturnType<typeof useSimStore.getState>["playback"] }
  | { type: "tick"; payload: { deltaSeconds: number } };

let socket: WebSocket | null = null;

export function connectBridge(wsUrl = "ws://localhost:8080"): () => void {
  socket = new WebSocket(wsUrl);

  socket.onmessage = (event: MessageEvent<string>) => {
    let msg: BridgeMessage;
    try {
      msg = JSON.parse(event.data) as BridgeMessage;
    } catch {
      console.warn("[bridge] bad message", event.data);
      return;
    }

    const store = useSimStore.getState();
    if (msg.type === "bodies") store.setBodies(msg.payload);
    else if (msg.type === "playback") store.setPlayback(msg.payload);
    else if (msg.type === "tick") store.tickTime(msg.payload.deltaSeconds);
  };

  socket.onerror = (e) => console.error("[bridge] error", e);

  return () => {
    socket?.close();
    socket = null;
  };
}

export function sendBridgeMessage(msg: BridgeMessage): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("[bridge] socket not open");
    return;
  }
  socket.send(JSON.stringify(msg));
}
