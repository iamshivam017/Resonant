import { describe, expect, it } from "vitest";
import { mapCaptureError } from "../../src/features/sensor/errors";

describe("mapCaptureError", () => {
  const cases = [
    ["NotAllowedError", "permission-denied"],
    ["NotFoundError", "device-unavailable"],
    ["OverconstrainedError", "constraint-failed"],
    ["NotSupportedError", "unsupported"],
    ["AbortError", "interrupted"],
    ["UnknownError", "processing-failed"],
  ] as const;

  it.each(cases)("maps %s to %s without exposing browser text", (name, code) => {
    const error = mapCaptureError({ name, message: "sensitive internal detail" });
    expect(error.code).toBe(code);
    expect(error.summary).not.toContain("sensitive");
    expect(error.recovery.length).toBeGreaterThan(10);
  });
});
