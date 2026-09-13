import type { BaselineStorage } from "./repository";
import type { Baseline, BaselineCapture, BaselineData, Machine, OperatingState } from "./types";

const DATABASE_NAME = "resonant-local-evidence";
const DATABASE_VERSION = 1;
const stores = ["machines", "operatingStates", "captures", "baselines"] as const;

function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Local evidence storage request failed"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error("Local evidence storage transaction failed"));
    transaction.onabort = () => reject(new Error("Local evidence storage transaction was aborted"));
  });
}

export class IndexedDbBaselineStorage implements BaselineStorage {
  private database?: Promise<IDBDatabase>;
  constructor(private getFactory: () => IDBFactory = () => indexedDB) {}

  private open() {
    this.database ??= new Promise<IDBDatabase>((resolve, reject) => {
      let request: IDBOpenDBRequest;
      try {
        request = this.getFactory().open(DATABASE_NAME, DATABASE_VERSION);
      } catch {
        reject(new Error("Local evidence storage is unavailable in this browser"));
        return;
      }
      request.onupgradeneeded = () => {
        for (const store of stores)
          if (!request.result.objectStoreNames.contains(store))
            request.result.createObjectStore(store, { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error("Local evidence storage could not be opened"));
      request.onblocked = () =>
        reject(new Error("Local evidence storage upgrade is blocked by another tab"));
    });
    return this.database;
  }

  async readAll(): Promise<BaselineData> {
    const database = await this.open();
    const transaction = database.transaction(stores, "readonly");
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
