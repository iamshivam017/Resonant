import { describe, expect, it } from "vitest";
import { aggregateBaseline } from "../../src/features/baseline/aggregation";
import type { BaselineCapture } from "../../src/features/baseline/types";

const capture = (
  id: string,
  rms: number,
  peak: number,
  frequency: number,
  bin: number,
): BaselineCapture => ({
  id,
  machineId: "machine-1",
  operatingStateId: "state-1",
  capturedAt: 100,
  durationMs: 1_000,
  observationCount: 3,
  features: { rms, peak, dominantFrequencyHz: frequency, dominantBin: bin },
  context: { audioSampleRate: 48_000, analysisWindowSize: 2_048 },
});

describe("baseline aggregation", () => {
  it("retains sources and exposes median plus observed ranges", () => {
    const result = aggregateBaseline([
      capture("capture-1", 0.1, 0.2, 100, 4),
      capture("capture-2", 0.3, 0.8, 300, 12),
      capture("capture-3", 0.2, 0.5, 200, 8),
    ]);
    expect(result.features.rms).toEqual({ median: 0.2, min: 0.1, max: 0.3 });
    expect(result.features.dominantFrequencyHz).toEqual({ median: 200, min: 100, max: 300 });
    expect(result.sourceCaptures.map(({ id }) => id)).toEqual([
      "capture-1",
      "capture-2",
      "capture-3",
    ]);
  });

  it("requires a literal multiple and rejects mixed machine/state captures", () => {
    expect(() => aggregateBaseline([capture("capture-1", 0.1, 0.2, 100, 4)])).toThrow(
      "At least two accepted captures are required",
    );
    const mixed = { ...capture("capture-2", 0.2, 0.4, 200, 8), operatingStateId: "state-2" };
    expect(() => aggregateBaseline([capture("capture-1", 0.1, 0.2, 100, 4), mixed])).toThrow(
      "same machine and operating state",
    );
  });
});
