import { describe, expect, it } from "vitest";
import { aggregateBaseline } from "../../src/features/baseline/aggregation";
import {
  BaselineRepository,
  InMemoryBaselineStorage,
} from "../../src/features/baseline/repository";
import type { BaselineCapture } from "../../src/features/baseline/types";

const capture = (id: string): BaselineCapture => ({
  id,
  machineId: "machine-1",
  operatingStateId: "state-1",
  capturedAt: 100,
  durationMs: 100,
  observationCount: 2,
  features: { rms: 0.2, peak: 0.4, dominantFrequencyHz: 200, dominantBin: 8 },
  context: { audioSampleRate: 48_000, analysisWindowSize: 2_048 },
});

describe("baseline repository", () => {
  it("persists machine/state/captures and reloads validated records", async () => {
    const storage = new InMemoryBaselineStorage();
    const first = new BaselineRepository(
      storage,
      () => 100,
      () => "generated",
    );
    await first.saveMachine({ id: "machine-1", name: "Fan", category: "fan", createdAt: 1 });
    await first.saveOperatingState({
      id: "state-1",
      machineId: "machine-1",
      name: "Normal",
      createdAt: 2,
    });
    await first.saveCapture(capture("capture-1"));
    const restored = await new BaselineRepository(
      storage,
      () => 200,
      () => "next",
    ).loadAll();
    expect(restored.machines).toHaveLength(1);
    expect(restored.operatingStates[0]?.machineId).toBe("machine-1");
    expect(restored.captures[0]).not.toHaveProperty("timeDomain");
  });

  it("creates a new version and supersedes rather than overwriting", async () => {
    const storage = new InMemoryBaselineStorage();
    let id = 0;
    const repository = new BaselineRepository(
      storage,
      () => 500,
      () => `baseline-${++id}`,
    );
    await repository.saveMachine({ id: "machine-1", name: "Fan", category: "fan", createdAt: 1 });
    await repository.saveOperatingState({
      id: "state-1",
      machineId: "machine-1",
      name: "Normal",
      createdAt: 2,
    });
    const captures = [capture("capture-1"), capture("capture-2")];
    await repository.saveCapture(captures[0]);
    await repository.saveCapture(captures[1]);
    const aggregate = aggregateBaseline(captures);
    const first = await repository.activateBaseline(aggregate, 300, 400);
    const second = await repository.activateBaseline(aggregate, 300, 450);
    const all = (await repository.loadAll()).baselines;
    expect([first.version, second.version]).toEqual([1, 2]);
    expect(all.find(({ id: itemId }) => itemId === first.id)?.status).toBe("superseded");
    expect(all.find(({ id: itemId }) => itemId === second.id)?.status).toBe("active");
  });

  it("rejects an operating state whose machine does not exist", async () => {
    const repository = new BaselineRepository(
      new InMemoryBaselineStorage(),
      () => 1,
      () => "id",
    );
    await expect(
      repository.saveOperatingState({
        id: "state-1",
        machineId: "missing",
        name: "Normal",
        createdAt: 1,
      }),
    ).rejects.toThrow("Machine does not exist");
  });

  it("fails closed when persisted records violate machine/state ownership", async () => {
    const storage = new InMemoryBaselineStorage();
    await storage.put("machines", { id: "machine-1", name: "Fan", category: "fan", createdAt: 1 });
    await storage.put("operatingStates", {
      id: "state-1",
      machineId: "missing",
      name: "Normal",
      createdAt: 2,
    });
    const repository = new BaselineRepository(
      storage,
      () => 1,
      () => "id",
    );
    await expect(repository.loadAll()).rejects.toThrow(
      "Persisted operating state does not match a machine",
    );
  });

  it("refuses to activate an aggregate whose source captures were not persisted", async () => {
    const repository = new BaselineRepository(
      new InMemoryBaselineStorage(),
      () => 1,
      () => "id",
    );
    await repository.saveMachine({ id: "machine-1", name: "Fan", category: "fan", createdAt: 1 });
    await repository.saveOperatingState({
      id: "state-1",
      machineId: "machine-1",
      name: "Normal",
      createdAt: 2,
    });
    await expect(
      repository.activateBaseline(aggregateBaseline([capture("a"), capture("b")]), 3, 4),
    ).rejects.toThrow("Source captures are not persisted");
  });
});
