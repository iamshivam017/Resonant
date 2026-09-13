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
      const request = indexedDB.open("resonant-local-evidence", 1);
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const tx = database.transaction(
        ["machines", "operatingStates", "captures", "baselines"],
        "readonly",
      );
      const counts = await Promise.all(
        ["machines", "operatingStates", "captures", "baselines"].map(
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
  ).toEqual([1, 1, 2, 1]);
  await page.reload();
  await expect(page.getByText("Stored baselines")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Recalibrate Exhaust fan · Normal speed" }),
  ).toBeVisible();
});
