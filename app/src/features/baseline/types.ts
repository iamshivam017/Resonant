import type { ObservedTrackSettings } from "../sensor/types";

export interface Machine {
  id: string;
  name: string;
  category: string;
  manufacturer?: string;
  model?: string;
  notes?: string;
  createdAt: number;
}

export interface OperatingState {
  id: string;
  machineId: string;
  name: string;
  notes?: string;
  createdAt: number;
}

export interface BaselineFeatures {
  rms: number;
  peak: number;
  dominantFrequencyHz: number;
  dominantBin: number;
}

export interface CaptureContext {
  audioSampleRate: number;
  analysisWindowSize: number;
  trackSettings?: ObservedTrackSettings;
}

export interface BaselineCapture {
  id: string;
  machineId: string;
  operatingStateId: string;
  capturedAt: number;
  durationMs: number;
  observationCount: number;
  features: BaselineFeatures;
  context: CaptureContext;
}

export interface ObservedRange {
  median: number;
  min: number;
  max: number;
}

export interface BaselineAggregate {
  machineId: string;
  operatingStateId: string;
  features: Record<keyof BaselineFeatures, ObservedRange>;
  sourceCaptures: BaselineCapture[];
}

export interface Baseline extends BaselineAggregate {
  id: string;
  version: number;
  status: "active" | "superseded";
  createdAt: number;
  knownNormalConfirmedAt: number;
  manualConsistencyConfirmedAt: number;
}

export interface BaselineData {
  machines: Machine[];
  operatingStates: OperatingState[];
  captures: BaselineCapture[];
  baselines: Baseline[];
}

export type CaptureRejectionReason =
  | "silent"
  | "clipping"
  | "degraded"
  | "insufficient"
  | "stale"
  | "interrupted"
  | "non-advancing"
  | "insufficient-duration";

export type CaptureResult =
  | { status: "accepted"; capture: BaselineCapture }
  | { status: "rejected"; reason: CaptureRejectionReason };
