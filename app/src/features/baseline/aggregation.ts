import type { BaselineAggregate, BaselineCapture, BaselineFeatures, ObservedRange } from "./types";

export function median(values: number[]): number {
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error("Median requires finite observations");
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function summarize(values: number[]): ObservedRange {
  return { median: median(values), min: Math.min(...values), max: Math.max(...values) };
}

export function aggregateBaseline(captures: BaselineCapture[]): BaselineAggregate {
  if (captures.length < 2) throw new Error("At least two accepted captures are required");
  const [{ machineId, operatingStateId }] = captures;
  if (
    captures.some(
      (capture) => capture.machineId !== machineId || capture.operatingStateId !== operatingStateId,
    )
  ) {
    throw new Error("All captures must belong to the same machine and operating state");
  }
  const keys: (keyof BaselineFeatures)[] = ["rms", "peak", "dominantFrequencyHz", "dominantBin"];
  const features = Object.fromEntries(
    keys.map((key) => [key, summarize(captures.map((capture) => capture.features[key]))]),
  ) as Record<keyof BaselineFeatures, ObservedRange>;
  return { machineId, operatingStateId, features, sourceCaptures: structuredClone(captures) };
}
