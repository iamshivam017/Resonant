import { type AudioContextLike, createCaptureSession } from "./capture-session";

export function createBrowserCaptureSession() {
  const unsupportedMedia: Pick<MediaDevices, "getSupportedConstraints" | "getUserMedia"> = {
    getSupportedConstraints: () => ({}),
    getUserMedia: async () => {
      throw new DOMException("Microphone capture is unsupported.", "NotSupportedError");
    },
  };
  const AudioContextConstructor = window.AudioContext;
  const availableMedia = navigator.mediaDevices;
  const guardedMedia: Pick<MediaDevices, "getSupportedConstraints" | "getUserMedia"> =
    window.isSecureContext && availableMedia
      ? {
          getSupportedConstraints: () => availableMedia.getSupportedConstraints(),
          getUserMedia: (constraints) => availableMedia.getUserMedia(constraints),
        }
      : unsupportedMedia;

  return createCaptureSession({
    mediaDevices: guardedMedia,
    createAudioContext: () => {
      if (!window.isSecureContext || !AudioContextConstructor) {
        throw new DOMException("Audio capture requires a secure context.", "NotSupportedError");
      }
      return new AudioContextConstructor() as unknown as AudioContextLike;
    },
    now: () => performance.now(),
    makeId: () => crypto.randomUUID(),
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (id) => cancelAnimationFrame(id),
  });
}
