import { analyzeSignalFrame } from "../../lib/dsp/dominant-bin";
import { classifyFrameQuality } from "../../lib/dsp/frame-quality";
import { interruptedCaptureError, mapCaptureError } from "./errors";
import type { CaptureSessionSnapshot, ObservedTrackSettings } from "./types";

export interface AnalyserLike {
  fftSize: number;
  readonly frequencyBinCount: number;
  getFloatTimeDomainData(target: Float32Array<ArrayBuffer>): void;
  getFloatFrequencyData(target: Float32Array<ArrayBuffer>): void;
  disconnect(): void;
}

export interface SourceNodeLike {
  connect(destination: AnalyserLike): unknown;
  disconnect(): void;
}

export interface AudioContextLike {
  readonly sampleRate: number;
  readonly state: AudioContextState;
  createMediaStreamSource(stream: MediaStream): SourceNodeLike;
  createAnalyser(): AnalyserLike;
  resume(): Promise<void>;
  close(): Promise<void>;
}

export interface CaptureSessionDependencies {
  mediaDevices: Pick<MediaDevices, "getSupportedConstraints" | "getUserMedia">;
  createAudioContext: () => AudioContextLike;
  now: () => number;
  makeId: () => string;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (id: number) => void;
}

export interface CaptureSessionController {
  getSnapshot(): CaptureSessionSnapshot;
  subscribe(listener: (snapshot: CaptureSessionSnapshot) => void): () => void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

function observeTrackSettings(settings: MediaTrackSettings): ObservedTrackSettings {
  const booleanSetting = (value: string | boolean | undefined) =>
    typeof value === "boolean" ? value : undefined;
  return {
    sampleRate: settings.sampleRate,
    sampleSize: settings.sampleSize,
    channelCount: settings.channelCount,
    autoGainControl: booleanSetting(settings.autoGainControl),
    echoCancellation: booleanSetting(settings.echoCancellation),
    noiseSuppression: booleanSetting(settings.noiseSuppression),
    deviceId: settings.deviceId,
  };
}

export function createCaptureSession(
  dependencies: CaptureSessionDependencies,
): CaptureSessionController {
  let snapshot: CaptureSessionSnapshot = { id: null, state: "ready" };
  const listeners = new Set<(value: CaptureSessionSnapshot) => void>();
  let stream: MediaStream | undefined;
  let track: MediaStreamTrack | undefined;
  let context: AudioContextLike | undefined;
  let source: SourceNodeLike | undefined;
  let analyser: AnalyserLike | undefined;
  let animationFrame: number | undefined;
  let startPromise: Promise<void> | undefined;
  let stopPromise: Promise<void> | undefined;
  let endedListener: (() => void) | undefined;

  const emit = (next: CaptureSessionSnapshot) => {
    snapshot = next;
    for (const listener of listeners) {
      listener(snapshot);
    }
  };

  const update = (changes: Partial<CaptureSessionSnapshot>) => {
    emit({ ...snapshot, ...changes });
  };

  const sample = (sessionId: string) => {
    if (!analyser || snapshot.state !== "active" || snapshot.id !== sessionId) {
      return;
    }

    const timeDomain = new Float32Array(analyser.fftSize);
    const frequencyDomain = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatTimeDomainData(timeDomain);
    analyser.getFloatFrequencyData(frequencyDomain);
    const capturedAt = dependencies.now();
    const quality = classifyFrameQuality(
      timeDomain,
      frequencyDomain,
      capturedAt,
      dependencies.now(),
      {
        signalProcessingActive: Boolean(
          snapshot.trackSettings?.autoGainControl ||
            snapshot.trackSettings?.echoCancellation ||
            snapshot.trackSettings?.noiseSuppression,
        ),
      },
    );
    const observation = analyzeSignalFrame(
      timeDomain,
      frequencyDomain,
      context?.sampleRate ?? 0,
      analyser.fftSize,
      { firstEligibleBin: 1 },
    );
    observation.freshness = quality;
    if (quality !== "valid") {
      observation.dominantBin = null;
      observation.dominantFrequencyHz = null;
    }
    update({
      frame: {
        sessionId,
        capturedAt,
        timeDomain,
        frequencyDomain,
        quality,
      },
      observation,
    });
    animationFrame = dependencies.requestFrame(() => sample(sessionId));
  };

  const stopResources = async () => {
    if (animationFrame !== undefined) {
      dependencies.cancelFrame(animationFrame);
      animationFrame = undefined;
    }
    analyser?.disconnect();
    source?.disconnect();
    if (track && endedListener) track.removeEventListener("ended", endedListener);
    endedListener = undefined;
    for (const ownedTrack of stream?.getTracks() ?? []) {
      ownedTrack.stop();
    }
    if (context) {
      await context.close();
    }
    analyser = undefined;
    source = undefined;
    context = undefined;
    stream = undefined;
    track = undefined;
  };

  const start = () => {
    if (startPromise) {
      return startPromise;
    }
    if (snapshot.state === "active") {
      return Promise.resolve();
    }

    startPromise = (async () => {
      const id = dependencies.makeId();
      update({ id, state: "requesting-permission", error: undefined, frame: undefined });
      const supported = dependencies.mediaDevices.getSupportedConstraints();
      const audio: MediaTrackConstraints = { channelCount: 1 };
      if (supported.echoCancellation) audio.echoCancellation = false;
      if (supported.noiseSuppression) audio.noiseSuppression = false;
      if (supported.autoGainControl) audio.autoGainControl = false;

      try {
        stream = await dependencies.mediaDevices.getUserMedia({ audio, video: false });
        if (snapshot.id !== id || snapshot.state !== "requesting-permission") {
          for (const lateTrack of stream.getTracks()) lateTrack.stop();
          stream = undefined;
          return;
        }
        update({ state: "initializing" });
        track = stream.getAudioTracks()[0];
        if (!track) throw new DOMException("No audio track.", "NotFoundError");

        context = dependencies.createAudioContext();
        if (context.state === "suspended") await context.resume();
        analyser = context.createAnalyser();
        source = context.createMediaStreamSource(stream);
        source.connect(analyser);
        endedListener = () => {
          if (snapshot.id !== id || snapshot.state !== "active") return;
          void stopResources().then(() => {
            update({
              state: "interrupted",
              stoppedAt: dependencies.now(),
              frame: undefined,
              observation: undefined,
              error: interruptedCaptureError(),
            });
          });
        };
        track.addEventListener("ended", endedListener, { once: true });

        update({
          state: "active",
          startedAt: dependencies.now(),
          stoppedAt: undefined,
          trackSettings: observeTrackSettings(track.getSettings()),
          audioSampleRate: context.sampleRate,
          analysisWindowSize: analyser.fftSize,
        });
        animationFrame = dependencies.requestFrame(() => sample(id));
      } catch (cause) {
        await stopResources();
        const error = mapCaptureError(cause);
        update({
          state:
            error.code === "permission-denied"
              ? "denied"
              : error.code === "unsupported"
                ? "unsupported"
                : "failed",
          stoppedAt: dependencies.now(),
          frame: undefined,
          observation: undefined,
          error,
        });
      }
    })().finally(() => {
      startPromise = undefined;
    });

    return startPromise;
  };

  const stop = () => {
    if (stopPromise) {
      return stopPromise;
    }
    if (snapshot.state === "stopped" || snapshot.state === "ready") {
      if (snapshot.state === "ready") update({ state: "stopped", stoppedAt: dependencies.now() });
      return Promise.resolve();
    }

    stopPromise = (async () => {
      update({ state: "stopping", frame: undefined, observation: undefined });
      await stopResources();
      update({
        state: "stopped",
        stoppedAt: dependencies.now(),
        frame: undefined,
        observation: undefined,
      });
    })().finally(() => {
      stopPromise = undefined;
    });
    return stopPromise;
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      listener(snapshot);
      return () => listeners.delete(listener);
    },
    start,
    stop,
  };
}
