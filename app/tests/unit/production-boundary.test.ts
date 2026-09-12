import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const productionFiles = [
  "src/Prototype.tsx",
  "src/features/sensor/browser-session.ts",
  "src/features/sensor/capture-session.ts",
  "src/features/sensor/components/sensor-instrument.tsx",
  "src/features/sensor/components/waveform-canvas.tsx",
  "src/features/sensor/components/spectrum-canvas.tsx",
];

describe("production sensor boundary", () => {
  const source = productionFiles.map((file) => readFileSync(resolve(file), "utf8")).join("\n");

  it("does not import test fixtures or embed simulated telemetry", () => {
    expect(source).not.toMatch(/tests[\\/]fixtures|fake(?:Frame|Stream|Track|Telemetry)/i);
  });

  it("does not persist or transmit raw microphone frames", () => {
    expect(source).not.toMatch(/localStorage|indexedDB|fetch\s*\(|XMLHttpRequest|WebSocket/);
  });

  it("does not contain credential-shaped assignments", () => {
    expect(source).not.toMatch(/(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{8,}/i);
  });
});
