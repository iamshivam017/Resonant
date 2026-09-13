import { describe, expect, it } from "vitest";
import { compareWithBaseline } from "../../src/features/scan/comparison";
import type { ScanMeasurement } from "../../src/features/scan/types";
import type { Baseline } from "../../src/features/baseline/types";

const baseline = (overrides: Partial<Baseline> = {}): Baseline => ({
  id: "baseline-1",
  machineId: "machine-1",
  operatingStateId: "state-1",
  version: 2,
  status: "active",
  createdAt: 100,
  knownNormalConfirmedAt: 90,
  manualConsistencyConfirmedAt: 95,
  features: {
    rms: { median: 0.2, min: 0.1, max: 0.3 },
    peak: { median: 0.4, min: 0.3, max: 0.5 },
    dominantFrequencyHz: { median: 240, min: 220, max: 260 },
    dominantBin: { median: 10, min: 9, max: 11 },
  },
  sourceCaptures: [
    {
      id: "capture-1",
      machineId: "machine-1",
      operatingStateId: "state-1",
      capturedAt: 1,
      durationMs: 100,
      observationCount: 2,
      features: { rms: 0.1, peak: 0.3, dominantFrequencyHz: 220, dominantBin: 9 },
      context: { audioSampleRate: 48_000, analysisWindowSize: 2_048 },
    },
    {
      id: "capture-2",
      machineId: "machine-1",
      operatingStateId: "state-1",
      capturedAt: 2,
      durationMs: 100,
      observationCount: 2,
      features: { rms: 0.3, peak: 0.5, dominantFrequencyHz: 260, dominantBin: 11 },
      context: { audioSampleRate: 48_000, analysisWindowSize: 2_048 },
    },
  ],
  ...overrides,
});

const measurement = (overrides: Partial<ScanMeasurement> = {}): ScanMeasurement => ({
  machineId: "machine-1",
  operatingStateId: "state-1",
  capturedAt: 200,
  durationMs: 120,
  observationCount: 3,
  quality: "valid",
  features: { rms: 0.2, peak: 0.4, dominantFrequencyHz: 240, dominantBin: 10 },
  context: { audioSampleRate: 48_000, analysisWindowSize: 2_048 },
  ...overrides,
});

describe("transparent baseline comparison", () => {
  it("returns zero native-unit difference and inside-range evidence for an identical measurement", () => {
    const result = compareWithBaseline(baseline(), measurement());

    expect(result.deviations.rms).toEqual({
      baselineMedian: 0.2,
      baselineMin: 0.1,
      baselineMax: 0.3,
      current: 0.2,
      signedDifference: 0,
      absoluteDifference: 0,
      rangePosition: "inside",
    });
    expect(result.compositeSimilarity).toBeNull();
    expect(result.calibrationStatus).toBe("unknown-needs-calibration");
    expect(result.baselineId).toBe("baseline-1");
    expect(result.baselineVersion).toBe(2);
  });

  it("reports below, inside, and above positions inclusively without range division", () => {
    const result = compareWithBaseline(
      baseline(),
      measurement({
        features: { rms: 0.05, peak: 0.5, dominantFrequencyHz: 300, dominantBin: 10 },
      }),
    );

    expect(result.deviations.rms.rangePosition).toBe("below");
    expect(result.deviations.peak.rangePosition).toBe("inside");
    expect(result.deviations.dominantFrequencyHz.rangePosition).toBe("above");
  });

  it("produces progressively larger absolute differences deterministically", () => {
    const near = compareWithBaseline(
      baseline(),
      measurement({ features: { ...measurement().features, rms: 0.25 } }),
    );
    const far = compareWithBaseline(
      baseline(),
      measurement({ features: { ...measurement().features, rms: 0.5 } }),
    );

    expect(far.deviations.rms.absoluteDifference).toBeGreaterThan(
      near.deviations.rms.absoluteDifference,
    );
    expect(compareWithBaseline(baseline(), measurement())).toEqual(
      compareWithBaseline(baseline(), measurement()),
    );
  });

  it("handles a zero-width observed range without NaN or Infinity", () => {
    const reference = baseline({
      features: {
        ...baseline().features,
        rms: { median: 0.2, min: 0.2, max: 0.2 },
      },
    });
    const result = compareWithBaseline(
      reference,
      measurement({ features: { ...measurement().features, rms: 0.3 } }),
    );

    expect(result.deviations.rms.absoluteDifference).toBeCloseTo(0.1);
    expect(result.deviations.rms.rangePosition).toBe("above");
    expect(JSON.stringify(result)).not.toMatch(/NaN|Infinity/);
  });

  it.each([
    ["a mismatched machine", baseline(), measurement({ machineId: "machine-2" })],
    ["a mismatched state", baseline(), measurement({ operatingStateId: "state-2" })],
    ["a superseded reference", baseline({ status: "superseded" }), measurement()],
    [
      "a non-finite feature",
      baseline(),
      measurement({ features: { ...measurement().features, peak: Number.NaN } }),
    ],
  ])("rejects %s", (_name, reference, current) => {
    expect(() => compareWithBaseline(reference, current)).toThrow();
  });

  it("labels two captures as limited without claiming larger samples are adequate", () => {
    expect(compareWithBaseline(baseline(), measurement()).referenceEvidence).toEqual({
      captureCount: 2,
      status: "limited-reference-data",
    });
    const threeCaptures = baseline({
      sourceCaptures: [...baseline().sourceCaptures, baseline().sourceCaptures[0]],
    });
    expect(compareWithBaseline(threeCaptures, measurement()).referenceEvidence).toEqual({
      captureCount: 3,
      status: "uncalibrated-reference-evidence",
    });
  });
});
