import {
  LOCAL_EVIDENCE_DATABASE_NAME,
  LOCAL_EVIDENCE_SCHEMA_VERSION,
  requestValue,
  transactionDone,
  upgradeLocalEvidenceSchema,
} from "../storage/indexeddb-schema";
import type { ScanStorage } from "./repository";
import type { ScanResult } from "./types";

const SCAN_STORE = "scans";

export class IndexedDbScanStorage implements ScanStorage {
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

  async readAll(): Promise<ScanResult[]> {
    const database = await this.open();
    const transaction = database.transaction(SCAN_STORE, "readonly");
    const done = transactionDone(transaction);
    const values = await requestValue(
      transaction.objectStore(SCAN_STORE).getAll() as IDBRequest<ScanResult[]>,
    );
    await done;
    return values;
  }

  async put(value: ScanResult): Promise<void> {
    const database = await this.open();
    const transaction = database.transaction(SCAN_STORE, "readwrite");
    const done = transactionDone(transaction);
    transaction.objectStore(SCAN_STORE).put(structuredClone(value));
    await done;
  }
}
