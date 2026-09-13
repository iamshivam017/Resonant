import { describe, expect, it } from "vitest";
import { createScanMeasurementCollector } from "../../src/features/scan/measurement-collector";
import type { CaptureSessionSnapshot } from "../../src/features/sensor/types";

function snapshot(capturedAt: number, rms: number): CaptureSessionSnapshot {
  return {
    id: "session-1",
    state: "active",
    startedAt: 1,
    audioSampleRate: 48_000,
    analysisWindowSize: 2_048,
    captureDurationMs: capturedAt - 1,
    frame: {
      sessionId: "session-1",
      capturedAt,
      quality: "valid",
      timeDomain: new Float32Array([rms]),
      frequencyDomain: new Float32Array([1]),
    },
    observation: {
      rms,
      peak: 0.4,
      dominantFrequencyHz: 240,
      dominantBin: 10,
      binResolutionHz: 23.4375,
      freshness: "valid",
    },
  };
}

describe("scan measurement collector", () => {
  it("produces a valid summary from advancing real-session observations without raw frames", () => {
    const collector = createScanMeasurementCollector({ now: () => 500 });
    collector.start("machine-1", "state-1");
    collector.observe(snapshot(100, 0.2));
    collector.observe(snapshot(150, 0.4));

    const result = collector.finish();

    expect(result).toEqual({
      status: "accepted",
      measurement: {
        machineId: "machine-1",
        operatingStateId: "state-1",
        capturedAt: 500,
        durationMs: 50,
        observationCount: 2,
        quality: "valid",
        features: {
          rms: 0.30000000000000004,
          peak: 0.4,
          dominantFrequencyHz: 240,
          dominantBin: 10,
        },
        context: { audioSampleRate: 48_000, analysisWindowSize: 2_048 },
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/timeDomain|frequencyDomain/);
  });

  it("retains fail-closed capture rejection states", () => {
    const collector = createScanMeasurementCollector({ now: () => 500 });
    collector.start("machine-1", "state-1");
    const silent = snapshot(100, 0);
    if (silent.frame) silent.frame.quality = "silent";
    collector.observe(silent);

    expect(collector.finish()).toEqual({ status: "rejected", reason: "silent" });
  });
});
