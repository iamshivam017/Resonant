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
- **Status:** Superseded for the first spike by ADR-0008
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

## ADR-0008: Use the selected Product Design mobile runtime for the sensor spike

- **Date:** 2026-09-13
- **Status:** Accepted for the spike
- **Context:** The user selected Product Design Option 3, a mobile Scientific Strip Chart. The Product Design image-to-code contract requires its protected mobile React/Vite runtime for a fresh mobile visual target, while ADR-0004 named Next.js before a target existed.
- **Decision:** Implement `001-real-sensor-spike` as a self-contained application under `app/` using the protected Product Design mobile React/Vite runtime, npm, and TypeScript. Keep app-specific UI in `app/src/Prototype.tsx` and `app/src/prototype.css`; keep sensor and pure DSP modules in new `app/src/features/` and `app/src/lib/` paths. Preserve the runtime files and nested `app/AGENTS.md` exactly.
- **Rationale:** This honors the user-selected visual source and plugin runtime contract while retaining a clean browser sensor architecture. The spike requires no server route, so Next.js adds no immediate proof value.
- **Alternatives:** Overwriting the protected runtime would violate its verification lock; building a separate Next.js UI would duplicate the selected implementation and make design QA inapplicable.
- **Consequences:** The spike uses Vite rather than Next.js and commands run from `app/`. The included worker is hosting infrastructure only and receives no sensor data. The integrated MVP framework will be reconsidered after the spike based on deployment/provider needs rather than assumed now.

## ADR-0009: Bound Phase 2 quality evidence to deterministic observations

- **Date:** 2026-09-13
- **Status:** Accepted
- **Context:** Phase 2 needs actionable capture feedback without inventing device- or
  machine-dependent thresholds before physical calibration.
- **Decision:** Preserve the `AnalyserNode` plus Canvas architecture. Treat a frame as
  silent only when every time-domain sample is exactly zero and as clipping when any sample
  reaches digital full scale (`abs(sample) >= 1.0`). Report monotonic capture duration and
  positive-interval observed cadence without rating them. Limit features to RMS, peak
  amplitude, and the dominant eligible spectral peak/bin.
- **Rationale:** These observations are deterministic from the captured frame and session
  clock; low-signal, SNR, stability, performance, and machine-condition decisions require
  evidence that does not yet exist.
- **Consequences:** Threshold-dependent behavior is labeled `UNKNOWN / NEEDS CALIBRATION`;
  phone/browser and ambient/fan repeatability are `MANUAL DEVICE VERIFICATION REQUIRED`.
  Centroid, bandwidth, flux, band-energy, and other derived features remain deferred.

## Open decisions

## ADR-0010: Use manual-reviewed, versioned local baseline summaries

- **Date:** 2026-09-13
- **Status:** Accepted for Phase 3
- **Context:** A persistent known-normal workflow is needed before physical evidence
  supports statistical adequacy or automatic consistency thresholds.
- **Decision:** Scope each baseline to one Machine × Operating-State pair; require at
  least two accepted captures; summarize RMS, peak, dominant frequency, and dominant bin
  with median plus observed min/max; retain sources; require explicit known-normal and
  manual-consistency confirmations; persist in IndexedDB; supersede on recalibration.
- **Rationale:** This is transparent and testable without claiming two captures are
  scientifically sufficient.
- **Alternatives:** Fixed five-capture rules, automatic tolerances, mean/stddev, and
  remote persistence were rejected as unsupported or out of scope.
- **Consequences:** Stronger count, duration, and repeatability rules remain
  `UNKNOWN / NEEDS CALIBRATION`; physical evidence remains separate.

- **UNKNOWN / NEEDS VERIFICATION:** Target device/browser results, calibrated quality
  thresholds, baseline sample adequacy, and final benchmark subset.

## ADR-0011: Implement native-unit deviation evidence before composite similarity

- **Date:** 2026-09-13
- **Status:** Accepted for Phase 4
- **Context:** Phase 3 produced transparent baselines, but no physical repeatability dataset
  exists to support normalization, weights, or interpretation thresholds.
- **Decision:** Compare RMS, peak, dominant frequency, and dominant bin independently using
  current value, reference median/min/max, signed/absolute difference, and range position.
  Persist exact active-baseline provenance locally in additive IndexedDB schema version 2.
  Keep `compositeSimilarity` null and calibration explicitly unknown.
- **Rationale:** Native-unit evidence is deterministic and auditable without presenting an
  unsupported cross-unit number as scientific meaning.
- **Alternatives:** Equal weighting, observed-range division, MAD/z-score normalization,
  and categorical severity were rejected until physical evidence supports their parameters.
- **Consequences:** Phase 4 provides a usable evidence result but no condition score,
  anomaly label, fault claim, or health judgment. Calibration remains future work.
