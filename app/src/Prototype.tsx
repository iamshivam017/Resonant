import { useEffect, useState } from "react";
import { BaselineFlow } from "./features/baseline/components/baseline-flow";
import { IndexedDbBaselineStorage } from "./features/baseline/indexeddb-storage";
import { BaselineRepository } from "./features/baseline/repository";
import type { Baseline, Machine, OperatingState } from "./features/baseline/types";
import { ScanFlow } from "./features/scan/components/scan-flow";
import { IndexedDbScanStorage } from "./features/scan/indexeddb-storage";
import { ScanRepository } from "./features/scan/repository";
import { createBrowserCaptureSession } from "./features/sensor/browser-session";
import { SensorInstrument } from "./features/sensor/components/sensor-instrument";
import { MobileScroll } from "./mobile";

// Build app-specific screens and flows in this file. The surrounding mobile
// runtime is template-owned and intentionally lives outside this component.
export default function Prototype() {
  const [controller] = useState(createBrowserCaptureSession);
  const [repository] = useState(
    () =>
      new BaselineRepository(
        new IndexedDbBaselineStorage(),
        () => Date.now(),
        () => crypto.randomUUID(),
      ),
  );
  const [scanRepository] = useState(
    () => new ScanRepository(new IndexedDbScanStorage(), repository, () => crypto.randomUUID()),
  );
  const [mode, setMode] = useState<"baseline" | "sensor" | "scan">("baseline");
  const [scanTarget, setScanTarget] = useState<{
    machine: Machine;
    operatingState: OperatingState;
    baseline: Baseline;
  }>();

  useEffect(() => {
    const stopCapture = () => void controller.stop();
    window.addEventListener("pagehide", stopCapture);
    return () => window.removeEventListener("pagehide", stopCapture);
  }, [controller]);

  if (mode === "baseline") {
    return (
      <div className="app-screen app-shell">
        <BaselineFlow
          controller={controller}
          repository={repository}
          onOpenSensor={() => setMode("sensor")}
          onRunComparison={(machine, operatingState, baseline) => {
            setScanTarget({ machine, operatingState, baseline });
            setMode("scan");
          }}
        />
      </div>
    );
  }
  if (mode === "scan" && scanTarget) {
    return (
      <div className="app-screen app-shell">
        <MobileScroll className="scan-workspace">
          <ScanFlow
            {...scanTarget}
            controller={controller}
            repository={scanRepository}
            onExit={() => setMode("baseline")}
          />
        </MobileScroll>
      </div>
    );
  }
  return (
    <div className="app-screen app-shell">
      <button
        type="button"
        className="return-control"
        onClick={() => {
          void controller.stop();
          setMode("baseline");
        }}
      >
        Return to baseline setup
      </button>
      <MobileScroll className="sensor-workspace">
        <SensorInstrument controller={controller} />
      </MobileScroll>
    </div>
  );
}
