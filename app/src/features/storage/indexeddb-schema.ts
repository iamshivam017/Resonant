export const LOCAL_EVIDENCE_DATABASE_NAME = "resonant-local-evidence";
export const LOCAL_EVIDENCE_SCHEMA_VERSION = 2;
export const BASELINE_EVIDENCE_STORES = [
  "machines",
  "operatingStates",
  "captures",
  "baselines",
] as const;
export const LOCAL_EVIDENCE_STORES = [...BASELINE_EVIDENCE_STORES, "scans"] as const;

export function upgradeLocalEvidenceSchema(database: IDBDatabase): void {
  for (const store of LOCAL_EVIDENCE_STORES) {
    if (!database.objectStoreNames.contains(store)) {
      database.createObjectStore(store, { keyPath: "id" });
    }
  }
}

export function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Local evidence storage request failed"));
  });
}

export function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error("Local evidence storage transaction failed"));
    transaction.onabort = () => reject(new Error("Local evidence storage transaction was aborted"));
  });
}
