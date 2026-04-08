export interface OrbitalElements {
  id: string;                   // matches body.id in the store
  semiMajorAxisAU: number;      // AU
  eccentricity: number;
  inclinationDeg: number;       // orbital plane tilt
  orbitalPeriodDays: number;
  axialTiltDeg: number;         // positive = prograde, negative = retrograde
  initialMeanAnomaly: number;   // radians, random spread so planets start at different positions
}

// NASA-verified orbital and rotation data.
// Scale: 1 AU = 100 Three.js units.
export const ORBITAL_ELEMENTS: OrbitalElements[] = [
  {
    id: "mercury",
    semiMajorAxisAU: 0.387,
    eccentricity: 0.2056,
    inclinationDeg: 7.005,
    orbitalPeriodDays: 87.97,
    axialTiltDeg: 0.034,
    initialMeanAnomaly: 0.8,
  },
  {
    id: "venus",
    semiMajorAxisAU: 0.723,
    eccentricity: 0.0068,
    inclinationDeg: 3.395,
    orbitalPeriodDays: 224.70,
    axialTiltDeg: 177.4,
    initialMeanAnomaly: 2.1,
  },
  {
    id: "earth",
    semiMajorAxisAU: 1.000,
    eccentricity: 0.0167,
    inclinationDeg: 0.000,
    orbitalPeriodDays: 365.25,
    axialTiltDeg: 23.44,
    initialMeanAnomaly: 1.3,
  },
  {
    id: "mars",
    semiMajorAxisAU: 1.524,
    eccentricity: 0.0934,
    inclinationDeg: 1.850,
    orbitalPeriodDays: 686.97,
    axialTiltDeg: 25.19,
    initialMeanAnomaly: 4.2,
  },
  {
    id: "jupiter",
    semiMajorAxisAU: 5.203,
    eccentricity: 0.0485,
    inclinationDeg: 1.303,
    orbitalPeriodDays: 4332.59,
    axialTiltDeg: 3.13,
    initialMeanAnomaly: 0.5,
  },
  {
    id: "saturn",
    semiMajorAxisAU: 9.537,
    eccentricity: 0.0556,
    inclinationDeg: 2.489,
    orbitalPeriodDays: 10759.22,
    axialTiltDeg: 26.73,
    initialMeanAnomaly: 5.1,
  },
  {
    id: "uranus",
    semiMajorAxisAU: 19.191,
    eccentricity: 0.0472,
    inclinationDeg: 0.773,
    orbitalPeriodDays: 30688.5,
    axialTiltDeg: 97.77,
    initialMeanAnomaly: 3.0,
  },
  {
    id: "neptune",
    semiMajorAxisAU: 30.069,
    eccentricity: 0.0086,
    inclinationDeg: 1.770,
    orbitalPeriodDays: 60182,
    axialTiltDeg: 28.32,
    initialMeanAnomaly: 1.8,
  },
  // Pluto — dwarf planet, included for completeness
  {
    id: "pluto",
    semiMajorAxisAU: 39.482,
    eccentricity: 0.2488,
    inclinationDeg: 17.14,
    orbitalPeriodDays: 90560,
    axialTiltDeg: 122.53,
    initialMeanAnomaly: 2.4,
  },
];

/** Fast lookup map: id → OrbitalElements */
export const ORBITAL_MAP = new Map<string, OrbitalElements>(
  ORBITAL_ELEMENTS.map((el) => [el.id, el])
);
