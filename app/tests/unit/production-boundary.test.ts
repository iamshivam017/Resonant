import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sensorFiles = [
  "src/Prototype.tsx",
  "src/features/sensor/browser-session.ts",
  "src/features/sensor/capture-session.ts",
  "src/features/sensor/components/sensor-instrument.tsx",
  "src/features/sensor/components/waveform-canvas.tsx",
  "src/features/sensor/components/spectrum-canvas.tsx",
];

const baselineFiles = [
  "src/Prototype.tsx",
  "src/features/baseline/indexeddb-storage.ts",
  "src/features/baseline/repository.ts",
  "src/features/baseline/components/baseline-flow.tsx",
];

describe("production sensor boundary", () => {
  const sensorSource = sensorFiles.map((file) => readFileSync(resolve(file), "utf8")).join("\n");
  const baselineSource = baselineFiles
    .map((file) => readFileSync(resolve(file), "utf8"))
    .join("\n");
  const source = `${sensorSource}\n${baselineSource}`;

  it("does not import test fixtures or embed simulated telemetry", () => {
    expect(source).not.toMatch(/tests[\\/]fixtures|fake(?:Frame|Stream|Track|Telemetry)/i);
  });

  it("does not persist or transmit raw microphone frames", () => {
    expect(sensorSource).not.toMatch(/localStorage|indexedDB|fetch\s*\(|XMLHttpRequest|WebSocket/);
  });

  it("does not contain credential-shaped assignments", () => {
    expect(source).not.toMatch(/(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{8,}/i);
  });

  it("keeps raw signal arrays outside the persistent storage adapter", () => {
    const storageSource = readFileSync(
      resolve("src/features/baseline/indexeddb-storage.ts"),
      "utf8",
    );
    expect(storageSource).not.toMatch(/timeDomain|frequencyDomain|SignalFrame|Float32Array/);
  });

  it("adds no scoring, diagnosis, or network integration path", () => {
    expect(source).not.toMatch(
      /fetch\s*\(|XMLHttpRequest|WebSocket|healthScore|conditionScore|anomalyScore/,
    );
  });
});
