import { describe, expect, it } from "vitest";
import { aggregateBaseline } from "../../src/features/baseline/aggregation";
import {
  BaselineRepository,
  InMemoryBaselineStorage,
} from "../../src/features/baseline/repository";
import type { BaselineCapture } from "../../src/features/baseline/types";
import { compareWithBaseline } from "../../src/features/scan/comparison";
import { InMemoryScanStorage, ScanRepository } from "../../src/features/scan/repository";
import type { ScanMeasurement } from "../../src/features/scan/types";

const capture = (id: string, rms: number): BaselineCapture => ({
  id,
  machineId: "machine-1",
  operatingStateId: "state-1",
  capturedAt: 100,
  durationMs: 50,
  observationCount: 2,
  features: { rms, peak: 0.4, dominantFrequencyHz: 240, dominantBin: 10 },
  context: { audioSampleRate: 48_000, analysisWindowSize: 2_048 },
});

const current = (): ScanMeasurement => ({
  machineId: "machine-1",
  operatingStateId: "state-1",
  capturedAt: 300,
  durationMs: 50,
  observationCount: 2,
  quality: "valid",
  features: { rms: 0.25, peak: 0.4, dominantFrequencyHz: 240, dominantBin: 10 },
  context: { audioSampleRate: 48_000, analysisWindowSize: 2_048 },
});

async function referenceFixture() {
  let id = 0;
  const baselineRepository = new BaselineRepository(
    new InMemoryBaselineStorage(),
    () => 200,
    () => `baseline-${++id}`,
  );
  await baselineRepository.saveMachine({
    id: "machine-1",
    name: "Fan",
    category: "Fan",
    createdAt: 1,
  });
  await baselineRepository.saveOperatingState({
    id: "state-1",
    machineId: "machine-1",
    name: "Speed 1",
    createdAt: 2,
  });
  const captures = [capture("capture-1", 0.2), capture("capture-2", 0.3)];
  for (const value of captures) await baselineRepository.saveCapture(value);
  const baseline = await baselineRepository.activateBaseline(aggregateBaseline(captures), 10, 11);
  return { baselineRepository, baseline };
}

describe("scan repository", () => {
  it("persists an allowlisted result with exact active-baseline attribution", async () => {
    const { baselineRepository, baseline } = await referenceFixture();
    const storage = new InMemoryScanStorage();
    const repository = new ScanRepository(storage, baselineRepository, () => "scan-1");
    const comparison = compareWithBaseline(baseline, current()) as ReturnType<
      typeof compareWithBaseline
    > & { timeDomain?: Float32Array; frequencyDomain?: Float32Array };
    comparison.timeDomain = new Float32Array([0.1]);
    comparison.frequencyDomain = new Float32Array([1]);

    const saved = await repository.saveComparison(comparison);
    const restored = await repository.loadAll();

    expect(saved.id).toBe("scan-1");
    expect(restored).toEqual([saved]);
    expect(JSON.stringify(restored)).not.toMatch(/timeDomain|frequencyDomain/);
    expect(saved).toMatchObject({ baselineId: baseline.id, baselineVersion: baseline.version });
  });

  it("rejects missing, mismatched, superseded, and invalid-quality references", async () => {
    const { baselineRepository, baseline } = await referenceFixture();
    const repository = new ScanRepository(
      new InMemoryScanStorage(),
      baselineRepository,
      () => "scan-1",
    );
    const valid = compareWithBaseline(baseline, current());

    await expect(repository.saveComparison({ ...valid, baselineId: "missing" })).rejects.toThrow(
      "NO MATCHING REFERENCE",
    );
    await expect(
      repository.saveComparison({ ...valid, operatingStateId: "state-2" }),
    ).rejects.toThrow("NO MATCHING REFERENCE");
    await expect(
      repository.saveComparison({ ...valid, quality: "invalid" as "valid" }),
    ).rejects.toThrow("Valid current measurement is required");

    const captures = [capture("capture-3", 0.21), capture("capture-4", 0.31)];
    for (const value of captures) await baselineRepository.saveCapture(value);
    await baselineRepository.activateBaseline(aggregateBaseline(captures), 20, 21);
    await expect(repository.saveComparison(valid)).rejects.toThrow("NO MATCHING REFERENCE");
  });

  it("fails closed when a persisted result references a deleted baseline", async () => {
    const { baseline } = await referenceFixture();
    const storage = new InMemoryScanStorage();
    await storage.put({ ...compareWithBaseline(baseline, current()), id: "orphan" });
    const emptyBaselineRepository = new BaselineRepository(
      new InMemoryBaselineStorage(),
      () => 1,
      () => "unused",
    );

    await expect(
      new ScanRepository(storage, emptyBaselineRepository, () => "unused").loadAll(),
    ).rejects.toThrow("Persisted scan reference is unavailable");
  });
});
