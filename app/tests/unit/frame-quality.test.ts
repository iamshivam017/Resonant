import { describe, expect, it } from "vitest";
import { classifyFrameQuality } from "../../src/lib/dsp/frame-quality";

describe("classifyFrameQuality", () => {
  it("accepts a fresh frame with finite samples", () => {
    expect(
      classifyFrameQuality(new Float32Array([0, 0.1]), new Float32Array([-80, -20]), 100, 110),
    ).toBe("valid");
  });

  it("marks old frames stale and unusable frames insufficient", () => {
    expect(classifyFrameQuality(new Float32Array([0]), new Float32Array([-20]), 100, 2_101)).toBe(
      "stale",
    );
    expect(classifyFrameQuality(new Float32Array(), new Float32Array(), 100, 100)).toBe(
      "insufficient",
    );
    expect(
      classifyFrameQuality(new Float32Array([Number.NaN]), new Float32Array([-20]), 100, 100),
    ).toBe("insufficient");
  });

  it("marks a usable frame degraded when observed browser processing is active", () => {
    const quality = Reflect.apply(classifyFrameQuality, undefined, [
      new Float32Array([0, 0.1]),
      new Float32Array([-80, -20]),
      100,
      110,
      { signalProcessingActive: true },
    ]);

    expect(quality).toBe("degraded");
  });

  it("identifies an exact-zero finite frame as silent rather than usable", () => {
    expect(
      classifyFrameQuality(
        new Float32Array([0, -0, 0, 0]),
        new Float32Array([-100, -100]),
        100,
        110,
      ),
    ).toBe("silent");
  });

  it.each([
    new Float32Array([0, 1, 0]),
    new Float32Array([0, -1, 0]),
    new Float32Array([0, 1.1, 0]),
  ])("identifies digital full-scale samples as clipping evidence", (samples) => {
    expect(classifyFrameQuality(samples, new Float32Array([-80, -20]), 100, 110)).toBe("clipping");
  });
});
