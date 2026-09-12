# Tasks: Real Sensor Feasibility Spike

**Input**: Design documents from `/specs/001-real-sensor-spike/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Required. Every behavioral implementation task follows an observed failing test.

**Organization**: Tasks are grouped by independently testable user story and use exact target paths.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Select the visual target and establish only the tooling needed for this spike.

- [x] T001 Record the user-selected Product Design concept, tokens, plot hierarchy, and interaction implications in docs/UX_SPEC.md and docs/execution/DECISIONS.md
- [x] T002 Bootstrap the protected Product Design mobile-app React/Vite runtime with npm in app/AGENTS.md, app/package.json, app/package-lock.json, app/src/App.tsx, app/src/mobile/, app/src/Prototype.tsx, and app/src/prototype.css without adding sensor behavior
- [x] T003 [P] Configure Biome formatting/lint, typecheck, unit/component test, E2E, and production-build scripts in app/package.json, app/biome.json, app/vitest.config.ts, and app/playwright.config.ts
- [x] T004 [P] Configure Vitest browser-like test environment and shared cleanup in app/vitest.config.ts and app/tests/setup.ts
- [x] T005 [P] Verify root .gitignore and app tool ignores cover dependencies, build/test output, environments, recordings, and datasets; document deployment header verification in docs/SECURITY_PRIVACY.md

**Checkpoint**: Clean install, empty app shell, and every quality command exists; no sensor implementation or fake telemetry exists.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared contracts and visual foundations used by every story.

- [x] T006 [P] Define CaptureCapability, CaptureSession, SignalFrame, FeatureObservation, CaptureError, state unions, and validation invariants from data-model.md in app/src/features/sensor/types.ts
- [x] T007 [P] Define accessible instrument tokens and reduced-motion behavior from the selected concept in app/src/prototype.css
- [x] T008 [P] Add test-only browser sensor adapters and explicitly label them non-production in app/tests/fixtures/media.ts
- [x] T009 Configure and red-check Biome's production import boundary so app/src/ cannot import app/tests/ fixtures in app/biome.json

**Checkpoint**: Types compile, design tokens match the selected target, and test fixtures are unreachable from production code.

---

## Phase 3: User Story 1 — Observe Live Machine Sound (Priority: P1) 🎯 MVP

**Goal**: An explicit start produces a real live session and responsive waveform; stop releases it.

**Independent Test**: Grant microphone permission on a supported target, observe waveform response to quiet/louder/quiet physical input, then stop and verify capture ends.

### Tests for User Story 1

- [x] T010 [P] [US1] Write failing capability tests proving check-only behavior observes secureContext/mediaDevices without requesting permission in app/tests/unit/capability.test.ts
- [x] T011 [P] [US1] Write failing session tests for ready → requesting-permission → initializing → active → stopping → stopped, single-session start, observed track settings, and idempotent cleanup in app/tests/unit/capture-session.test.ts
- [x] T012 [P] [US1] Write failing component tests for explicit start, permission progress, active indicator, stop action, observed settings, and cleared/stale values after stop in app/tests/component/sensor-instrument.test.tsx

### Implementation for User Story 1

- [x] T013 [US1] Implement capability observation without permission side effects in app/src/features/sensor/capability.ts to satisfy T010
- [x] T014 [US1] Implement the session lifecycle, effective settings capture, frame freshness, and complete resource teardown in app/src/features/sensor/capture-session.ts to satisfy T011
- [x] T015 [US1] Implement the selected mobile-first instrument surface with explicit lifecycle controls and accessible state summaries in app/src/features/sensor/components/sensor-instrument.tsx to satisfy T012
- [x] T016 [US1] Implement the live time-domain Canvas renderer outside high-frequency React state in app/src/features/sensor/components/waveform-canvas.tsx
- [x] T017 [US1] Integrate the sensing surface inside the protected runtime via app/src/Prototype.tsx and verify no permission request occurs on initial render

**Checkpoint**: User Story 1 works independently with real input and cleanup; it does not yet claim frequency evidence.

---

## Phase 4: User Story 2 — Inspect Frequency-Domain Evidence (Priority: P2)

**Goal**: Show a real spectrum, strongest observed bin, resolution, and capture context.

**Independent Test**: Measure two physically produced sounds with distinct tones and observe corresponding spectrum/strongest-bin changes.

### Tests for User Story 2

- [x] T018 [P] [US2] Write failing mathematical tests for RMS, peak, bin resolution, eligible-bin selection, empty/non-finite input, and dominant-bin frequency in app/tests/unit/dominant-bin.test.ts
- [x] T019 [P] [US2] Write failing quality tests proving stale or insufficient frames suppress interpreted frequency output in app/tests/unit/frame-quality.test.ts
- [x] T020 [P] [US2] Extend failing component tests for spectrum, units, sample rate, transform size, resolution, uncalibrated amplitude copy, and insufficient-state suppression in app/tests/component/sensor-instrument.test.tsx

### Implementation for User Story 2

- [x] T021 [US2] Implement pure finite RMS, peak, bin-resolution, and strongest-eligible-bin functions with explicit configuration in app/src/lib/dsp/dominant-bin.ts to satisfy T018
- [x] T022 [US2] Implement valid/insufficient/stale frame classification without invented calibrated thresholds in app/src/lib/dsp/frame-quality.ts to satisfy T019
- [x] T023 [US2] Implement the live frequency-domain Canvas renderer and accessible spectrum summary in app/src/features/sensor/components/spectrum-canvas.tsx
- [x] T024 [US2] Integrate low-rate feature summaries and measured-context labels into app/src/features/sensor/components/sensor-instrument.tsx to satisfy T020

**Checkpoint**: User Story 2 independently exposes real, correctly labeled spectral evidence without baseline, fault-frequency, or health claims.

---

## Phase 5: User Story 3 — Understand Capture Failures (Priority: P3)

**Goal**: Every denial, unsupported, interruption, and processing failure invalidates output and offers specific recovery.

**Independent Test**: Exercise each deterministic failure adapter plus at least one real browser/device failure and confirm no valid measurement remains.

### Tests for User Story 3

- [x] T025 [P] [US3] Write failing error-mapping tests for permission-denied, unsupported, device-unavailable, constraint-failed, interrupted, and processing-failed outcomes in app/tests/unit/errors.test.ts
- [x] T026 [P] [US3] Extend failing session tests for permission dismissal/denial, initialization failure, track-ended interruption, unmount cleanup, double transitions, and old-session frame rejection in app/tests/unit/capture-session.test.ts
- [x] T027 [P] [US3] Extend failing component tests for specific recovery copy, unavailable evidence, retry behavior, and accessible error announcements in app/tests/component/sensor-instrument.test.tsx

### Implementation for User Story 3

- [x] T028 [US3] Implement stable safe error codes, summaries, and recovery actions without leaking browser internals in app/src/features/sensor/errors.ts to satisfy T025
- [x] T029 [US3] Complete failure transitions, old-session invalidation, and cleanup guarantees in app/src/features/sensor/capture-session.ts to satisfy T026
- [x] T030 [US3] Complete degraded/error/retry states and lifecycle announcements in app/src/features/sensor/components/sensor-instrument.tsx to satisfy T027

**Checkpoint**: Every planned failure family is independently testable and fails closed.

---

## Phase 6: Polish, Evidence, and Cross-Cutting Validation

**Purpose**: Verify the integrated slice against the selected design, security boundaries, and physical acceptance criteria.

- [x] T031 [P] Add browser E2E checks for initial no-request state, denial/unsupported paths, stop/retry, navigation cleanup, responsive layout, and accessible summaries in app/tests/e2e/sensor-lifecycle.spec.ts
- [x] T032 [P] Add a browser-build scan for forbidden fixture imports, raw-audio persistence/transmission, and exposed secret patterns in app/tests/unit/production-boundary.test.ts
- [x] T033 Compare the rendered 390 × 844 active/error surfaces against the selected Product Design source, fix visible hierarchy/spacing/type/state drift in app/src/prototype.css and app/src/features/sensor/components/, and record the comparison in docs/UX_SPEC.md
- [ ] T034 Measure live update rate, long tasks, stop responsiveness, and resource cleanup on the declared demo phone and record evidence in docs/execution/CURRENT_PHASE.md
- [x] T035 Run the full quickstart command set and record concise PASS/FAIL/UNVERIFIED evidence in docs/execution/CURRENT_PHASE.md
- [ ] T036 Deploy the exact tested commit over HTTPS, verify headers and reachable health, and record provider/deployment evidence in README.md and docs/SECURITY_PRIVACY.md
- [ ] T037 Execute every physical HTTPS trial from specs/001-real-sensor-spike/quickstart.md and record device/browser/settings/observations without invented values in docs/execution/CURRENT_PHASE.md
- [x] T038 Run Spec Kit convergence, complete the feature diff/security/secret/junk audit, commit logically, push the dedicated branch, and verify the exact local/remote SHA

---

## Dependencies and Execution Order

```text
T001 design selection
  → Phase 1 setup
  → Phase 2 foundation
  → US1 real capture
  → US2 frequency evidence
  → US3 failure clarity
  → integrated/physical validation
