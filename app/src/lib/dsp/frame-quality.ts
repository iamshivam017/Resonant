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

  let isSilent = true;
  let hasFullScaleSample = false;
  for (const sample of timeDomain) {
    if (!Number.isFinite(sample)) return "insufficient";
    if (sample !== 0) isSilent = false;
    if (Math.abs(sample) >= 1) hasFullScaleSample = true;
  }

  let hasFiniteSpectrumValue = false;
  for (const sample of frequencyDomain) {
    if (Number.isFinite(sample)) {
      hasFiniteSpectrumValue = true;
      break;
    }
  }
  if (!hasFiniteSpectrumValue) return "insufficient";
  if (isSilent) return "silent";
  if (hasFullScaleSample) return "clipping";
  if (context.signalProcessingActive) return "degraded";
  return "valid";
}
