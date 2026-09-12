# RESONANT Decision Record

## Record policy

Only decisions that materially constrain product truth, architecture, delivery, security,
or validation belong here. Proposals remain proposals in their owning document until accepted.

## ADR-0001: Establish repository governance before feature work

- **Date:** 2026-09-13
- **Status:** Accepted
- **Context:** A new scientific/engineering project needs stable evidence, terminology, and repository rules.
- **Decision:** Use root `AGENTS.md`, bounded `docs/`, conservative hygiene files, and dedicated branch `bootstrap/repository-foundation`.
- **Rationale:** Prevents premature implementation and fabricated completeness.
- **Consequences:** Work must preserve the rules and update owning documents with behavior.

## ADR-0002: Use Spec Kit as the development artifact chain

- **Date:** 2026-09-13
- **Status:** Accepted
- **Context:** The project needs traceability from product intent through implementation and convergence.
- **Decision:** Use Spec Kit 1.0.6 with the Codex integration. Each implementation unit progresses through constitution, specification, clarification when needed, plan, tasks, analysis, implementation, and convergence.
- **Rationale:** Makes requirements, design, tests, and completion evidence explicit before code expands.
- **Alternatives:** Ad hoc planning in chat or a single roadmap lacks feature-level gates and traceability.
- **Consequences:** `specs/` and governed `.specify/`/`.agents/` artifacts are versioned; local `feature.json` remains ignored.

## ADR-0003: Make microphone-first local processing the P0 architecture

- **Date:** 2026-09-13
- **Status:** Accepted
- **Context:** Microphone APIs are more broadly available than browser IMU APIs, and raw sensor privacy plus demo reliability matter.
- **Decision:** P0 uses explicit live microphone capture with local in-browser processing. IMU is progressive P1 enhancement. Raw frames are ephemeral and neither persisted nor uploaded by default.
- **Rationale:** Proves the primary value with the smallest trustworthy dependency surface.
- **Alternatives:** IMU-required P0 is compatibility-fragile; server processing adds privacy/network failure; native mobile adds distribution scope.
- **Consequences:** The first spike must prove phone/browser capture over HTTPS before baseline work.

## ADR-0004: Use one Next.js TypeScript application and npm

- **Date:** 2026-09-13
- **Status:** Accepted for the integrated MVP
- **Context:** No package manager/framework existed. The product needs client-only sensors now and may need a server-only provider proxy later.
- **Decision:** Use Next.js App Router 16.2.9, React, TypeScript, and npm; isolate browser APIs behind Client Components and secrets behind server-only routes.
- **Rationale:** One deployment unit serves the sensing client and optional secure integration without a separate backend.
- **Alternatives:** React/Vite is smaller for the spike but needs a later server unit; FastAPI remains useful only for isolated offline benchmark tooling.
- **Consequences:** Node.js 20.9+ is required; the spike itself adds no backend route.

## ADR-0005: Start the spike with Web Audio analyser and Canvas 2D

- **Date:** 2026-09-13
- **Status:** Accepted for the spike
- **Context:** The highest-risk question is live capture and interpretable frequency evidence, not a final production DSP implementation.
- **Decision:** Use the browser analyser for time/frequency frames and Canvas 2D for the hot visualization path. Derive bin frequency from actual sample rate and transform size.
- **Rationale:** Minimal dependencies answer feasibility quickly while preserving real data.
- **Alternatives:** Custom worklet/FFT and charting dependencies are deferred until repeatability/performance evidence justifies them.
- **Consequences:** Phase 3 must measure whether the analyser is reproducible enough before final feature extraction.

## ADR-0006: Keep live-device and labelled-dataset evidence separate

- **Date:** 2026-09-13
- **Status:** Accepted
- **Context:** Public machine-sound datasets differ from smartphone microphones, placement, and demo machines.
- **Decision:** Use physical phone runs for capture/repeatability evidence and an isolated DCASE 2020 Task 2/MIMII pipeline for labelled anomaly methodology. Never transfer benchmark performance claims to the phone domain without validation.
- **Rationale:** Preserves scientific honesty while providing both real hardware interaction and reproducible evaluation.
- **Alternatives:** A single evidence stream either lacks labels or overstates domain transfer.
- **Consequences:** Dataset archives stay outside Git; metrics exist only after a successful manifest-bound run.

## ADR-0007: Defer Sentry and Featherless until deterministic P0 behavior exists

- **Date:** 2026-09-13
- **Status:** Accepted
- **Context:** Neither service is required to prove sensing, and both add data/secret/network boundaries.
- **Decision:** Implement neither in the microphone spike. Add Featherless only as an optional server-side explanation of existing evidence; add Sentry only after scrub tests and runtime failure taxonomy exist.
- **Rationale:** Keeps the core offline-safe and prevents integrations from defining or fabricating results.
- **Consequences:** `.env.example` contains no service variables until the owning feature is implemented and verified.

## Open decisions

- **TODO:** Choose the user-selected Product Design direction and record its tokens/interaction implications.
- **UNKNOWN / NEEDS VERIFICATION:** Deployment provider, target device/browser matrix, calibrated quality thresholds, baseline sample adequacy, and final benchmark subset.
