import { describe, expect, it } from "vitest";
import { getCaptureCapability } from "../../src/features/sensor/capability";

describe("getCaptureCapability", () => {
  it("observes capability without requesting microphone permission", () => {
    let permissionRequests = 0;
    const mediaDevices = {
      getSupportedConstraints: () => ({ echoCancellation: true, noiseSuppression: true }),
      getUserMedia: async () => {
        permissionRequests += 1;
        throw new Error("permission should not be requested by a capability check");
      },
    };

    const result = getCaptureCapability({
      isSecureContext: true,
      mediaDevices,
      now: () => 1_234,
    });

    expect(result).toEqual({
      secureContext: true,
      mediaDevicesAvailable: true,
      audioInputSupported: true,
      supportedConstraints: { echoCancellation: true, noiseSuppression: true },
      checkedAt: 1_234,
    });
    expect(permissionRequests).toBe(0);
  });

  it("reports an insecure context as unsupported", () => {
    const result = getCaptureCapability({
      isSecureContext: false,
      mediaDevices: undefined,
      now: () => 9,
    });

    expect(result.audioInputSupported).toBe(false);
    expect(result.mediaDevicesAvailable).toBe(false);
    expect(result.supportedConstraints).toEqual({});
  });
});
