import { describe, expect, it } from "vitest";
import { createCaptureSession } from "../../src/features/sensor/capture-session";
import {
  createFakeAudioGraph,
  createFakeMediaDevices,
  createFakeStream,
  createFakeTrack,
} from "../fixtures/media";

describe("createCaptureSession", () => {
  it("moves through a single real-capture lifecycle and records observed settings", async () => {
    const track = createFakeTrack({ settings: { sampleRate: 44_100, channelCount: 1 } });
    const stream = createFakeStream(track);
    const media = createFakeMediaDevices(stream);
    const graph = createFakeAudioGraph();
    const frames = new Map<number, FrameRequestCallback>();
    const states: string[] = [];

    const session = createCaptureSession({
      mediaDevices: media.value,
      createAudioContext: () => graph.context,
      now: () => 2_000,
      makeId: () => "session-1",
      requestFrame: (callback) => {
        frames.set(17, callback);
        return 17;
      },
      cancelFrame: (id) => frames.delete(id),
    });
    session.subscribe((snapshot) => states.push(snapshot.state));

    await Promise.all([session.start(), session.start()]);

    expect(media.calls).toHaveLength(1);
    expect(states).toEqual(["ready", "requesting-permission", "initializing", "active"]);
    expect(session.getSnapshot()).toMatchObject({
      id: "session-1",
      state: "active",
      trackSettings: { sampleRate: 44_100, channelCount: 1 },
      audioSampleRate: 48_000,
      analysisWindowSize: 4,
    });

    await session.stop();

    expect(track.readyState).toBe("ended");
    expect(graph.closed).toBe(true);
    expect(graph.disconnected).toBe(true);
    expect(frames.size).toBe(0);
    expect(session.getSnapshot().state).toBe("stopped");
    expect(session.getSnapshot().frame).toBeUndefined();
  });

  it("makes repeated stop calls idempotent", async () => {
    const track = createFakeTrack();
    const stream = createFakeStream(track);
    const media = createFakeMediaDevices(stream);
    const graph = createFakeAudioGraph();
    let closeCalls = 0;
    const context = {
      ...graph.context,
      close: async () => {
        closeCalls += 1;
      },
    };
    const session = createCaptureSession({
      mediaDevices: media.value,
      createAudioContext: () => context,
      now: () => 10,
      makeId: () => "session-2",
      requestFrame: () => 3,
      cancelFrame: () => undefined,
    });

    await session.start();
    await Promise.all([session.stop(), session.stop()]);

    expect(closeCalls).toBe(1);
    expect(session.getSnapshot().state).toBe("stopped");
  });

  it("fails closed on permission denial and permits retry", async () => {
    let attempts = 0;
    const graph = createFakeAudioGraph();
    const session = createCaptureSession({
      mediaDevices: {
        getSupportedConstraints: () => ({}),
        getUserMedia: async () => {
          attempts += 1;
          if (attempts === 1) throw new DOMException("denied", "NotAllowedError");
          return createFakeStream();
        },
      },
      createAudioContext: () => graph.context,
      now: () => 10,
      makeId: () => `session-${attempts}`,
      requestFrame: () => 3,
      cancelFrame: () => undefined,
    });

    await session.start();
    expect(session.getSnapshot()).toMatchObject({
      state: "denied",
      error: { code: "permission-denied" },
    });
    expect(session.getSnapshot().frame).toBeUndefined();
    await session.start();
    expect(session.getSnapshot().state).toBe("active");
  });

  it("fails closed when audio processing initialization fails", async () => {
    const track = createFakeTrack();
    const session = createCaptureSession({
      mediaDevices: createFakeMediaDevices(createFakeStream(track)).value,
      createAudioContext: () => {
        throw new Error("initialization failed");
      },
      now: () => 10,
      makeId: () => "processing-failure",
      requestFrame: () => 3,
      cancelFrame: () => undefined,
    });

    await session.start();

    expect(session.getSnapshot()).toMatchObject({
      state: "failed",
      error: { code: "processing-failed" },
    });
    expect(session.getSnapshot().frame).toBeUndefined();
    expect(track.readyState).toBe("ended");
  });

  it("invalidates evidence when the live track ends", async () => {
    const track = createFakeTrack();
    const graph = createFakeAudioGraph();
    const session = createCaptureSession({
      mediaDevices: createFakeMediaDevices(createFakeStream(track)).value,
      createAudioContext: () => graph.context,
      now: () => 10,
      makeId: () => "interrupted",
      requestFrame: () => 3,
      cancelFrame: () => undefined,
    });

    await session.start();
    track.dispatchEvent(new Event("ended"));
    await Promise.resolve();
    await Promise.resolve();

    expect(session.getSnapshot()).toMatchObject({
      state: "interrupted",
      error: { code: "interrupted" },
    });
    expect(session.getSnapshot().observation).toBeUndefined();
  });

  it("releases a late permission result after the session was stopped", async () => {
    const track = createFakeTrack();
    let resolvePermission: ((stream: MediaStream) => void) | undefined;
    const permission = new Promise<MediaStream>((resolve) => {
      resolvePermission = resolve;
    });
    const session = createCaptureSession({
      mediaDevices: {
        getSupportedConstraints: () => ({}),
        getUserMedia: () => permission,
      },
      createAudioContext: () => createFakeAudioGraph().context,
      now: () => 20,
      makeId: () => "late-permission",
      requestFrame: () => 4,
      cancelFrame: () => undefined,
    });

    const start = session.start();
    await session.stop();
    resolvePermission?.(createFakeStream(track));
    await start;

    expect(track.readyState).toBe("ended");
    expect(session.getSnapshot().state).toBe("stopped");
  });

  it("rejects a frame callback retained from an older session", async () => {
    const callbacks: FrameRequestCallback[] = [];
    let id = 0;
    const session = createCaptureSession({
      mediaDevices: createFakeMediaDevices(createFakeStream()).value,
      createAudioContext: () => createFakeAudioGraph().context,
      now: () => 30,
      makeId: () => `session-${++id}`,
      requestFrame: (callback) => {
        callbacks.push(callback);
        return callbacks.length;
      },
      cancelFrame: () => undefined,
    });

    await session.start();
    const oldFrame = callbacks[0];
    await session.stop();
    await session.start();
    oldFrame(30);

    expect(session.getSnapshot().id).toBe("session-2");
    expect(session.getSnapshot().frame).toBeUndefined();
  });
});
