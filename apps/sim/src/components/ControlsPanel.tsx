import { useState, useCallback } from "react";
import { useSimStore } from "../store";
import { useVisibilityStore } from "../store/visibility";
import type { PlaybackState } from "../store";

// ── Style constants ────────────────────────────────────────────────────────────
const PANEL_STYLE: React.CSSProperties = {
  position: "fixed",
  bottom: 24,
  left: 24,
  background: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 10,
  padding: 16,
  minWidth: 240,
  zIndex: 100,
  color: "#fff",
  fontFamily: "sans-serif",
};

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#aaa",
  marginBottom: 8,
};

const BTN_BASE: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 6,
  color: "#fff",
  padding: "4px 10px",
  cursor: "pointer",
  fontSize: 13,
  transition: "background 0.12s ease",
};

const BTN_ACTIVE: React.CSSProperties = {
  ...BTN_BASE,
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.3)",
};

// ── Logarithmic slider helpers ─────────────────────────────────────────────────
// Maps slider position [0,1] ↔ timeScale [0.1, 36500] on a log scale.
const LOG_MIN = Math.log10(0.1);   // -1
const LOG_MAX = Math.log10(36500); // ~4.562

function scaleToSlider(scale: number): number {
  return (Math.log10(Math.max(scale, 0.001)) - LOG_MIN) / (LOG_MAX - LOG_MIN);
}

function sliderToScale(pos: number): number {
  const raw = Math.pow(10, LOG_MIN + pos * (LOG_MAX - LOG_MIN));
  // Round to reasonable precision
  if (raw < 1) return Math.round(raw * 10) / 10;
  if (raw < 100) return Math.round(raw);
  return Math.round(raw / 5) * 5;
}

function formatScale(scale: number): string {
  if (scale < 1) return `${scale.toFixed(1)}× day/s`;
  if (scale < 1000) return `${Math.round(scale)}× day/s`;
  return `${(scale / 365).toFixed(0)}yr/s`;
}

// ── Preset buttons ─────────────────────────────────────────────────────────────
const PRESETS: { label: string; value: number }[] = [
  { label: "Real", value: 0.001 },
  { label: "1d/s", value: 1 },
  { label: "1mo/s", value: 30 },
  { label: "1yr/s", value: 365 },
  { label: "100yr/s", value: 36500 },
];

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontSize: 13,
        color: "#ddd",
        userSelect: "none",
      }}
    >
      <span
        onClick={() => onChange(!checked)}
        style={{
          display: "inline-block",
          width: 32,
          height: 18,
          borderRadius: 9,
          background: checked ? "#4fa3e0" : "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.25)",
          position: "relative",
          transition: "background 0.18s ease",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 14 : 2,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.18s ease",
          }}
        />
      </span>
      {label}
    </label>
  );
}

// ── ControlsPanel ─────────────────────────────────────────────────────────────
export function ControlsPanel() {
  const setPlayback = useSimStore((s) => s.setPlayback);
  const resetSim = useSimStore((s) => s.reset);
  const timeScale = useSimStore((s) => s.timeScale);
  const setTimeScale = useSimStore((s) => s.setTimeScale);
  const playback = useSimStore((s) => s.playback);

  const orbitPaths = useVisibilityStore((s) => s.orbitPaths);
  const labels = useVisibilityStore((s) => s.labels);
  const asteroidBelt = useVisibilityStore((s) => s.asteroidBelt);
  const setOrbitPaths = useVisibilityStore((s) => s.setOrbitPaths);
  const setLabels = useVisibilityStore((s) => s.setLabels);
  const setAsteroidBelt = useVisibilityStore((s) => s.setAsteroidBelt);

  const [expanded, setExpanded] = useState(true);
  const [gearHovered, setGearHovered] = useState(false);

  const handlePlayback = useCallback(
    (state: PlaybackState) => {
      setPlayback(state);
    },
    [setPlayback]
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const pos = parseFloat(e.target.value);
      setTimeScale(sliderToScale(pos));
    },
    [setTimeScale]
  );

  const handlePreset = useCallback(
    (value: number) => {
      setTimeScale(value);
    },
    [setTimeScale]
  );

  // Collapsed: just the gear button
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        onMouseEnter={() => setGearHovered(true)}
        onMouseLeave={() => setGearHovered(false)}
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: gearHovered
            ? "rgba(255,255,255,0.22)"
            : "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#ffffff",
          fontSize: 16,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 101,
          transition: "background 0.15s ease",
          padding: 0,
          lineHeight: 1,
        }}
        aria-label="Open controls panel"
      >
        ⚙
      </button>
    );
  }

  return (
    <div style={PANEL_STYLE}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={SECTION_LABEL_STYLE}>Simulation Controls</div>
        <button
          onClick={() => setExpanded(false)}
          title="Collapse panel"
          style={{
            background: "none",
            border: "none",
            color: "#aaa",
            cursor: "pointer",
            fontSize: 14,
            padding: "0 0 0 8px",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* 1. Playback controls */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 6 }}>Playback</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            style={playback === "playing" ? BTN_ACTIVE : BTN_BASE}
            onClick={() => handlePlayback("playing")}
            title="Play"
          >
            ▶
          </button>
          <button
            style={playback === "paused" ? BTN_ACTIVE : BTN_BASE}
            onClick={() => handlePlayback("paused")}
            title="Pause"
          >
            ⏸
          </button>
          <button
            style={playback === "stopped" ? BTN_ACTIVE : BTN_BASE}
            onClick={() => handlePlayback("stopped")}
            title="Stop"
          >
            ⏹
          </button>
          <button
            style={BTN_BASE}
            onClick={() => resetSim()}
            title="Reset simulation"
          >
            ↺
          </button>
        </div>
      </div>

      {/* 2. Time scale */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div style={SECTION_LABEL_STYLE}>Speed</div>
          <span
            style={{
              fontSize: 12,
              color: "#4fa3e0",
              fontFamily: "monospace",
            }}
          >
            {formatScale(timeScale)}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={scaleToSlider(timeScale)}
          onChange={handleSliderChange}
          style={{
            width: "100%",
            accentColor: "#4fa3e0",
            cursor: "pointer",
            marginBottom: 8,
          }}
        />

        {/* Preset buttons */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              style={{
                ...(Math.abs(timeScale - p.value) < 0.5 ? BTN_ACTIVE : BTN_BASE),
                padding: "3px 7px",
                fontSize: 11,
              }}
              onClick={() => handlePreset(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Visibility toggles */}
      <div>
        <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 8 }}>Visibility</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Toggle
            label="Orbit Paths"
            checked={orbitPaths}
            onChange={setOrbitPaths}
          />
          <Toggle
            label="Labels"
            checked={labels}
            onChange={setLabels}
          />
          <Toggle
            label="Asteroid Belt"
            checked={asteroidBelt}
            onChange={setAsteroidBelt}
          />
        </div>
      </div>
    </div>
  );
}
