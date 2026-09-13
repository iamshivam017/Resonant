import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  type CaptureSessionController,
  createCaptureSession,
} from "../../src/features/sensor/capture-session";
import { SensorInstrument } from "../../src/features/sensor/components/sensor-instrument";
import type { CaptureSessionState } from "../../src/features/sensor/types";
import {
  createFakeAudioGraph,
  createFakeMediaDevices,
  createFakeStream,
  createFakeTrack,
} from "../fixtures/media";

function createController() {
  const track = createFakeTrack({ settings: { sampleRate: 48_000, channelCount: 1 } });
  const graph = createFakeAudioGraph();
  const media = createFakeMediaDevices(createFakeStream(track));
  let frame: FrameRequestCallback | undefined;
  return {
    controller: createCaptureSession({
      mediaDevices: media.value,
      createAudioContext: () => graph.context,
      now: () => 100,
      makeId: () => "component-session",
      requestFrame: (callback) => {
        frame = callback;
        return 5;
      },
      cancelFrame: () => undefined,
    }),
    track,
    runFrame: () => frame?.(100),
  };
}

describe("SensorInstrument", () => {
  it.each([
    ["idle", "Checking microphone capability"],
    ["ready", "Ready to sense"],
    ["requesting-permission", "Awaiting microphone permission"],
    ["initializing", "Preparing live analysis"],
    ["active", "Microphone active"],
    ["stopping", "Stopping microphone"],
    ["stopped", "Microphone stopped"],
    ["denied", "Permission denied"],
    ["unsupported", "Microphone unavailable"],
    ["interrupted", "Capture interrupted"],
    ["failed", "Capture failed"],
  ] satisfies [CaptureSessionState, string][])("labels the %s lifecycle state", (state, label) => {
    const snapshot = { id: null, state };
    const controller: CaptureSessionController = {
      getSnapshot: () => snapshot,
      subscribe: (listener) => {
        listener(snapshot);
        return () => undefined;
      },
      start: async () => undefined,
      stop: async () => undefined,
    };

    const view = render(<SensorInstrument controller={controller} />);
    expect(screen.getByText(label)).toBeVisible();
    view.unmount();
  });

  it("requests capture only after the user starts sensing and exposes an active stop control", async () => {
    const { controller } = createController();
    const user = userEvent.setup();
    render(<SensorInstrument controller={controller} />);

    expect(screen.getByText("Ready to sense")).toBeInTheDocument();
    expect(screen.queryByText("Microphone active")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Start sensing" }));

    expect(await screen.findByText("Microphone active")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop sensing" })).toBeInTheDocument();
    expect(screen.getAllByText("48,000 Hz")).toHaveLength(2);
    expect(screen.getByTestId("waveform-canvas")).toBeInTheDocument();
  });

  it("announces permission progress while the browser request is pending", async () => {
    let resolvePermission: ((stream: MediaStream) => void) | undefined;
    const permission = new Promise<MediaStream>((resolve) => {
      resolvePermission = resolve;
    });
    const controller = createCaptureSession({
      mediaDevices: {
        getSupportedConstraints: () => ({}),
        getUserMedia: () => permission,
      },
      createAudioContext: () => createFakeAudioGraph().context,
      now: () => 1,
      makeId: () => "pending",
      requestFrame: () => 1,
      cancelFrame: () => undefined,
    });
    render(<SensorInstrument controller={controller} />);

    fireEvent.click(screen.getByRole("button", { name: "Start sensing" }));
    expect(screen.getByRole("button", { name: "Preparing microphone" })).toBeDisabled();

    resolvePermission?.(createFakeStream());
    expect(await screen.findByText("Microphone active")).toBeInTheDocument();
  });

  it("stops capture and removes live evidence", async () => {
    const { controller, track } = createController();
    const user = userEvent.setup();
    render(<SensorInstrument controller={controller} />);

    await user.click(screen.getByRole("button", { name: "Start sensing" }));
    await user.click(await screen.findByRole("button", { name: "Stop sensing" }));

    await waitFor(() => expect(screen.getByText("Microphone stopped")).toBeInTheDocument());
    expect(track.readyState).toBe("ended");
    expect(screen.queryByTestId("waveform-canvas")).not.toBeInTheDocument();
  });

  it("shows measured frequency context only after a valid live frame", async () => {
    const { controller, runFrame } = createController();
    const user = userEvent.setup();
    render(<SensorInstrument controller={controller} />);

    expect(screen.queryByTestId("spectrum-canvas")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Start sensing" }));
    act(() => runFrame());

    expect(await screen.findByTestId("spectrum-canvas")).toBeInTheDocument();
    expect(screen.getByText("12,000 Hz")).toBeInTheDocument();
    expect(screen.getByText("12,000 Hz / bin")).toBeInTheDocument();
    expect(screen.getByText("0.468 digital")).toBeInTheDocument();
    expect(screen.getByText("0.750 digital")).toBeInTheDocument();
    expect(screen.getByLabelText("Frame quality: valid")).toBeInTheDocument();
    expect(screen.getAllByText("Amplitude (uncalibrated)")).toHaveLength(2);
  });

  it("suppresses interpreted frequency evidence for an insufficient frame", async () => {
    const graph = createFakeAudioGraph();
    const analyser = {
      ...graph.analyser,
      getFloatFrequencyData: (target: Float32Array<ArrayBuffer>) =>
        target.fill(Number.NEGATIVE_INFINITY),
    };
    let frame: FrameRequestCallback | undefined;
    const controller = createCaptureSession({
      mediaDevices: createFakeMediaDevices(createFakeStream()).value,
      createAudioContext: () => ({ ...graph.context, createAnalyser: () => analyser }),
      now: () => 100,
      makeId: () => "insufficient",
      requestFrame: (callback) => {
        frame = callback;
        return 1;
      },
      cancelFrame: () => undefined,
    });
    const user = userEvent.setup();
    render(<SensorInstrument controller={controller} />);

    await user.click(screen.getByRole("button", { name: "Start sensing" }));
    act(() => frame?.(100));

    expect(screen.queryByTestId("spectrum-canvas")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Frame quality: insufficient")).toBeInTheDocument();
    expect(screen.getByText("Frequency evidence activates with a valid live frame.")).toBeVisible();
    expect(screen.queryByText(/digital$/)).not.toBeInTheDocument();
  });

  it("labels a usable frame degraded when browser processing remains active", async () => {
    const graph = createFakeAudioGraph();
    let frame: FrameRequestCallback | undefined;
    const controller = createCaptureSession({
      mediaDevices: createFakeMediaDevices(
        createFakeStream(createFakeTrack({ settings: { echoCancellation: true } })),
      ).value,
      createAudioContext: () => graph.context,
      now: () => 100,
      makeId: () => "degraded",
      requestFrame: (callback) => {
        frame = callback;
        return 1;
      },
      cancelFrame: () => undefined,
    });
    const user = userEvent.setup();
    render(<SensorInstrument controller={controller} />);

    await user.click(screen.getByRole("button", { name: "Start sensing" }));
    act(() => frame?.(100));

    expect(screen.getByText("Degraded")).toBeVisible();
    expect(screen.getByLabelText("Frame quality: degraded")).toBeInTheDocument();
    expect(screen.queryByTestId("spectrum-canvas")).not.toBeInTheDocument();
  });

  it("announces a safe recovery action after permission denial", async () => {
    let attempts = 0;
    const controller = createCaptureSession({
      mediaDevices: {
        getSupportedConstraints: () => ({}),
        getUserMedia: async () => {
          attempts += 1;
          if (attempts === 1) {
            throw new DOMException("private browser detail", "NotAllowedError");
          }
          return createFakeStream();
        },
      },
      createAudioContext: () => createFakeAudioGraph().context,
      now: () => 1,
      makeId: () => "denied",
      requestFrame: () => 1,
      cancelFrame: () => undefined,
    });
    const user = userEvent.setup();
    render(<SensorInstrument controller={controller} />);

    await user.click(screen.getByRole("button", { name: "Start sensing" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Microphone access was not granted.",
    );
    expect(screen.getByText(/Allow microphone access in browser settings/)).toBeInTheDocument();
    expect(screen.queryByText(/private browser detail/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("spectrum-canvas")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Microphone active")).toBeInTheDocument();
    expect(attempts).toBe(2);
  });

  it("releases capture when the instrument unmounts", async () => {
    const { controller, track } = createController();
    const user = userEvent.setup();
    const view = render(<SensorInstrument controller={controller} />);
    await user.click(screen.getByRole("button", { name: "Start sensing" }));

    view.unmount();

    await waitFor(() => expect(track.readyState).toBe("ended"));
  });

  it("labels the primary frequency value as the dominant spectral peak and shows observed timing", () => {
    const snapshot = {
      id: "observed-readout",
      state: "active" as const,
      startedAt: 1_000,
      trackSettings: { sampleRate: 44_100, channelCount: 2, latency: 0.012 },
      audioSampleRate: 48_000,
      analysisWindowSize: 2_048,
      captureDurationMs: 2_500,
      observedUpdateCadenceHz: 25,
      frame: {
        sessionId: "observed-readout",
        capturedAt: 3_500,
        timeDomain: new Float32Array([0.1, -0.1]),
        frequencyDomain: new Float32Array([-80, -20]),
        quality: "valid" as const,
      },
      observation: {
        rms: 0.1,
        peak: 0.1,
        dominantBin: 1,
        dominantFrequencyHz: 1_000,
        binResolutionHz: 23.4375,
        freshness: "valid" as const,
      },
    };
    const controller: CaptureSessionController = {
      getSnapshot: () => snapshot,
      subscribe: (listener) => {
        listener(snapshot);
        return () => undefined;
      },
      start: async () => undefined,
      stop: async () => undefined,
    };

    render(<SensorInstrument controller={controller} />);

    expect(screen.getByText("Dominant spectral peak")).toBeVisible();
    expect(screen.getByText("2.50 s")).toBeVisible();
    expect(screen.getByText("25.0 Hz observed")).toBeVisible();
    expect(screen.getByText("44,100 Hz")).toBeVisible();
    expect(screen.getByText("2 channels")).toBeVisible();
  });

  it.each([
    ["silent", "No usable audio signal detected."],
    ["clipping", "Signal is clipping. Move the phone farther from the machine."],
  ])("shows explicit %s quality guidance and suppresses the peak", (quality, message) => {
    const snapshot = {
      id: `quality-${quality}`,
      state: "active" as const,
      frame: {
        sessionId: `quality-${quality}`,
        capturedAt: 100,
        timeDomain: new Float32Array([0, 0]),
        frequencyDomain: new Float32Array([-80, -20]),
        quality,
      },
      observation: {
        rms: 0,
        peak: quality === "clipping" ? 1 : 0,
        dominantBin: null,
        dominantFrequencyHz: null,
        binResolutionHz: 10,
        freshness: quality,
      },
    };
    const controller = {
      getSnapshot: () => snapshot,
      subscribe: (listener: (value: typeof snapshot) => void) => {
        listener(snapshot);
        return () => undefined;
      },
      start: async () => undefined,
      stop: async () => undefined,
    } as unknown as CaptureSessionController;

    render(<SensorInstrument controller={controller} />);

    expect(screen.getByText(message)).toBeVisible();
    expect(screen.getByLabelText("Dominant spectral peak value: unavailable")).toHaveTextContent(
      "— Hz",
    );
    expect(screen.queryByTestId("spectrum-canvas")).not.toBeInTheDocument();
  });
});
