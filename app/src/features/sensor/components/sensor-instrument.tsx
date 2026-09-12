import { DotFilledIcon, PlayIcon, StopIcon } from "@radix-ui/react-icons";
import { useEffect, useSyncExternalStore } from "react";
import type { CaptureSessionController } from "../capture-session";
import type { CaptureSessionState } from "../types";
import { SpectrumCanvas } from "./spectrum-canvas";
import { WaveformCanvas } from "./waveform-canvas";

export interface SensorInstrumentProps {
  controller: CaptureSessionController;
}

function formatFrequency(value?: number) {
  return value === undefined ? "— Hz" : `${value.toLocaleString("en-US")} Hz`;
}

function formatQuality(value?: string) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : "Awaiting";
}

function formatDigitalAmplitude(value?: number) {
  return value === undefined ? "—" : `${value.toFixed(3)} digital`;
}

const sessionPresentation: Record<CaptureSessionState, { label: string; detail: string }> = {
  idle: { label: "Checking microphone capability", detail: "No capture in progress" },
  ready: { label: "Ready to sense", detail: "Microphone permission not requested" },
  "requesting-permission": {
    label: "Awaiting microphone permission",
    detail: "Respond to the browser prompt",
  },
  initializing: { label: "Preparing live analysis", detail: "No measurements yet" },
  active: { label: "Microphone active", detail: "Local processing" },
  stopping: { label: "Stopping microphone", detail: "Releasing capture resources" },
  stopped: { label: "Microphone stopped", detail: "No capture in progress" },
  denied: { label: "Permission denied", detail: "No measurement available" },
  unsupported: { label: "Microphone unavailable", detail: "No measurement available" },
  interrupted: { label: "Capture interrupted", detail: "Live evidence cleared" },
  failed: { label: "Capture failed", detail: "No measurement available" },
};

export function SensorInstrument({ controller }: SensorInstrumentProps) {
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const active = snapshot.state === "active";
  const hasValidFrame =
    active && snapshot.frame?.quality === "valid" && snapshot.observation?.freshness === "valid";
  const transitioning = ["requesting-permission", "initializing", "stopping"].includes(
    snapshot.state,
  );
  const status = sessionPresentation[snapshot.state];

  useEffect(() => {
    return () => {
      void controller.stop();
    };
  }, [controller]);

  const toggleCapture = () => {
    if (active) {
      void controller.stop();
      return;
    }
    void controller.start();
  };

  return (
    <main className="instrument" aria-labelledby="instrument-title">
      <header className="instrument-header">
        <div>
          <p className="wordmark">RESONANT</p>
          <h1 id="instrument-title">Live acoustic input</h1>
        </div>
        <div className={`capture-status ${active ? "is-active" : ""}`} aria-live="polite">
          <DotFilledIcon aria-hidden="true" />
          <div>
            <strong>{status.label}</strong>
            <span>{status.detail}</span>
          </div>
        </div>
      </header>

      <p className="privacy-note">
        {active ? "Privacy: on-device only" : "Microphone access starts only when you choose."}
      </p>

      {snapshot.error ? (
        <aside className="capture-error" role="alert">
          <strong>{snapshot.error.summary}</strong>
          <span>{snapshot.error.recovery}</span>
        </aside>
      ) : null}

      <section className="plot-section" aria-labelledby="waveform-title">
        <div className="section-heading">
          <h2 id="waveform-title">Waveform</h2>
          <span>Amplitude (uncalibrated)</span>
        </div>
        <div className="waveform-row">
          <aside
            className={`quality-rail is-${snapshot.frame?.quality ?? "awaiting"}`}
            aria-label={`Frame quality: ${snapshot.frame?.quality ?? "awaiting"}`}
          >
            <span aria-hidden="true" />
            <small>
              <span className="quality-caption">Signal quality</span>
              <strong className="quality-label">{formatQuality(snapshot.frame?.quality)}</strong>
            </small>
          </aside>
          {active ? (
            <WaveformCanvas samples={snapshot.frame?.timeDomain} />
          ) : (
            <div className="plot-empty" role="status">
              Live input appears after microphone permission is granted.
            </div>
          )}
        </div>
      </section>

      <section className="plot-section spectrum-preview" aria-labelledby="spectrum-title">
        <div className="section-heading">
          <h2 id="spectrum-title">Spectrum</h2>
          <span>Amplitude (uncalibrated)</span>
        </div>
        {hasValidFrame && snapshot.frame ? (
          <SpectrumCanvas samples={snapshot.frame.frequencyDomain} />
        ) : (
          <div className="plot-empty">Frequency evidence activates with a valid live frame.</div>
        )}
      </section>

      <section className="measurement-band" aria-label="Capture measurements">
        <div className="primary-measurement">
          <span>Strongest observed bin</span>
          <strong>{formatFrequency(snapshot.observation?.dominantFrequencyHz ?? undefined)}</strong>
        </div>
        <dl>
          <div>
            <dt>Sample rate</dt>
            <dd>{formatFrequency(snapshot.audioSampleRate)}</dd>
          </div>
          <div>
            <dt>Transform size</dt>
            <dd>{snapshot.analysisWindowSize?.toLocaleString("en-US") ?? "—"}</dd>
          </div>
          <div>
            <dt>Bin resolution</dt>
            <dd>
              {snapshot.observation
                ? `${snapshot.observation.binResolutionHz.toLocaleString("en-US")} Hz / bin`
                : "—"}
            </dd>
          </div>
          <div>
            <dt>RMS amplitude</dt>
            <dd>{formatDigitalAmplitude(hasValidFrame ? snapshot.observation?.rms : undefined)}</dd>
          </div>
          <div>
            <dt>Peak amplitude</dt>
            <dd>
              {formatDigitalAmplitude(hasValidFrame ? snapshot.observation?.peak : undefined)}
            </dd>
          </div>
        </dl>
      </section>

      <button
        className={`capture-control ${active ? "is-stop" : ""}`}
        type="button"
        onClick={toggleCapture}
        disabled={transitioning}
      >
        {active ? <StopIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
        {active
          ? "Stop sensing"
          : transitioning
            ? "Preparing microphone"
            : snapshot.error
              ? "Try again"
              : "Start sensing"}
      </button>
    </main>
  );
}
