import { describe, expect, it } from "vitest";
import { analyzeSignalFrame } from "../../src/lib/dsp/dominant-bin";

describe("analyzeSignalFrame", () => {
  it("computes finite amplitude and frequency evidence", () => {
    const result = analyzeSignalFrame(
      new Float32Array([0, -0.5, 0.5, 1]),
      new Float32Array([-90, -40, -12, -30]),
      48_000,
      8,
      { firstEligibleBin: 1 },
    );
    expect(result.rms).toBeCloseTo(Math.sqrt(1.5 / 4));
    expect(result.peak).toBe(1);
    expect(result.binResolutionHz).toBe(6_000);
    expect(result.dominantBin).toBe(2);
    expect(result.dominantFrequencyHz).toBe(12_000);
  });

  it("suppresses frequency evidence for empty or non-finite spectra", () => {
    expect(
      analyzeSignalFrame(new Float32Array(), new Float32Array(), 48_000, 2, {
        firstEligibleBin: 1,
      }).dominantBin,
    ).toBeNull();
    expect(
      analyzeSignalFrame(
        new Float32Array([Number.NaN]),
        new Float32Array([Number.NaN, Number.NEGATIVE_INFINITY]),
        48_000,
        4,
        { firstEligibleBin: 1 },
      ).dominantFrequencyHz,
    ).toBeNull();
  });

  it("selects the strongest bin only inside the explicitly configured range", () => {
    const result = Reflect.apply(analyzeSignalFrame, undefined, [
      new Float32Array([0, 0.25]),
      new Float32Array([-5, -3, -20, -10]),
      48_000,
      8,
      { firstEligibleBin: 2, lastEligibleBinExclusive: 4 },
    ]);

    expect(result.dominantBin).toBe(3);
    expect(result.dominantFrequencyHz).toBe(18_000);
  });
});
