import type { BaselineFeatures, CaptureContext } from "../baseline/types";
import type { FeatureDeviation, ScanComparison, ScanResult } from "./types";

const featureKeys: (keyof BaselineFeatures)[] = [
  "rms",
  "peak",
  "dominantFrequencyHz",
  "dominantBin",
];

function required(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} is required`);
  }
  return value.trim();
}

function finite(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be finite`);
  }
  return value;
}

function validateContext(value: CaptureContext): CaptureContext {
  const audioSampleRate = finite(value?.audioSampleRate, "Audio sample rate");
  const analysisWindowSize = finite(value?.analysisWindowSize, "Analysis window size");
  if (audioSampleRate <= 0 || analysisWindowSize <= 0) {
    throw new Error("Capture context values must be positive");
  }
  return {
    audioSampleRate,
    analysisWindowSize,
    trackSettings: value.trackSettings ? structuredClone(value.trackSettings) : undefined,
  };
}

function validateDeviation(value: FeatureDeviation, label: string): FeatureDeviation {
  const baselineMedian = finite(value?.baselineMedian, `${label} baseline median`);
  const baselineMin = finite(value?.baselineMin, `${label} baseline minimum`);
  const baselineMax = finite(value?.baselineMax, `${label} baseline maximum`);
  const current = finite(value?.current, `${label} current value`);
  const signedDifference = finite(value?.signedDifference, `${label} signed difference`);
  const absoluteDifference = finite(value?.absoluteDifference, `${label} absolute difference`);
  if (baselineMin > baselineMedian || baselineMedian > baselineMax) {
    throw new Error(`${label} baseline range is inconsistent`);
  }
  const expectedSigned = current - baselineMedian;
  const expectedPosition =
    current < baselineMin ? "below" : current > baselineMax ? "above" : "inside";
  if (
    signedDifference !== expectedSigned ||
    absoluteDifference !== Math.abs(expectedSigned) ||
    value.rangePosition !== expectedPosition
  ) {
    throw new Error(`${label} deviation evidence is inconsistent`);
  }
  return {
    baselineMedian,
    baselineMin,
    baselineMax,
    current,
    signedDifference,
    absoluteDifference,
    rangePosition: expectedPosition,
  };
}

export function validateScanComparison(value: ScanComparison): ScanComparison {
  if (value.quality !== "valid") throw new Error("Valid current measurement is required");
  if (value.compositeSimilarity !== null) {
    throw new Error("Composite baseline similarity is not calibrated");
  }
  if (value.calibrationStatus !== "unknown-needs-calibration") {
    throw new Error("Calibration status is invalid");
  }
  const captureCount = finite(value.referenceEvidence?.captureCount, "Reference capture count");
  if (!Number.isInteger(captureCount) || captureCount < 2) {
    throw new Error("Reference capture count is invalid");
  }
  const expectedReferenceStatus =
    captureCount === 2 ? "limited-reference-data" : "uncalibrated-reference-evidence";
  if (value.referenceEvidence.status !== expectedReferenceStatus) {
    throw new Error("Reference evidence status is invalid");
  }

  const features = {} as BaselineFeatures;
  const deviations = {} as Record<keyof BaselineFeatures, FeatureDeviation>;
  for (const key of featureKeys) {
    features[key] = finite(value.features?.[key], `${key} feature`);
    deviations[key] = validateDeviation(value.deviations?.[key], key);
    if (features[key] !== deviations[key].current) {
      throw new Error(`${key} current evidence does not match its feature`);
    }
  }

  const baselineVersion = finite(value.baselineVersion, "Baseline version");
  if (!Number.isInteger(baselineVersion) || baselineVersion < 1) {
    throw new Error("Baseline version is invalid");
  }

  return {
    machineId: required(value.machineId, "Machine id"),
    operatingStateId: required(value.operatingStateId, "Operating state id"),
    baselineId: required(value.baselineId, "Baseline id"),
    baselineVersion,
    capturedAt: finite(value.capturedAt, "Capture timestamp"),
    quality: "valid",
    features,
    deviations,
    captureContext: validateContext(value.captureContext),
    referenceEvidence: { captureCount, status: expectedReferenceStatus },
    compositeSimilarity: null,
    calibrationStatus: "unknown-needs-calibration",
  };
}

export function validateScanResult(value: ScanResult): ScanResult {
  return { ...validateScanComparison(value), id: required(value.id, "Scan id") };
}
