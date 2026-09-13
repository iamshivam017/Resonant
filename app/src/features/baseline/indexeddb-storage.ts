import type { BaselineStorage } from "./repository";
import type { Baseline, BaselineCapture, BaselineData, Machine, OperatingState } from "./types";
import {
  BASELINE_EVIDENCE_STORES,
  LOCAL_EVIDENCE_DATABASE_NAME,
  LOCAL_EVIDENCE_SCHEMA_VERSION,
  requestValue,
  transactionDone,
  upgradeLocalEvidenceSchema,
} from "../storage/indexeddb-schema";

export class IndexedDbBaselineStorage implements BaselineStorage {
  private database?: Promise<IDBDatabase>;
  constructor(private getFactory: () => IDBFactory = () => indexedDB) {}

  private open() {
    this.database ??= new Promise<IDBDatabase>((resolve, reject) => {
      let request: IDBOpenDBRequest;
      try {
        request = this.getFactory().open(
          LOCAL_EVIDENCE_DATABASE_NAME,
          LOCAL_EVIDENCE_SCHEMA_VERSION,
        );
      } catch {
        reject(new Error("Local evidence storage is unavailable in this browser"));
        return;
      }
      request.onupgradeneeded = () => upgradeLocalEvidenceSchema(request.result);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error("Local evidence storage could not be opened"));
      request.onblocked = () =>
        reject(new Error("Local evidence storage upgrade is blocked by another tab"));
    });
    return this.database;
  }

  async readAll(): Promise<BaselineData> {
    const database = await this.open();
    const transaction = database.transaction(BASELINE_EVIDENCE_STORES, "readonly");
    const done = transactionDone(transaction);
    const [machines, operatingStates, captures, baselines] = await Promise.all([
      requestValue(transaction.objectStore("machines").getAll() as IDBRequest<Machine[]>),
      requestValue(
        transaction.objectStore("operatingStates").getAll() as IDBRequest<OperatingState[]>,
      ),
      requestValue(transaction.objectStore("captures").getAll() as IDBRequest<BaselineCapture[]>),
      requestValue(transaction.objectStore("baselines").getAll() as IDBRequest<Baseline[]>),
    ]);
    await done;
    return { machines, operatingStates, captures, baselines };
  }

  async put(
    store: keyof Omit<BaselineData, "baselines">,
    value: Machine | OperatingState | BaselineCapture,
  ) {
    const database = await this.open();
    const transaction = database.transaction(store, "readwrite");
    const done = transactionDone(transaction);
    transaction.objectStore(store).put(structuredClone(value));
    await done;
  }

  async commitBaselineVersion(next: Baseline, supersedeIds: string[]) {
    const database = await this.open();
    const transaction = database.transaction("baselines", "readwrite");
    const done = transactionDone(transaction);
    const store = transaction.objectStore("baselines");
    for (const id of supersedeIds) {
      const current = await requestValue(store.get(id) as IDBRequest<Baseline | undefined>);
      if (current) store.put({ ...current, status: "superseded" });
    }
    store.add(structuredClone(next));
    await done;
  }
}
