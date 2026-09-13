import type { BaselineFeatures, CaptureContext } from "../baseline/types";

export type RangePosition = "below" | "inside" | "above";

export interface FeatureDeviation {
  baselineMedian: number;
  baselineMin: number;
  baselineMax: number;
  current: number;
  signedDifference: number;
  absoluteDifference: number;
  rangePosition: RangePosition;
}

export interface ScanMeasurement {
  machineId: string;
  operatingStateId: string;
  capturedAt: number;
  durationMs: number;
  observationCount: number;
  quality: "valid";
  features: BaselineFeatures;
  context: CaptureContext;
}

export interface ScanComparison {
  machineId: string;
  operatingStateId: string;
  baselineId: string;
  baselineVersion: number;
  capturedAt: number;
  quality: "valid";
  features: BaselineFeatures;
  deviations: Record<keyof BaselineFeatures, FeatureDeviation>;
  captureContext: CaptureContext;
  referenceEvidence: {
    captureCount: number;
    status: "limited-reference-data" | "uncalibrated-reference-evidence";
  };
  compositeSimilarity: null;
  calibrationStatus: "unknown-needs-calibration";
}

export interface ScanResult extends ScanComparison {
  id: string;
}

export type ScanMeasurementResult =
  | { status: "accepted"; measurement: ScanMeasurement }
  | {
      status: "rejected";
      reason: import("../baseline/types").CaptureRejectionReason;
    };