```

- T001 blocks UI scaffolding and token work.
- T002–T005 establish tooling; T003–T005 can proceed in parallel after T002 creates the package scaffold.
- T006–T009 block story implementation; their different files allow T006–T008 to proceed in parallel.
- US2 depends on US1's real frame stream. US3 reuses the US1 lifecycle, so sequential P1 → P2 → P3 is the lowest-risk execution order.
- Physical/deployment evidence depends on the integrated production build; automated checks never satisfy T034–T037.

## Parallel Examples

### User Story 1

```text
T010 capability tests || T011 lifecycle tests || T012 component tests
```

### User Story 2

```text
T018 DSP math tests || T019 quality tests || T020 component contract tests
```

### User Story 3

```text
T025 error mapping tests || T026 lifecycle failure tests || T027 UI error tests
```

## Implementation Strategy

1. Complete T001–T009 and verify the empty instrument shell.
2. Deliver US1 first and stop to prove real capture/cleanup on available hardware.
3. Add US2 only after a real frame exists; add US3 after normal lifecycle behavior is stable.
4. Do not begin baselines, scoring, persistence, IMU, benchmark, provider, or telemetry work.
5. The feature is complete only after automated, build, deployment, and physical evidence all satisfy the specification.

## Task Summary

- **Total:** 42 tasks.
- **Setup/foundation:** 9 tasks.
- **US1:** 8 tasks.
- **US2:** 7 tasks.
- **US3:** 6 tasks.
- **Cross-cutting/evidence:** 8 tasks.
- **Suggested MVP checkpoint:** User Story 1 through T017, followed by the available physical capture/cleanup check.

## Phase 7: Convergence

- [x] T039 Add and test a distinct fail-closed degraded measurement state without inventing a calibrated threshold per FR-008 (partial)
- [x] T040 Make the dominant-bin eligible range explicit configuration and test the configured boundary per T021 and plan: DSP helper configuration (partial)

## Phase 8: Convergence

- [x] T041 Expose and test distinct user-visible lifecycle summaries for ready, requesting permission, initializing, active, stopping, stopped, denied, unsupported, interrupted, and failed states per FR-002 (partial)
- [x] T042 Display and test uncalibrated RMS and peak observations for valid frames while suppressing them for non-valid frames per US2/AC3 and quickstart (partial)
