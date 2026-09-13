import { expect, test } from "@playwright/test";

async function installActiveCapture(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const track = {
      stop: () => undefined,
      getSettings: () => ({ sampleRate: 48_000, channelCount: 1 }),
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };
    const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getSupportedConstraints: () => ({}), getUserMedia: async () => stream },
    });
    class TestAudioContext {
      sampleRate = 48_000;
      state = "running";
      analyser = {
        fftSize: 8,
        frequencyBinCount: 4,
        getFloatTimeDomainData: (target: Float32Array) => target.fill(0.1),
        getFloatFrequencyData: (target: Float32Array) => target.set([-90, -40, -20, -50]),
        disconnect: () => undefined,
      };
      createAnalyser = () => this.analyser;
      createMediaStreamSource = () => ({
        connect: () => this.analyser,
        disconnect: () => undefined,
      });
      resume = async () => undefined;
      close = async () => undefined;
    }
    Object.assign(window, { AudioContext: TestAudioContext });
  });
}

test("commissions, persists, and offers non-destructive recalibration", async ({ page }) => {
  await installActiveCapture(page);
  await page.goto("/");
  expect(
    await page
      .locator(".baseline-screen .mobile-scroll-content")
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingLeft)),
  ).toBeGreaterThanOrEqual(18);
  await page.getByLabel("Machine name").fill("Exhaust fan");
  await page.getByLabel("Machine category").fill("fan");
  await page.getByRole("button", { name: "Save machine" }).click();
  await page.getByLabel("Operating state name").fill("Normal speed");
  await page.getByRole("button", { name: "Save operating state" }).click();
  await page.getByRole("checkbox", { name: /machine is operating/i }).click();
  await page.getByRole("button", { name: "Confirm and check sensor" }).click();
  await page.getByRole("button", { name: "Start sensing" }).click();
  await expect(page.getByRole("button", { name: "Continue to baseline captures" })).toBeEnabled();
  await page.getByRole("button", { name: "Continue to baseline captures" }).click();
  for (let index = 1; index <= 2; index += 1) {
    await page.getByRole("button", { name: "Begin baseline capture" }).click();
    await page.waitForTimeout(80);
    await page.getByRole("button", { name: "Finish baseline capture" }).click();
    await expect(page.getByText(`Accepted capture ${index}`)).toBeVisible();
  }
  await page.getByRole("button", { name: "Review baseline" }).click();
  await page.getByRole("checkbox", { name: /manually reviewed/i }).click();
  await page.getByRole("button", { name: "Activate versioned baseline" }).click();
  await expect(page.getByText("Version 1")).toBeVisible();
  expect(
    await page.evaluate(async () => {
      const request = indexedDB.open("resonant-local-evidence", 2);
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const tx = database.transaction(
        ["machines", "operatingStates", "captures", "baselines", "scans"],
        "readonly",
      );
      const counts = await Promise.all(
        ["machines", "operatingStates", "captures", "baselines", "scans"].map(
          (store) =>
            new Promise<number>((resolve, reject) => {
              const count = tx.objectStore(store).count();
              count.onsuccess = () => resolve(count.result);
              count.onerror = () => reject(count.error);
            }),
        ),
      );
      return counts;
    }),
  ).toEqual([1, 1, 2, 1, 0]);
  await page.reload();
  await expect(page.getByText("Stored baselines")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Recalibrate Exhaust fan · Normal speed" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Compare Exhaust fan · Normal speed" }).click();
  await expect(page.getByText("Exhaust fan · Normal speed")).toBeVisible();
  await page.getByRole("button", { name: "Start sensing" }).click();
  await expect(page.getByRole("button", { name: "Begin current measurement" })).toBeEnabled();
  await page.getByRole("button", { name: "Begin current measurement" }).click();
  await page.waitForTimeout(80);
  await page.getByRole("button", { name: "Finish and compare" }).click();
  await expect(page.getByRole("heading", { name: "Observed deviation evidence" })).toBeVisible();
  await expect(page.getByText("LIMITED REFERENCE DATA")).toBeVisible();
  await expect(page.getByText("UNKNOWN / NEEDS CALIBRATION")).toBeVisible();
  await expect(page.getByText("Not calculated")).toBeVisible();
  await expect(page.getByText(/health score|fault detected|severity/i)).toHaveCount(0);
  expect(
    await page.evaluate(async () => {
      const request = indexedDB.open("resonant-local-evidence", 2);
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const transaction = database.transaction("scans", "readonly");
      const records = await new Promise<unknown[]>((resolve, reject) => {
        const getAll = transaction.objectStore("scans").getAll();
        getAll.onsuccess = () => resolve(getAll.result);
        getAll.onerror = () => reject(getAll.error);
      });
      return { count: records.length, serialized: JSON.stringify(records) };
    }),
  ).toMatchObject({ count: 1 });
  expect(
    await page.evaluate(async () => {
      const request = indexedDB.open("resonant-local-evidence", 2);
      const database = await new Promise<IDBDatabase>((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });
      const transaction = database.transaction("scans", "readonly");
      return await new Promise<string>((resolve) => {
        const getAll = transaction.objectStore("scans").getAll();
        getAll.onsuccess = () => resolve(JSON.stringify(getAll.result));
      });
    }),
  ).not.toMatch(/timeDomain|frequencyDomain/);

  await page.getByRole("button", { name: "Measure again" }).click();
  await page.getByRole("button", { name: "Start sensing" }).click();
  await expect(page.getByRole("button", { name: "Begin current measurement" })).toBeEnabled();
  await page.getByRole("button", { name: "Begin current measurement" }).click();
  await page.waitForTimeout(80);
  await page.evaluate(async () => {
    const request = indexedDB.open("resonant-local-evidence", 2);
    const database = await new Promise<IDBDatabase>((resolve) => {
      request.onsuccess = () => resolve(request.result);
    });
    const transaction = database.transaction("baselines", "readwrite");
    const store = transaction.objectStore("baselines");
    const active = await new Promise<Record<string, unknown>>((resolve) => {
      const getAll = store.getAll();
      getAll.onsuccess = () => resolve(getAll.result[0]);
    });
    store.put({ ...active, status: "superseded" });
    await new Promise<void>((resolve) => {
      transaction.oncomplete = () => resolve();
    });
  });
  await page.getByRole("button", { name: "Finish and compare" }).click();
  await expect(page.getByRole("alert")).toHaveText("NO MATCHING REFERENCE");
});
