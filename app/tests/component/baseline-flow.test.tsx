import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BaselineFlow } from "../../src/features/baseline/components/baseline-flow";
import {
  BaselineRepository,
  InMemoryBaselineStorage,
} from "../../src/features/baseline/repository";
import type { CaptureSessionController } from "../../src/features/sensor/capture-session";
import type { CaptureSessionSnapshot } from "../../src/features/sensor/types";
import { MobileRuntime } from "../../src/mobile";

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
      snapshot = { ...snapshot, state: "stopped", frame: undefined, observation: undefined };
      listeners.forEach((listener) => {
        listener(snapshot);
      });
    },
  };
  return {
    controller,
    emit(capturedAt: number) {
      snapshot = {
        id: "session-1",
        state: "active",
        startedAt: 1,
        audioSampleRate: 48_000,
        analysisWindowSize: 2_048,
        trackSettings: { sampleRate: 48_000, channelCount: 1 },
        captureDurationMs: capturedAt - 1,
        frame: {
          sessionId: "session-1",
          capturedAt,
          quality: "valid",
          timeDomain: new Float32Array([0.1]),
          frequencyDomain: new Float32Array([1]),
        },
        observation: {
          rms: 0.2,
          peak: 0.4,
          dominantFrequencyHz: 234.375,
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

describe("known-normal baseline flow", () => {
  it("requires operator confirmations and creates a traceable baseline from multiple captures", async () => {
    const fixture = controllerFixture();
    let nextId = 0;
    const repository = new BaselineRepository(
      new InMemoryBaselineStorage(),
      () => 1_000,
      () => `id-${++nextId}`,
    );
    render(
      <MobileRuntime>
        <BaselineFlow
          controller={fixture.controller}
          repository={repository}
          makeId={() => `entity-${++nextId}`}
          now={() => 900}
        />
      </MobileRuntime>,
    );

    fireEvent.change(await screen.findByLabelText("Machine name"), {
      target: { value: "Exhaust fan" },
    });
    fireEvent.change(screen.getByLabelText("Machine category"), { target: { value: "fan" } });
    fireEvent.click(screen.getByRole("button", { name: "Save machine" }));
    fireEvent.change(await screen.findByLabelText("Operating state name"), {
      target: { value: "Normal speed" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save operating state" }));
    expect(await screen.findByText(/not a certified health assessment/i)).toBeInTheDocument();
    fireEvent.click(
      screen.getByLabelText(/machine is operating in the selected known-normal state/i),
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm and check sensor" }));

    act(() => fixture.emit(100));
    fireEvent.click(await screen.findByRole("button", { name: "Continue to baseline captures" }));

    for (let captureIndex = 0; captureIndex < 2; captureIndex += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Begin baseline capture" }));
      act(() => {
        fixture.emit(200 + captureIndex * 100);
        fixture.emit(250 + captureIndex * 100);
      });
      fireEvent.click(screen.getByRole("button", { name: "Finish baseline capture" }));
      await screen.findByText(new RegExp(`Accepted capture ${captureIndex + 1}`));
    }

    expect(
      screen.getByText(/two captures are only the minimum literal multiple/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Review baseline" }));
    expect(await screen.findByText("Dominant spectral peak movement")).toBeInTheDocument();
    expect(screen.getByText("RMS amplitude range")).toBeInTheDocument();
    expect(screen.getByText("Peak amplitude range")).toBeInTheDocument();
    expect(screen.getByText("Dominant bin range")).toBeInTheDocument();
    expect(screen.getAllByText("234.375 Hz").length).toBeGreaterThanOrEqual(2);
    fireEvent.click(screen.getByLabelText(/manually reviewed capture consistency/i));
    fireEvent.click(screen.getByRole("button", { name: "Activate versioned baseline" }));
    expect(await screen.findByText("Baseline created")).toBeInTheDocument();
    expect(screen.getByText("Version 1")).toBeInTheDocument();
    await waitFor(async () => expect((await repository.loadAll()).baselines).toHaveLength(1));
  }, 10_000);
});
