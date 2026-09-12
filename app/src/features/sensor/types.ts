export type CaptureSessionState =
  | "idle"
  | "ready"
  | "requesting-permission"
  | "initializing"
  | "active"
  | "stopping"
  | "stopped"
  | "denied"
  | "unsupported"
  | "interrupted"
  | "failed";

export type FrameQuality = "valid" | "degraded" | "insufficient" | "stale";

export type CaptureErrorCode =
  | "permission-denied"
  | "unsupported"
  | "device-unavailable"
  | "constraint-failed"
  | "interrupted"
  | "processing-failed";

export interface CaptureCapability {
  secureContext: boolean;
  mediaDevicesAvailable: boolean;
  audioInputSupported: boolean;
  supportedConstraints: MediaTrackSupportedConstraints;
  checkedAt: number;
}

export interface CaptureError {
  code: CaptureErrorCode;
  summary: string;
  recovery: string;
  causeName?: string;
}

export interface ObservedTrackSettings {
  sampleRate?: number;
  sampleSize?: number;
  channelCount?: number;
  latency?: number;
  autoGainControl?: boolean;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  deviceId?: string;
}

export interface SignalFrame {
  sessionId: string;
  capturedAt: number;
  timeDomain: Float32Array;
  frequencyDomain: Float32Array;
  quality: FrameQuality;
}

export interface FeatureObservation {
  rms: number;
  peak: number;
  dominantBin: number | null;
  dominantFrequencyHz: number | null;
  binResolutionHz: number;
  freshness: FrameQuality;
}

export interface CaptureSessionSnapshot {
  id: string | null;
  state: CaptureSessionState;
  startedAt?: number;
  stoppedAt?: number;
  trackSettings?: ObservedTrackSettings;
  audioSampleRate?: number;
  analysisWindowSize?: number;
  error?: CaptureError;
  frame?: SignalFrame;
  observation?: FeatureObservation;
}
