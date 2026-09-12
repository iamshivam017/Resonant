// TEST-ONLY sensor adapters. Never import this module from app/src production code.

export interface FakeTrackOptions {
  settings?: MediaTrackSettings;
  readyState?: MediaStreamTrackState;
}

export function createFakeTrack(options: FakeTrackOptions = {}) {
  const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
  let state: MediaStreamTrackState = options.readyState ?? "live";

  const track = {
    kind: "audio",
    enabled: true,
    muted: false,
    id: "test-audio-track",
    label: "TEST FIXTURE microphone",
    get readyState() {
      return state;
    },
    getSettings: () => ({
      sampleRate: 48_000,
      channelCount: 1,
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false,
      ...options.settings,
    }),
    stop: () => {
      state = "ended";
    },
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
      const entries = listeners.get(type) ?? new Set();
      entries.add(listener);
      listeners.set(type, entries);
    },
    removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent: (event: Event) => {
      for (const listener of listeners.get(event.type) ?? []) {
        if (typeof listener === "function") {
          listener(event);
        } else {
          listener.handleEvent(event);
        }
      }
      return true;
    },
  };

  return track as unknown as MediaStreamTrack;
}

export function createFakeStream(track = createFakeTrack()) {
  return {
    active: true,
    id: "test-media-stream",
    getTracks: () => [track],
    getAudioTracks: () => [track],
  } as unknown as MediaStream;
}

export function createFakeMediaDevices(stream: MediaStream) {
  const calls: MediaStreamConstraints[] = [];
  return {
    calls,
    value: {
      getSupportedConstraints: () => ({
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      }),
      getUserMedia: async (constraints: MediaStreamConstraints) => {
        calls.push(constraints);
        return stream;
      },
    },
  };
}

export function createFakeAudioGraph() {
  const timeDomain = new Float32Array([0, 0.25, -0.5, 0.75]);
  const frequencyDomain = new Float32Array([-80, -30]);
  let closed = false;
  let disconnected = false;

  const analyser = {
    fftSize: 4,
    get frequencyBinCount() {
      return this.fftSize / 2;
    },
    getFloatTimeDomainData: (target: Float32Array<ArrayBuffer>) => target.set(timeDomain),
    getFloatFrequencyData: (target: Float32Array<ArrayBuffer>) => target.set(frequencyDomain),
    disconnect: () => {
      disconnected = true;
    },
  };

  const source = {
    connect: () => analyser,
    disconnect: () => {
      disconnected = true;
    },
  };

  const context = {
    sampleRate: 48_000,
    state: "running" as AudioContextState,
    createMediaStreamSource: () => source,
    createAnalyser: () => analyser,
    resume: async () => undefined,
    close: async () => {
      closed = true;
    },
  };

  return {
    context,
    analyser,
    get closed() {
      return closed;
    },
    get disconnected() {
      return disconnected;
    },
  };
}
