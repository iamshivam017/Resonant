import type { FeatureObservation } from "../../features/sensor/types";

export interface DominantBinRange {
  firstEligibleBin: number;
  lastEligibleBinExclusive?: number;
}

export function analyzeSignalFrame(
  timeDomain: Float32Array,
  frequencyDomain: Float32Array,
  sampleRate: number,
  transformSize: number,
  range: DominantBinRange,
): FeatureObservation {
  const finiteTime = Array.from(timeDomain).filter(Number.isFinite);
  const rms = finiteTime.length
    ? Math.sqrt(
        finiteTime.reduce((total, sample) => total + sample * sample, 0) / finiteTime.length,
      )
    : 0;
  const peak = finiteTime.length ? Math.max(...finiteTime.map(Math.abs)) : 0;
  const binResolutionHz = transformSize > 0 ? sampleRate / transformSize : 0;

  let dominantBin: number | null = null;
  let strongest = Number.NEGATIVE_INFINITY;
  const firstEligibleBin = Math.max(0, Math.floor(range.firstEligibleBin));
  const lastEligibleBinExclusive = Math.min(
    frequencyDomain.length,
    Math.max(
      firstEligibleBin,
      Math.floor(range.lastEligibleBinExclusive ?? frequencyDomain.length),
    ),
  );
  for (let index = firstEligibleBin; index < lastEligibleBinExclusive; index += 1) {
    const value = frequencyDomain[index];
    if (Number.isFinite(value) && value > strongest) {
      strongest = value;
      dominantBin = index;
    }
  }

  return {
    rms,
    peak,
    dominantBin,
    dominantFrequencyHz: dominantBin === null ? null : dominantBin * binResolutionHz,
    binResolutionHz,
    freshness: "valid",
  };
}
