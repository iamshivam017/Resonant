import { describe, expect, it, vi } from "vitest";
import {
  LOCAL_EVIDENCE_SCHEMA_VERSION,
  LOCAL_EVIDENCE_STORES,
  upgradeLocalEvidenceSchema,
} from "../../src/features/storage/indexeddb-schema";

describe("local evidence schema", () => {
  it("adds the scans store in schema version 2 without recreating existing stores", () => {
    const existing = new Set(["machines", "operatingStates", "captures", "baselines"]);
    const createObjectStore = vi.fn((name: string) => existing.add(name));
    const database = {
      objectStoreNames: { contains: (name: string) => existing.has(name) },
      createObjectStore,
    } as unknown as IDBDatabase;

    upgradeLocalEvidenceSchema(database);

    expect(LOCAL_EVIDENCE_SCHEMA_VERSION).toBe(2);
    expect(LOCAL_EVIDENCE_STORES).toContain("scans");
    expect(createObjectStore).toHaveBeenCalledTimes(1);
    expect(createObjectStore).toHaveBeenCalledWith("scans", { keyPath: "id" });
    expect(existing).toEqual(
      new Set(["machines", "operatingStates", "captures", "baselines", "scans"]),
    );
  });
});
