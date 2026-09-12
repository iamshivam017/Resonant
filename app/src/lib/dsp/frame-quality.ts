import type { FrameQuality } from "../../features/sensor/types";

export const FRAME_STALE_AFTER_MS = 2_000;

export interface FrameQualityContext {
  signalProcessingActive: boolean;
}

export function classifyFrameQuality(
  timeDomain: Float32Array,
  frequencyDomain: Float32Array,
  capturedAt: number,
  observedAt: number,
  context: FrameQualityContext = { signalProcessingActive: false },
): FrameQuality {
  if (observedAt - capturedAt > FRAME_STALE_AFTER_MS) return "stale";
  if (!timeDomain.length || frequencyDomain.length < 2) return "insufficient";
  if (!Array.from(timeDomain).every(Number.isFinite)) return "insufficient";
  if (!Array.from(frequencyDomain).some(Number.isFinite)) return "insufficient";
  if (context.signalProcessingActive) return "degraded";
  return "valid";
}
