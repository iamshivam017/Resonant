import { expect, test } from "@playwright/test";

test("upgrades Phase 3 evidence to schema v2 without losing existing records", async ({ page }) => {
  await page.goto("/tests/storage-fixture.html");
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const deletion = indexedDB.deleteDatabase("resonant-local-evidence");
      deletion.onsuccess = () => resolve();
      deletion.onerror = () => resolve();
    });
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("resonant-local-evidence", 1);
      request.onupgradeneeded = () => {
        for (const store of ["machines", "operatingStates", "captures", "baselines"]) {
          request.result.createObjectStore(store, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction("machines", "readwrite");
    transaction.objectStore("machines").put({
      id: "phase-3-machine",
      name: "Preserved fan",
      category: "Fan",
      createdAt: 1,
    });
    await new Promise<void>((resolve) => {
      transaction.oncomplete = () => resolve();
    });
    database.close();
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Identify the machine" })).toBeVisible();
  const evidence = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("resonant-local-evidence", 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction("machines", "readonly");
    const machines = await new Promise<{ name: string }[]>((resolve, reject) => {
      const getAll = transaction.objectStore("machines").getAll();
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = () => reject(getAll.error);
    });
    return { version: database.version, stores: [...database.objectStoreNames], machines };
  });

  expect(evidence).toMatchObject({
    version: 2,
    stores: ["baselines", "captures", "machines", "operatingStates", "scans"],
    machines: [{ name: "Preserved fan" }],
  });
});
