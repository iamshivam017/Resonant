# Implementation Plan: Real Sensor Feasibility Spike

**Branch**: `bootstrap/repository-foundation` | **Date**: 2026-09-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-real-sensor-spike/spec.md`

## Summary

Build the smallest trustworthy microphone-first vertical slice inside the selected
Product Design Scientific Strip Chart mobile runtime: explicit permission,
live real-audio lifecycle, waveform, spectrum, dominant-bin evidence, actual capture
settings, and honest degraded/failure states. Implement it as a single responsive web
application with browser-only sensing and processing. Keep raw audio ephemeral and
local. Automated tests verify deterministic state and DSP behavior; a documented
physical-device run is the only evidence that real sensor acceptance criteria pass.

## Technical Context

**Language/Version**: TypeScript 7.0.2 on a Vite-compatible Node.js runtime

**Primary Dependencies**: Product Design mobile React/Vite runtime, React 19.2.7, browser Media Capture and Web Audio APIs; no charting or DSP runtime dependency for the spike

**Storage**: None for runtime sensor data; physical verification evidence is recorded manually in project documentation

**Testing**: Vitest for pure/state tests, Testing Library for interaction states, the template's Playwright runtime checks plus browser lifecycle/error-path smoke tests, Biome for lint/format, and a manual physical-device protocol for real microphone evidence

**Target Platform**: Responsive modern web browser over a secure context; first physical Android Chrome and iOS Safari results remain evidence to collect, not assumed support claims

**Project Type**: Self-contained React/Vite mobile web application under `app/`, using the protected Product Design runtime

**Performance Goals**: Smooth live visualization with a target of at least 30 visual updates per second on the declared demo device; feature summaries update without blocking permission, stop, or error controls

**Constraints**: Real input only in production/demo paths; explicit user gesture; no raw-audio persistence or transmission; no client secrets; stop all tracks and processing loops on exit; no machine-health or anomaly claim

**Scale/Scope**: One local capture session, one microphone input, one sensing surface, four deterministic failure families, and one repeatable physical validation protocol

## Constitution Check

*GATE: Passed before research and re-checked after design.*

| Principle / constraint | Design evidence | Result |
|---|---|---|
| Evidence before claims | Physical behavior is recorded as pass, fail, or `UNKNOWN / NEEDS VERIFICATION`; automated tests are not presented as sensor proof | PASS |
| Real sensor data and fail-closed measurement | Production capture has no fallback telemetry; invalid/stale states suppress features | PASS |
| Machine- and state-specific interpretation | This slice makes no comparison or condition claim and explicitly defers baselines | PASS |
| Test-first, reproducible engineering | Pure behavior begins with failing tests; quickstart records exact physical context and observations | PASS |
| Privacy and security by default | Explicit activation, local ephemeral frames, full teardown, no upload/storage | PASS |
| P0 reliability and instrument-grade UX | Permission, active, stopped, insufficient, and failure states are first-class; decoration is out of scope | PASS |
| Repository and documentation constraints | Dedicated branch, Spec Kit artifact chain, docs updated with the behavior, no new secrets | PASS |

Post-design re-check: the data model, state contract, and quickstart preserve every
gate. No exception or complexity waiver is required.

## Project Structure

### Documentation (this feature)

```text
specs/001-real-sensor-spike/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sensor-session.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── AGENTS.md
├── src/
│   ├── App.tsx                    # protected Product Design runtime
│   ├── mobile/                    # protected Product Design runtime
│   ├── Prototype.tsx              # app-owned instrument composition
│   ├── prototype.css              # app-owned instrument visual system
│   ├── features/
│   │   └── sensor/
│   │       ├── components/
│   │       │   ├── sensor-instrument.tsx
│   │       │   ├── waveform-canvas.tsx
│   │       │   └── spectrum-canvas.tsx
│   │       ├── capture-session.ts
│   │       ├── capability.ts
│   │       ├── errors.ts
│   │       └── types.ts
│   └── lib/
│       └── dsp/
│           ├── dominant-bin.ts
│           └── frame-quality.ts
└── tests/
    ├── unit/
    ├── component/
    └── e2e/
```

**Structure Decision**: Bootstrap the protected Product Design `mobile-app` template into
`app/`, preserve its runtime lock, and keep the hot sensing lifecycle separate from the
app-owned `Prototype` and renderers. Pure DSP helpers accept typed arrays plus explicit
sample rate and analysis settings. Canvas owns high-rate drawing; React receives only
state and low-rate summaries. Defer workers until measured evidence justifies them.

## Complexity Tracking

No constitution violations require justification.

## Delivery Sequence

1. Bootstrap and verify only the selected Product Design mobile runtime, quality tooling, and tests.
2. Write failing state-machine and DSP tests before production behavior.
3. Implement capability detection, permission mapping, session teardown, and pure feature helpers.
4. Complete the selected Product Design direction, then implement the sensing surface and Canvas views.
5. Add browser error-path smoke tests and the physical-device evidence worksheet.
6. Run lint, typecheck, unit/component/E2E checks, production build, secret scan, and manual HTTPS device verification.

Implementation MUST stop short of baseline calibration, scoring, persistence, IMU,
remote explanation, benchmark evaluation, and decorative landing-page expansion.
