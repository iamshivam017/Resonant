import type { Baseline, BaselineFeatures, ObservedRange } from "../baseline/types";
import type { FeatureDeviation, ScanComparison, ScanMeasurement } from "./types";

const featureKeys: (keyof BaselineFeatures)[] = [
  "rms",
  "peak",
  "dominantFrequencyHz",
  "dominantBin",
];

function finite(value: number, label: string) {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
}

function compareFeature(reference: ObservedRange, current: number): FeatureDeviation {
  finite(reference.median, "Baseline median");
  finite(reference.min, "Baseline minimum");
  finite(reference.max, "Baseline maximum");
  finite(current, "Current feature");
  if (reference.min > reference.median || reference.median > reference.max) {
    throw new Error("Baseline range is inconsistent");
  }
  const signedDifference = current - reference.median;
  return {
    baselineMedian: reference.median,
    baselineMin: reference.min,
    baselineMax: reference.max,
    current,
    signedDifference,
    absoluteDifference: Math.abs(signedDifference),
    rangePosition: current < reference.min ? "below" : current > reference.max ? "above" : "inside",
  };
}

export function compareWithBaseline(
  baseline: Baseline,
  measurement: ScanMeasurement,
): ScanComparison {
  if (baseline.status !== "active") throw new Error("Active baseline is required");
  if (
    baseline.machineId !== measurement.machineId ||
    baseline.operatingStateId !== measurement.operatingStateId
  ) {
    throw new Error("NO MATCHING REFERENCE");
  }
  if (measurement.quality !== "valid") throw new Error("Valid current measurement is required");
  finite(measurement.capturedAt, "Capture timestamp");
  finite(measurement.durationMs, "Capture duration");
  finite(measurement.observationCount, "Observation count");

  const deviations = {} as Record<keyof BaselineFeatures, FeatureDeviation>;
  for (const key of featureKeys) {
    deviations[key] = compareFeature(baseline.features[key], measurement.features[key]);
  }

  return {
    machineId: measurement.machineId,
    operatingStateId: measurement.operatingStateId,
    baselineId: baseline.id,
    baselineVersion: baseline.version,
    capturedAt: measurement.capturedAt,
    quality: "valid",
    features: structuredClone(measurement.features),
    deviations,
    captureContext: structuredClone(measurement.context),
    referenceEvidence: {
      captureCount: baseline.sourceCaptures.length,
      status:
        baseline.sourceCaptures.length === 2
          ? "limited-reference-data"
          : "uncalibrated-reference-evidence",
    },
    compositeSimilarity: null,
    calibrationStatus: "unknown-needs-calibration",
  };
}
