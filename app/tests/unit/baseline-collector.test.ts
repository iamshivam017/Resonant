import { describe, expect, it } from "vitest";
import {
  captureRejectionMessage,
  createBaselineCaptureCollector,
} from "../../src/features/baseline/capture-collector";
import type { CaptureSessionSnapshot, FrameQuality } from "../../src/features/sensor/types";

const snapshot = (capturedAt: number, quality: FrameQuality = "valid"): CaptureSessionSnapshot => ({
  id: "session-1",
  state: "active",
  startedAt: 10,
  audioSampleRate: 48_000,
  analysisWindowSize: 2_048,
  trackSettings: { sampleRate: 48_000, channelCount: 1 },
  frame: {
    sessionId: "session-1",
    capturedAt,
    quality,
    timeDomain: new Float32Array([0.1]),
    frequencyDomain: new Float32Array([1]),
  },
  observation: {
    rms: capturedAt / 1_000,
    peak: capturedAt / 500,
    dominantFrequencyHz: capturedAt,
    dominantBin: capturedAt / 10,
    binResolutionHz: 23.4375,
    freshness: quality,
  },
});

describe("baseline capture collector", () => {
  it("provides explicit rejection and unknown-calibration guidance", () => {
    expect(captureRejectionMessage("silent")).toContain("Exact silence");
    expect(captureRejectionMessage("clipping")).toContain("Move the phone");
    expect(captureRejectionMessage("insufficient-duration")).toContain(
      "UNKNOWN / NEEDS CALIBRATION",
    );
  });
  it("summarizes two advancing valid observations without retaining frames", () => {
    const collector = createBaselineCaptureCollector({ makeId: () => "capture-1", now: () => 500 });
    collector.start("machine-1", "state-1");
    collector.observe(snapshot(100));
    collector.observe(snapshot(200));
    const result = collector.finish();
    expect(result.status).toBe("accepted");
    if (result.status !== "accepted") throw new Error("expected accepted capture");
    expect(result.capture.durationMs).toBe(100);
    expect(result.capture.observationCount).toBe(2);
    expect(result.capture.features.dominantFrequencyHz).toBe(150);
    expect(result.capture).not.toHaveProperty("frame");
    expect(result.capture).not.toHaveProperty("timeDomain");
  });

  it.each(["silent", "clipping", "degraded", "insufficient", "stale"] as FrameQuality[])(
    "rejects %s evidence",
    (quality) => {
      const collector = createBaselineCaptureCollector({
        makeId: () => "capture-1",
        now: () => 500,
      });
      collector.start("machine-1", "state-1");
      collector.observe(snapshot(100, quality));
      expect(collector.finish()).toMatchObject({ status: "rejected", reason: quality });
    },
  );

  it("rejects non-advancing and structurally too-short captures", () => {
    const collector = createBaselineCaptureCollector({ makeId: () => "capture-1", now: () => 500 });
    collector.start("machine-1", "state-1");
    collector.observe(snapshot(100));
    collector.observe(snapshot(100));
    expect(collector.finish()).toMatchObject({ status: "rejected", reason: "non-advancing" });

    const short = createBaselineCaptureCollector({ makeId: () => "capture-2", now: () => 500 });
    short.start("machine-1", "state-1");
    short.observe(snapshot(100));
    expect(short.finish()).toMatchObject({ status: "rejected", reason: "insufficient-duration" });
  });
});
