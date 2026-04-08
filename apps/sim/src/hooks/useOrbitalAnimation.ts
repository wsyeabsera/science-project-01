import * as THREE from "three";
import { useCallback } from "react";
import { ORBITAL_MAP } from "../data/orbitalElements";

const TWO_PI = 2 * Math.PI;

/**
 * Solve Kepler's equation M = E - e*sin(E) for E using fixed-point iteration.
 * 10 iterations is sufficient for e < 0.25 (all solar system planets).
 */
function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 10; i++) {
    E = M + e * Math.sin(E);
  }
  return E;
}

/**
 * Compute the 3-D position (Three.js units) of a body along its Keplerian orbit.
 *
 * @param id          Body id matching ORBITAL_MAP keys
 * @param simTimeDays Elapsed simulation time in days
 * @returns THREE.Vector3 in Three.js space (Y-up), or Vector3(0,0,0) if id unknown
 */
function computeOrbitPosition(id: string, simTimeDays: number): THREE.Vector3 {
  const el = ORBITAL_MAP.get(id);
  if (!el) return new THREE.Vector3(0, 0, 0);

  const { semiMajorAxisAU, eccentricity: e, inclinationDeg, orbitalPeriodDays, initialMeanAnomaly } = el;

  // Mean anomaly (mod 2π keeps it numerically tidy but isn't required)
  const M = initialMeanAnomaly + (TWO_PI / orbitalPeriodDays) * simTimeDays;

  // Eccentric anomaly via Kepler's equation
  const E = solveKepler(M, e);

  // Position in orbital plane (x toward perihelion, z 90° ahead)
  // 1 AU = 100 Three.js units
  const scale = semiMajorAxisAU * 100;
  const xOrb = scale * (Math.cos(E) - e);
  const zOrb = scale * Math.sqrt(1 - e * e) * Math.sin(E);

  // Apply orbital inclination: rotate around X-axis by i
  const iRad = (inclinationDeg * Math.PI) / 180;
  const cosI = Math.cos(iRad);
  const sinI = Math.sin(iRad);

  // In Three.js Y-up: the ecliptic plane is XZ, so inclination tilts z into y
  return new THREE.Vector3(
    xOrb,
    zOrb * sinI,
    zOrb * cosI
  );
}

/**
 * Returns a stable (non-reactive) function `getOrbitPosition(id, simTimeDays)`
 * and a helper `getAxialTilt(id)`.  No internal state — safe to call every frame
 * without causing re-renders.
 */
export function useOrbitalAnimation() {
  const getOrbitPosition = useCallback(
    (id: string, simTimeDays: number): THREE.Vector3 =>
      computeOrbitPosition(id, simTimeDays),
    []
  );

  return { getOrbitPosition };
}

/**
 * Returns the axial tilt in degrees for a body id.
 * Positive = prograde, negative = retrograde.
 * Returns 0 if the body is unknown.
 */
export function getAxialTilt(id: string): number {
  return ORBITAL_MAP.get(id)?.axialTiltDeg ?? 0;
}

/**
 * Returns the semi-major axis in Three.js units (AU * 100) for orbit ring rendering.
 * Returns 0 if the body is unknown.
 */
export function getOrbitRadius(id: string): number {
  const el = ORBITAL_MAP.get(id);
  return el ? el.semiMajorAxisAU * 100 : 0;
}
