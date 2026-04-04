import { describe, it, expect, beforeEach } from "vitest";
import {
  getState,
  applyScene,
  applyBody,
  applyControl,
  applyCamera,
  applyLabel,
} from "./state.js";

describe("sim state store", () => {
  beforeEach(() => {
    applyControl("reset");
  });

  it("starts with empty bodies and stopped playback", () => {
    const s = getState();
    expect(s.bodies).toEqual([]);
    expect(s.playback).toBe("stopped");
    expect(s.scene).toBeNull();
  });

  it("applyScene clears bodies and sets scene id", () => {
    applyBody({ id: "earth", name: "Earth", mass: 5.97e24, radius: 0.5, position: [100, 0, 0], velocity: [0, 0, 0], texture: "earth", color: "#2b6cb0" });
    applyScene("solar-system");
    const s = getState();
    expect(s.bodies).toEqual([]);
    expect(s.scene).toBe("solar-system");
    expect(s.playback).toBe("stopped");
  });

  it("applyBody adds a new body", () => {
    applyBody({ id: "mars", name: "Mars", mass: 6.42e23, radius: 0.27, position: [152, 0, 0], velocity: [0, 0, 0], texture: "mars", color: "#c1440e" });
    expect(getState().bodies).toHaveLength(1);
    expect(getState().bodies[0].id).toBe("mars");
  });

  it("applyBody updates an existing body", () => {
    const base = { id: "mars", name: "Mars", mass: 6.42e23, radius: 0.27, position: [152, 0, 0] as [number, number, number], velocity: [0, 0, 0] as [number, number, number], texture: "mars", color: "#c1440e" };
    applyBody(base);
    applyBody({ ...base, position: [200, 0, 0] });
    expect(getState().bodies).toHaveLength(1);
    expect(getState().bodies[0].position).toEqual([200, 0, 0]);
  });

  it("applyControl sets playback and timeScale", () => {
    applyControl("play", 86400);
    const s = getState();
    expect(s.playback).toBe("playing");
    expect(s.timeScale).toBe(86400);
  });

  it("applyControl reset clears bodies and resets time", () => {
    applyBody({ id: "sun", name: "Sun", mass: 1.99e30, radius: 10, position: [0, 0, 0], velocity: [0, 0, 0], texture: "sun", color: "#fff4e0" });
    applyControl("reset");
    const s = getState();
    expect(s.bodies).toEqual([]);
    expect(s.simTime).toBe(0);
    expect(s.playback).toBe("stopped");
  });

  it("applyCamera sets camera state", () => {
    applyCamera({ target: "jupiter", distance: 300, azimuth: 45, elevation: 20 });
    expect(getState().camera).toEqual({ target: "jupiter", distance: 300, azimuth: 45, elevation: 20 });
  });

  it("applyLabel adds a new label", () => {
    applyLabel({ bodyId: "jupiter", text: "Jupiter\n318x Earth", style: "highlight" });
    expect(getState().labels).toHaveLength(1);
    expect(getState().labels[0].style).toBe("highlight");
  });

  it("applyLabel updates existing label for same bodyId", () => {
    applyLabel({ bodyId: "earth", text: "Earth", style: "default" });
    applyLabel({ bodyId: "earth", text: "Earth\n1 AU", style: "highlight" });
    expect(getState().labels).toHaveLength(1);
    expect(getState().labels[0].text).toBe("Earth\n1 AU");
  });

  it("getState returns a copy — mutating it does not affect store", () => {
    applyBody({ id: "venus", name: "Venus", mass: 4.87e24, radius: 0.47, position: [72, 0, 0], velocity: [0, 0, 0], texture: "venus", color: "#e8cda0" });
    const s = getState();
    s.bodies.push({ id: "fake", name: "Fake", mass: 0, radius: 0, position: [0, 0, 0], velocity: [0, 0, 0], texture: "", color: "" });
    expect(getState().bodies).toHaveLength(1); // store unchanged
  });
});
