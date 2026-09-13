import { ChevronLeftIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Baseline, BaselineFeatures, Machine, OperatingState } from "../../baseline/types";
import { captureRejectionMessage } from "../../baseline/capture-collector";
import type { CaptureSessionController } from "../../sensor/capture-session";
import { SensorInstrument } from "../../sensor/components/sensor-instrument";
import { compareWithBaseline } from "../comparison";
import { createScanMeasurementCollector } from "../measurement-collector";
import type { ScanRepository } from "../repository";
import type { FeatureDeviation, ScanResult } from "../types";

interface ScanFlowProps {
  baseline: Baseline;
  machine: Machine;
  operatingState: OperatingState;
  controller: CaptureSessionController;
  repository: ScanRepository;
  now?: () => number;
  onExit: () => void;
}

const systemNow = () => Date.now();

const featureRows: {
  key: keyof BaselineFeatures;
  label: string;
  suffix: string;
  decimals: number;
}[] = [
  { key: "rms", label: "RMS amplitude", suffix: "", decimals: 3 },
  { key: "peak", label: "Peak amplitude", suffix: "", decimals: 3 },
  { key: "dominantFrequencyHz", label: "Dominant spectral peak", suffix: " Hz", decimals: 3 },
  { key: "dominantBin", label: "Dominant FFT bin", suffix: "", decimals: 3 },
];

function number(value: number, decimals: number, suffix = "") {
  return `${value.toFixed(decimals)}${suffix}`;
}

function signed(value: number, decimals: number, suffix = "") {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}

function DeviationRow({
  label,
  value,
  suffix,
  decimals,
}: {
  label: string;
  value: FeatureDeviation;
  suffix: string;
  decimals: number;
}) {
  return (
    <fieldset className="deviation-card" aria-label={`${label} deviation`}>
      <header>
        <h2>{label}</h2>
        <strong className={`range-position is-${value.rangePosition}`}>
          {value.rangePosition[0].toUpperCase() + value.rangePosition.slice(1)}
        </strong>
      </header>
      <dl>
        <div>
          <dt>Current</dt>
          <dd>{number(value.current, decimals, suffix)}</dd>
        </div>
        <div>
          <dt>Reference median</dt>
          <dd>{number(value.baselineMedian, decimals, suffix)}</dd>
        </div>
        <div>
          <dt>Signed difference</dt>
          <dd>{signed(value.signedDifference, decimals, suffix)}</dd>
        </div>
        <div>
          <dt>Absolute difference</dt>
          <dd>{number(value.absoluteDifference, decimals, suffix)}</dd>
        </div>
      </dl>
      <p>
        Observed reference range {number(value.baselineMin, decimals, suffix)}–
        {number(value.baselineMax, decimals, suffix)}
      </p>
    </fieldset>
  );
}

export function ScanFlow({
  baseline,
  machine,
  operatingState,
  controller,
  repository,
  now = systemNow,
  onExit,
}: ScanFlowProps) {
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const collector = useMemo(() => createScanMeasurementCollector({ now }), [now]);
  const unsubscribe = useRef<(() => void) | undefined>(undefined);
  const [collecting, setCollecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ScanResult>();
  const [message, setMessage] = useState<string>();
  const valid =
    snapshot.state === "active" &&
    snapshot.frame?.quality === "valid" &&
    snapshot.observation?.freshness === "valid";

  useEffect(
    () => () => {
      unsubscribe.current?.();
      void controller.stop();
    },
    [controller],
  );

  const begin = () => {
    setMessage(undefined);
    collector.start(machine.id, operatingState.id);
    unsubscribe.current = controller.subscribe((value) => collector.observe(value));
    setCollecting(true);
  };

  const finish = async () => {
    unsubscribe.current?.();
    unsubscribe.current = undefined;
    setCollecting(false);
    const measurement = collector.finish();
    if (measurement.status === "rejected") {
      setMessage(captureRejectionMessage(measurement.reason));
      return;
    }
    setSaving(true);
    try {
      const saved = await repository.saveComparison(
        compareWithBaseline(baseline, measurement.measurement),
      );
      setResult(saved);
      await controller.stop();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Comparison evidence could not be saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="scan-flow">
      <header className="scan-header">
        <button
          type="button"
          className="icon-button"
          aria-label="Return to baselines"
          onClick={onExit}
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <span>Phase 4 · local comparison</span>
          <strong>
            {machine.name} · {operatingState.name}
          </strong>
        </div>
        <LockClosedIcon aria-label="Local processing only" />
      </header>

      {result ? (
        <div className="scan-result">
          <header className="baseline-intro">
            <p>Evidence result · baseline v{result.baselineVersion}</p>
            <h1>Observed deviation evidence</h1>
            <span>
              Current feature summaries compared with the exact active reference. No raw audio was
              retained.
            </span>
          </header>
          <section className="scan-boundary">
            <div>
              <span>Reference evidence</span>
              <strong>
                {result.referenceEvidence.status === "limited-reference-data"
                  ? "LIMITED REFERENCE DATA"
                  : `${result.referenceEvidence.captureCount} SOURCE CAPTURES`}
              </strong>
            </div>
            <div>
              <span>Composite baseline similarity</span>
              <strong>Not calculated</strong>
            </div>
            <p>UNKNOWN / NEEDS CALIBRATION</p>
          </section>
          <div className="deviation-grid">
            {featureRows.map(({ key, ...presentation }) => (
              <DeviationRow key={key} {...presentation} value={result.deviations[key]} />
            ))}
          </div>
          <section className="truth-panel">
            <strong>Interpretation boundary</strong>
            <p>
              Above, inside, and below describe only the operator-created reference range. They are
              not machine-condition classifications.
            </p>
          </section>
          <button type="button" className="baseline-secondary" onClick={() => setResult(undefined)}>
            Measure again
          </button>
        </div>
      ) : (
        <div className="scan-capture">
          <header className="baseline-intro">
            <p>Current measurement</p>
            <h1>Compare live evidence</h1>
            <span>
              Capture the same machine in the selected operating state and placement context.
            </span>
          </header>
          <section className="scan-reference">
            <span>Active reference</span>
            <strong>
              Version {baseline.version} · {baseline.sourceCaptures.length} source captures
            </strong>
            <small>Machine and operating state must match exactly.</small>
          </section>
          <SensorInstrument controller={controller} stopOnUnmount={false} />
          {message ? (
            <p className="baseline-error" role="alert">
              {message}
            </p>
          ) : null}
          <button
            type="button"
            className="baseline-primary"
            disabled={saving || (!collecting && !valid)}
            onClick={collecting ? () => void finish() : begin}
          >
            {saving
              ? "Saving local evidence"
              : collecting
                ? "Finish and compare"
                : "Begin current measurement"}
          </button>
        </div>
      )}
    </main>
  );
}
