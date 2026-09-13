import { createBaselineCaptureCollector } from "../baseline/capture-collector";
import type { CaptureSessionSnapshot } from "../sensor/types";
import type { ScanMeasurementResult } from "./types";

export function createScanMeasurementCollector(dependencies: { now: () => number }) {
  const collector = createBaselineCaptureCollector({
    now: dependencies.now,
    makeId: () => "ephemeral-scan-capture",
  });

  return {
    start(machineId: string, operatingStateId: string) {
      collector.start(machineId, operatingStateId);
    },
    observe(snapshot: CaptureSessionSnapshot) {
      collector.observe(snapshot);
    },
    finish(): ScanMeasurementResult {
      const result = collector.finish();
      if (result.status === "rejected") return result;
      const { id: _ephemeralId, context, ...capture } = result.capture;
      return {
        status: "accepted",
        measurement: {
          ...capture,
          quality: "valid",
          context,
        },
      };
    },
  };
}
