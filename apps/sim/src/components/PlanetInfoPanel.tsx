import { PLANET_INFO_MAP } from "../data/planetInfo";

interface PlanetInfoPanelProps {
  planetId: string | null;
  onClose: () => void;
}

type PlanetType = "Star" | "Terrestrial" | "Gas Giant" | "Ice Giant";

const PLANET_TYPES: Record<string, PlanetType> = {
  sun: "Star",
  mercury: "Terrestrial",
  venus: "Terrestrial",
  earth: "Terrestrial",
  mars: "Terrestrial",
  jupiter: "Gas Giant",
  saturn: "Gas Giant",
  uranus: "Ice Giant",
  neptune: "Ice Giant",
};

const TYPE_COLORS: Record<PlanetType, string> = {
  Star: "#FDB813",
  Terrestrial: "#4fa3e0",
  "Gas Giant": "#c88b3a",
  "Ice Giant": "#7de8e8",
};

const STAT_LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "#888",
  marginBottom: 2,
  fontFamily: "sans-serif",
};

const STAT_VALUE_STYLE: React.CSSProperties = {
  fontSize: 13,
  color: "#fff",
  fontFamily: "sans-serif",
  fontWeight: 500,
};

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={STAT_LABEL_STYLE}>{label}</div>
      <div style={STAT_VALUE_STYLE}>{value}</div>
    </div>
  );
}

export function PlanetInfoPanel({ planetId, onClose }: PlanetInfoPanelProps) {
  if (!planetId) return null;

  const info = PLANET_INFO_MAP[planetId];
  if (!info) return null;

  const type = PLANET_TYPES[planetId] ?? "Terrestrial";
  const typeColor = TYPE_COLORS[type];

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        right: 24,
        transform: "translateY(-50%)",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 12,
        padding: 20,
        width: 280,
        zIndex: 200,
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.03em",
              lineHeight: 1.2,
            }}
          >
            {info.name}
          </div>
          <span
            style={{
              display: "inline-block",
              marginTop: 6,
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              background: `${typeColor}22`,
              border: `1px solid ${typeColor}55`,
              color: typeColor,
            }}
          >
            {type}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close planet info"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            color: "#ccc",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
            padding: "3px 7px",
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          ×
        </button>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.1)",
          marginBottom: 14,
        }}
      />

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 16 }}>
        <StatCell label="Diameter" value={info.diameter} />
        <StatCell label="Moons" value={String(info.moons)} />
        <StatCell label="Distance from Sun" value={info.distanceFromSun} />
        <StatCell label="Orbital Period" value={info.orbitalPeriod} />
        <StatCell label="Day Length" value={info.dayLength} />
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.1)",
          marginBottom: 12,
        }}
      />

      {/* Fun fact */}
      <div
        style={{
          fontSize: 12,
          color: "#bbb",
          fontStyle: "italic",
          lineHeight: 1.5,
          fontFamily: "sans-serif",
        }}
      >
        {info.funFact}
      </div>
    </div>
  );
}
