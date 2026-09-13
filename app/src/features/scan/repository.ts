import type { BaselineRepository } from "../baseline/repository";
import type { ScanComparison, ScanResult } from "./types";
import { validateScanComparison, validateScanResult } from "./validation";

export interface ScanStorage {
  readAll(): Promise<ScanResult[]>;
  put(value: ScanResult): Promise<void>;
}

export class InMemoryScanStorage implements ScanStorage {
  private results: ScanResult[] = [];

  async readAll() {
    return structuredClone(this.results);
  }

  async put(value: ScanResult) {
    const index = this.results.findIndex(({ id }) => id === value.id);
    if (index >= 0) this.results[index] = structuredClone(value);
    else this.results.push(structuredClone(value));
  }
}

export class ScanRepository {
  constructor(
    private storage: ScanStorage,
    private baselines: BaselineRepository,
    private makeId: () => string,
  ) {}

  async saveComparison(comparison: ScanComparison): Promise<ScanResult> {
    const value = validateScanComparison(comparison);
    const data = await this.baselines.loadAll();
    const reference = data.baselines.find(
      (baseline) =>
        baseline.id === value.baselineId &&
        baseline.version === value.baselineVersion &&
        baseline.machineId === value.machineId &&
        baseline.operatingStateId === value.operatingStateId &&
        baseline.status === "active",
    );
    if (!reference) throw new Error("NO MATCHING REFERENCE");
    if (
      reference.sourceCaptures.length !== value.referenceEvidence.captureCount ||
      Object.keys(value.deviations).some((key) => {
        const feature = key as keyof typeof value.deviations;
        const observed = reference.features[feature];
        const deviation = value.deviations[feature];
        return (
          observed.median !== deviation.baselineMedian ||
          observed.min !== deviation.baselineMin ||
          observed.max !== deviation.baselineMax
        );
      })
    ) {
      throw new Error("Comparison evidence does not match the active reference");
    }
    const result = validateScanResult({ ...value, id: this.makeId() });
    await this.storage.put(result);
    return result;
  }

  async loadAll(): Promise<ScanResult[]> {
    const results = (await this.storage.readAll()).map(validateScanResult);
    const data = await this.baselines.loadAll();
    for (const result of results) {
      const reference = data.baselines.find(
        (baseline) =>
          baseline.id === result.baselineId &&
          baseline.version === result.baselineVersion &&
          baseline.machineId === result.machineId &&
          baseline.operatingStateId === result.operatingStateId,
      );
      if (!reference) throw new Error("Persisted scan reference is unavailable");
    }
    return results;
  }
}
