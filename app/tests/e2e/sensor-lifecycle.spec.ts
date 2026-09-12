import { expect, test } from "@playwright/test";

async function installActiveCapture(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    Object.assign(window, { __trackStopped: false, __contextClosed: false });
    const track = {
      readyState: "live",
      stop: () => {
        Object.assign(window, { __trackStopped: true });
        const recordStop = Reflect.get(window, "__recordTrackStop");
        if (typeof recordStop === "function") void recordStop();
      },
      getSettings: () => ({ sampleRate: 48_000, channelCount: 1 }),
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };
    const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getSupportedConstraints: () => ({}),
        getUserMedia: async () => stream,
      },
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
      close = async () => Object.assign(window, { __contextClosed: true });
    }
    Object.assign(window, { AudioContext: TestAudioContext });
  });
}

test("does not request microphone access before the explicit start action", async ({ page }) => {
  await page.addInitScript(() => {
    let calls = 0;
    Object.defineProperty(window, "__microphoneRequestCount", { get: () => calls });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getSupportedConstraints: () => ({}),
        getUserMedia: async () => {
          calls += 1;
          throw new DOMException("denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("/");
  await expect(page).toHaveTitle("RESONANT — Live Acoustic Input");
  await expect(page.getByRole("button", { name: "Start sensing" })).toBeVisible();
  expect(await page.evaluate(() => Reflect.get(window, "__microphoneRequestCount"))).toBe(0);
});

test("denial fails closed with actionable recovery and retry", async ({ page }) => {
  await page.addInitScript(() => {
    let attempts = 0;
    Object.defineProperty(window, "__microphoneRequestCount", { get: () => attempts });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getSupportedConstraints: () => ({}),
        getUserMedia: async () => {
          attempts += 1;
          throw new DOMException("denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Start sensing" }).click();
  await expect(page.getByRole("alert")).toContainText("Microphone access was not granted");
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  await expect(page.getByTestId("spectrum-canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  expect(await page.evaluate(() => Reflect.get(window, "__microphoneRequestCount"))).toBe(2);
});

test("unsupported capture fails closed without live evidence", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: undefined });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Start sensing" }).click();
  await expect(page.getByRole("alert")).toContainText("Live microphone capture is unavailable");
  await expect(page.getByTestId("waveform-canvas")).toHaveCount(0);
});

test("active stop releases the track and audio context", async ({ page }) => {
  await installActiveCapture(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Start sensing" }).click();
  await expect(page.getByText("Microphone active")).toBeVisible();
  await expect(page.getByTestId("spectrum-canvas")).toBeVisible();

  await page.getByRole("button", { name: "Stop sensing" }).click();

  await expect(page.getByText("Microphone stopped")).toBeVisible();
  expect(
    await page.evaluate(() => ({
      trackStopped: Reflect.get(window, "__trackStopped"),
      contextClosed: Reflect.get(window, "__contextClosed"),
    })),
  ).toEqual({ trackStopped: true, contextClosed: true });
  await expect(page.getByTestId("spectrum-canvas")).toHaveCount(0);
});

test("page lifecycle termination releases active capture", async ({ page }) => {
  let trackStopped = false;
  await page.exposeFunction("__recordTrackStop", () => {
    trackStopped = true;
  });
  await installActiveCapture(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Start sensing" }).click();
  await expect(page.getByText("Microphone active")).toBeVisible();

  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide")));

  await expect.poll(() => trackStopped).toBe(true);
});

test("the 390-pixel instrument remains inside its mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const instrument = page.getByRole("main");
  await expect(instrument).toBeVisible();
  expect(await instrument.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
    true,
  );
});
