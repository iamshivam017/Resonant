import type { CaptureCapability } from "./types";

export interface CapabilityEnvironment {
  isSecureContext: boolean;
  mediaDevices?: Pick<MediaDevices, "getSupportedConstraints" | "getUserMedia">;
  now: () => number;
}

export function getCaptureCapability(environment: CapabilityEnvironment): CaptureCapability {
  const mediaDevicesAvailable = environment.mediaDevices !== undefined;
  return {
    secureContext: environment.isSecureContext,
    mediaDevicesAvailable,
    audioInputSupported: environment.isSecureContext && mediaDevicesAvailable,
    supportedConstraints: environment.mediaDevices?.getSupportedConstraints() ?? {},
    checkedAt: environment.now(),
  };
}
