import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { aggregateBaseline } from "../../src/features/baseline/aggregation";
import {
  BaselineRepository,
  InMemoryBaselineStorage,
} from "../../src/features/baseline/repository";
import type { BaselineCapture } from "../../src/features/baseline/types";
import { ScanFlow } from "../../src/features/scan/components/scan-flow";
import { InMemoryScanStorage, ScanRepository } from "../../src/features/scan/repository";
import type { CaptureSessionController } from "../../src/features/sensor/capture-session";
import type { CaptureSessionSnapshot } from "../../src/features/sensor/types";

function controllerFixture() {
  let snapshot: CaptureSessionSnapshot = { id: null, state: "ready" };
  const listeners = new Set<(value: CaptureSessionSnapshot) => void>();
  const controller: CaptureSessionController = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot);
      return () => listeners.delete(listener);
    },
    async start() {},
    async stop() {
      snapshot = { id: null, state: "stopped" };
      listeners.forEach((listener) => {
        listener(snapshot);
      });
    },
  };
  return {
    controller,
    emit(capturedAt: number, rms: number, quality: "valid" | "silent" = "valid") {
      snapshot = {
        id: "session-1",
        state: "active",
        startedAt: 1,
        audioSampleRate: 48_000,
        analysisWindowSize: 2_048,
        captureDurationMs: capturedAt - 1,
        frame: {
          sessionId: "session-1",
          capturedAt,
          quality,
          timeDomain: new Float32Array([rms]),
          frequencyDomain: new Float32Array([1]),
        },
        observation: {
          rms,
          peak: 0.4,
          dominantFrequencyHz: 240,
          dominantBin: 10,
          binResolutionHz: 23.4375,
          freshness: "valid",
        },
      };
      listeners.forEach((listener) => {
        listener(snapshot);
      });
    },
  };
}

const capture = (id: string, rms: number): BaselineCapture => ({
  id,
  machineId: "machine-1",
  operatingStateId: "state-1",
  capturedAt: 100,
  durationMs: 50,
  observationCount: 2,
  features: { rms, peak: 0.4, dominantFrequencyHz: 240, dominantBin: 10 },
  context: { audioSampleRate: 48_000, analysisWindowSize: 2_048 },
});

it("captures current evidence and renders transparent per-feature deviations", async () => {
  const fixture = controllerFixture();
  const baselineRepository = new BaselineRepository(
    new InMemoryBaselineStorage(),
    () => 200,
    () => "baseline-1",
  );
  const machine = await baselineRepository.saveMachine({
    id: "machine-1",
    name: "Exhaust fan",
    category: "Fan",
    createdAt: 1,
  });
  const operatingState = await baselineRepository.saveOperatingState({
    id: "state-1",
    machineId: machine.id,
    name: "Normal speed",
    createdAt: 2,
  });
  const captures = [capture("capture-1", 0.2), capture("capture-2", 0.3)];
  for (const value of captures) await baselineRepository.saveCapture(value);
  const baseline = await baselineRepository.activateBaseline(aggregateBaseline(captures), 10, 11);
  const repository = new ScanRepository(
    new InMemoryScanStorage(),
    baselineRepository,
    () => "scan-1",
  );

  render(
    <ScanFlow
      baseline={baseline}
      machine={machine}
      operatingState={operatingState}
      controller={fixture.controller}
      repository={repository}
      now={() => 500}
      onExit={() => {}}
    />,
  );

  expect(screen.getByText("Exhaust fan · Normal speed")).toBeInTheDocument();
  act(() => fixture.emit(50, 0.3));
  fireEvent.click(screen.getByRole("button", { name: "Begin current measurement" }));
  act(() => fixture.emit(75, 0, "silent"));
  fireEvent.click(screen.getByRole("button", { name: "Finish and compare" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Exact silence detected");

  act(() => fixture.emit(100, 0.3));
  fireEvent.click(screen.getByRole("button", { name: "Begin current measurement" }));
  act(() => fixture.emit(150, 0.4));
  fireEvent.click(screen.getByRole("button", { name: "Finish and compare" }));

  expect(
    await screen.findByRole("heading", { name: "Observed deviation evidence" }),
  ).toBeInTheDocument();
  expect(screen.getByText("LIMITED REFERENCE DATA")).toBeInTheDocument();
  expect(screen.getByText("UNKNOWN / NEEDS CALIBRATION")).toBeInTheDocument();
  const rms = screen.getByRole("group", { name: "RMS amplitude deviation" });
  expect(within(rms).getByText("Above")).toBeInTheDocument();
  expect(within(rms).getByText("+0.100")).toBeInTheDocument();
  expect(screen.getByText("Composite baseline similarity")).toBeInTheDocument();
  expect(screen.getByText("Not calculated")).toBeInTheDocument();
  expect(screen.queryByText(/health score|fault detected|severity/i)).not.toBeInTheDocument();
  await waitFor(async () => expect(await repository.loadAll()).toHaveLength(1));
});
