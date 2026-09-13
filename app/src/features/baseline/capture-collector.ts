import type { CaptureSessionSnapshot } from "../sensor/types";
import { median } from "./aggregation";
import type { BaselineFeatures, CaptureRejectionReason, CaptureResult } from "./types";

export interface CollectorDependencies {
  makeId: () => string;
  now: () => number;
}

const rejectionCopy: Record<CaptureRejectionReason, string> = {
  silent: "Exact silence detected. Capture rejected.",
  clipping: "Digital full-scale clipping detected. Move the phone and retry.",
  degraded: "Browser processing is active. Capture rejected for baseline use.",
  insufficient: "No reliable feature observation was available.",
  stale: "Stale input detected. Capture rejected.",
  interrupted: "Microphone capture was interrupted.",
  "non-advancing": "Capture timing did not advance.",
  "insufficient-duration":
    "Capture needs at least two advancing observations. A calibrated duration threshold is UNKNOWN / NEEDS CALIBRATION.",
};

export function captureRejectionMessage(reason: CaptureRejectionReason) {
  return rejectionCopy[reason];
}

export function createBaselineCaptureCollector(dependencies: CollectorDependencies) {
  let machineId: string | undefined;
  let operatingStateId: string | undefined;
  let observations: { capturedAt: number; features: BaselineFeatures }[] = [];
  let context: CaptureSessionSnapshot | undefined;
  let rejection: CaptureRejectionReason | undefined;

  const reset = () => {
    machineId = undefined;
    operatingStateId = undefined;
    observations = [];
    context = undefined;
    rejection = undefined;
  };

  return {
    start(nextMachineId: string, nextOperatingStateId: string) {
      reset();
      machineId = nextMachineId;
      operatingStateId = nextOperatingStateId;
    },
    observe(snapshot: CaptureSessionSnapshot) {
      if (!machineId || rejection) return;
      if (["interrupted", "failed", "denied", "unsupported", "stopped"].includes(snapshot.state)) {
        rejection = "interrupted";
        return;
      }
      if (snapshot.state !== "active" || !snapshot.frame) return;
      if (snapshot.frame.quality !== "valid" || snapshot.observation?.freshness !== "valid") {
        rejection = snapshot.frame.quality === "valid" ? "insufficient" : snapshot.frame.quality;
        return;
      }
      const previous = observations.at(-1)?.capturedAt;
      if (previous !== undefined && snapshot.frame.capturedAt <= previous) {
        rejection = "non-advancing";
        return;
      }
      const observation = snapshot.observation;
      if (observation.dominantFrequencyHz === null || observation.dominantBin === null) {
        rejection = "insufficient";
        return;
      }
      observations.push({
        capturedAt: snapshot.frame.capturedAt,
        features: {
          rms: observation.rms,
          peak: observation.peak,
          dominantFrequencyHz: observation.dominantFrequencyHz,
          dominantBin: observation.dominantBin,
        },
      });
      context = snapshot;
    },
    finish(): CaptureResult {
      if (!machineId || !operatingStateId) throw new Error("Capture collection has not started");
      if (rejection) return { status: "rejected", reason: rejection };
      const first = observations[0]?.capturedAt;
      const last = observations.at(-1)?.capturedAt;
      if (
        observations.length < 2 ||
        first === undefined ||
        last === undefined ||
        last <= first ||
        !context?.audioSampleRate ||
        !context.analysisWindowSize
      ) {
        return { status: "rejected", reason: "insufficient-duration" };
      }
      const result: CaptureResult = {
        status: "accepted",
        capture: {
          id: dependencies.makeId(),
          machineId,
          operatingStateId,
          capturedAt: dependencies.now(),
          durationMs: last - first,
          observationCount: observations.length,
          features: {
            rms: median(observations.map(({ features }) => features.rms)),
            peak: median(observations.map(({ features }) => features.peak)),
            dominantFrequencyHz: median(
              observations.map(({ features }) => features.dominantFrequencyHz),
            ),
            dominantBin: median(observations.map(({ features }) => features.dominantBin)),
          },
          context: {
            audioSampleRate: context.audioSampleRate,
            analysisWindowSize: context.analysisWindowSize,
            trackSettings: context.trackSettings
              ? structuredClone(context.trackSettings)
              : undefined,
          },
        },
      };
      reset();
      return result;
    },
  };
}
