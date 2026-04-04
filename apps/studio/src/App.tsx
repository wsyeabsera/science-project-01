import { useStudioStore } from "./store";

export default function App() {
  const { nodes, selectedId, selectNode } = useStudioStore();

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "monospace" }}>
      <aside style={{ width: 240, borderRight: "1px solid #333", padding: 16 }}>
        <h2>Scene</h2>
        {nodes.length === 0 && <p style={{ color: "#666" }}>No nodes yet.</p>}
        {nodes.map((n) => (
          <div
            key={n.id}
            onClick={() => selectNode(n.id)}
            style={{
              padding: 8,
              cursor: "pointer",
              background: selectedId === n.id ? "#1a1aff22" : "transparent",
            }}
          >
            {n.label}
          </div>
        ))}
      </aside>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Canvas — drag components from the panel to build scenes.</p>
      </main>
    </div>
  );
}
