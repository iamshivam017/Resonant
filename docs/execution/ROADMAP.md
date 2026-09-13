# RESONANT Delivery Roadmap

## Operating rule

Deliver the smallest evidence-bearing vertical slice first. A later phase may begin only
when its dependency and exit criteria are satisfied or a documented decision explicitly
accepts the remaining risk. P0 work preempts P1/P2 work.

## Phase 0 — Repository and requirements audit

- **Objective:** Establish a safe, understood repository and evidence contract.
- **Tasks:** Inspect Git/remote/default branch, files, diffs, tooling, docs, CI, tests, and
  deployment; create governance/document boundaries; initialize Spec Kit.
- **Files/modules:** `AGENTS.md`, `.gitignore`, `.env.example`, `.specify/`, `.agents/`, `docs/`.
- **Dependencies:** None.
- **Tests:** Structure, Markdown, secret/junk, `CODEX.md`, Git-status, and Spec Kit integration checks.
- **Acceptance/exit:** Dedicated branch, clean logical commits, remote SHA verified, no app code or invented data.
- **Status:** Complete; bootstrap and Spec Kit checkpoints are committed.

## Phase 1 — Product, research, architecture, and design foundation

- **Objective:** Bound RESONANT and resolve enough feasibility/architecture risk to plan P0.
- **Tasks:** PRD, authoritative technical research, architecture/data model, DSP/baseline/scoring,
  benchmark method, UX, security/privacy, tests, competition mapping, risks, and Spec Kit spike artifacts.
- **Files/modules:** `docs/*.md`, `docs/execution/*`, `specs/001-real-sensor-spike/`.
- **Dependencies:** Phase 0; current official/browser/dataset documentation.
- **Tests:** Citation and zero-fabrication review, placeholder/Markdown/link check, cross-document terminology review.
- **Acceptance/exit:** P0/P1/P2 explicit; all architecture claims sourced or marked unknown; first spike fully specified/planned.
- **Status:** In progress; visual direction selection and document validation remain.

## Phase 2 — Real microphone sensor spike

- **Objective:** Answer whether the target phone/browser can capture and visualize useful live acoustic evidence.
- **Tasks:** Select one design direction; scaffold selected web stack; implement explicit permission,
  lifecycle/cleanup, waveform, spectrum, dominant-peak/RMS/peak context, and typed failures through TDD;
  deploy HTTPS; perform physical trials.
- **Files/modules:** `src/app/`, `src/features/sensor/`, `src/lib/dsp/`, `tests/`, package/build configs,
  `specs/001-real-sensor-spike/`.
- **Dependencies:** Phase 1 exit, selected design concept, Node/npm, HTTPS host, target phone/browser.
- **Tests:** Unit/component/browser checks, lint/types/build, privacy/secret scan, physical HTTPS worksheet.
- **Acceptance/exit:** Every criterion in spike spec has observed evidence; no fake telemetry; failures are honest;
  device result is pass/fail rather than assumed.

## Phase 3 — Reproducible DSP and quality pipeline

- **Objective:** Turn captured frames into stable, versioned, quality-controlled feature observations.
- **Tasks:** Measure analyser repeatability; decide analyser versus worklet/worker; add DC/window/frame aggregation,
  selected features, quality observations, configuration/versioning, and browser/Python parity fixtures.
- **Files/modules:** `src/lib/dsp/`, optional `src/workers/`, `benchmark/`, DSP docs/tests.
- **Dependencies:** Successful Phase 2 capture evidence and actual device settings.
- **Tests:** Mathematical golden fixtures, property/metamorphic tests, repeatability/performance runs, parity checks.
- **Acceptance/exit:** Feature definitions/units are reproducible; invalid frames reject; hot path meets measured demo-device budget.

## Phase 4 — Machine and known-normal baseline engine

- **Objective:** Commission a trustworthy baseline for one machine and operating state.
- **Tasks:** Add minimal machine/state entities; placement protocol; repeated capture; quality rejection;
  robust median/scale aggregation; consistency/adequacy checks; activation/supersession lifecycle.
- **Files/modules:** `src/features/machines/`, `src/features/baselines/`, `src/lib/baseline/`, schemas/tests/docs.
- **Dependencies:** Versioned Phase 3 features and calibrated evidence requirements.
- **Tests:** State-machine, robust statistics, zero-scale, insufficient/inconsistent samples, mismatch tests.
- **Acceptance/exit:** Only compatible, adequate real measurements activate a baseline; sample/quality rules have recorded evidence.

## Phase 5 — Scan and deviation engine

- **Objective:** Compare a new real observation with one compatible known-normal baseline transparently.
- **Tasks:** Implement compatibility guard, robust normalized distance, empirical calibration, uncertainty,
  evidence ranking, and fail-closed status language.
- **Files/modules:** `src/features/scans/`, `src/lib/scoring/`, condition docs/tests.
- **Dependencies:** Active baseline and held-out/benchmark calibration evidence.
- **Tests:** Hand-checkable calculations, monotonic/property tests, calibration separation, mismatch/quality failures.
- **Acceptance/exit:** No arbitrary threshold or health claim; each valid result exposes distance, context, evidence, and uncertainty.

## Phase 6 — Core P0 product flows

- **Objective:** Integrate machine creation, sensor check, baseline, live scan, and result into one reliable flow.
- **Tasks:** Implement selected design system, navigation, forms, progress/recovery, responsive states, accessibility,
  and method disclosures without decorative landing work.
- **Files/modules:** `src/app/`, `src/features/*/components`, styles/tokens, component/E2E tests.
- **Dependencies:** Phases 2–5; Product Design visual target.
- **Tests:** Component, accessibility, responsive, state/error, and critical-flow E2E checks.
- **Acceptance/exit:** A first-time operator completes the P0 flow on the target phone and understands every result/failure.

## Phase 7 — Local persistence and history

- **Objective:** Preserve versioned machines, baselines, scans, and trends without a network dependency.
- **Tasks:** IndexedDB schema/repository, additive migrations, quota/eviction status, deletion/export,
  scan history, simple evidence-based trend derivation.
- **Files/modules:** `src/lib/storage/`, `src/features/history/`, schemas/migrations/tests/docs.
- **Dependencies:** Stable domain schemas from Phases 4–6.
- **Tests:** CRUD, migration, corruption/quota, delete/export, compatibility, reload/offline E2E.
- **Acceptance/exit:** Records survive reload when storage permits, remain version-safe, and can be deleted; loss is surfaced.

## Phase 8 — Labelled benchmark evaluation

- **Objective:** Quantify the methodology on a reproducible public anomaly-sound dataset without conflating it with phone evidence.
- **Tasks:** Pin MIMII/DCASE subset and checksums; safe download/extraction; preprocessing parity; normal-only
  training; labelled evaluation; AUC/pAUC; manifests/results/limitations.
- **Files/modules:** `benchmark/`, `data/manifests/`, compact `benchmark/results/`, benchmark docs/tests.
- **Dependencies:** Phase 3 features and Phase 5 scoring; adequate time/disk; dataset license/source.
- **Tests:** Checksums, safe extraction, split leakage, metrics, reproducibility, failure/no-artifact behavior.
- **Acceptance/exit:** One command reproduces real versioned metrics from declared inputs; no archives or invented scores enter Git.

## Phase 9 — Optional Featherless explanation

- **Objective:** Translate deterministic evidence for users without affecting measurement/scoring.
- **Tasks:** Define bounded evidence schema; server-only credential; provider request/timeout/rate limit;
  provenance label; offline/unavailable behavior; prompt/security review.
- **Files/modules:** `src/app/api/explain/`, client explanation UI, `.env.example`, contracts/tests/docs.
- **Dependencies:** Stable result contract; Featherless account/key; deployment server support.
- **Tests:** Schema/size, secret-bundle, injection, timeout/rate-limit, provider failure, deterministic-result invariance.
- **Acceptance/exit:** Explanation is optional and labeled; key remains server-only; failure never alters or fabricates result.

## Phase 10 — UX and visual polish

- **Objective:** Make the validated P0 instrument coherent, fast, accessible, and judge-readable.
- **Tasks:** Product Design comparison, typography/tokens, plot clarity, transitions, empty/error copy,
  reduced motion, touch/keyboard, landscape/desktop refinement.
- **Files/modules:** UI/styles/assets and UX spec.
- **Dependencies:** Stable P0 flows and selected visual target.
- **Tests:** Screenshot comparison, accessibility, contrast, keyboard/screen-reader, responsive and performance checks.
- **Acceptance/exit:** No generic/card-heavy drift; core actions work; visible states match source design and engineering truth.

## Phase 11 — Testing, security, and reliability hardening

- **Objective:** Close P0 failure modes and regression/security gaps.
- **Tasks:** Full failure matrix, storage corruption, offline/provider outage, cleanup/leak tests, header/CSP review,
  dependency audit, Sentry scrubbing then optional enablement, security scan/fix cycle.
- **Files/modules:** tests, configs, `SECURITY_PRIVACY.md`, `TEST_STRATEGY.md`, CI.
- **Dependencies:** Integrated application and chosen deployment configuration.
- **Tests:** Complete local suite, physical regression, threat controls, secret/junk scan, critical-path soak.
- **Acceptance/exit:** No current-work failures; high-risk findings fixed or explicitly blocked; telemetry contains no prohibited data.

## Phase 12 — Deployment preparation and verification

- **Objective:** Produce a repeatable HTTPS deployment matching local behavior.
- **Tasks:** Select host, configure environment/headers, deploy early, verify exact revision, health and sensor route,
  phone smoke test, rollback/recovery notes.
- **Files/modules:** provider config, README, deployment/runbook docs.
- **Dependencies:** Host/account access and Phase 11 readiness.
- **Tests:** Production build, config validation, live headers/routes, physical HTTPS critical flow.
- **Acceptance/exit:** Reachable healthy deployment tied to exact commit; no secrets; critical flow verified on target phone.

## Phase 13 — Contributor and methodology documentation

- **Objective:** Make setup, method, evidence, limitations, and reproduction clear.
- **Tasks:** Synchronize README/docs, install/run/test/deploy, data/privacy, benchmark reproduction, architecture diagrams,
  known limitations and troubleshooting.
- **Files/modules:** `README.md`, `docs/`, `specs/`, benchmark manifests.
- **Dependencies:** Actual final commands and deployed behavior.
- **Tests:** Fresh-clone dry run, link/Markdown check, command verification, claim/source audit.
- **Acceptance/exit:** A new contributor can reproduce applicable checks; all claims match implementation/evidence.

## Phase 14 — Demo and pitch preparation

- **Objective:** Communicate the real problem, sensing proof, methodology, limits, and value within judge time.
- **Tasks:** Script, physical setup, controlled sound/machine run, failure backup, screenshots, video, benchmark graphic,
  privacy/claim language, rehearsal.
- **Files/modules:** `docs/demo/` or submission assets only when created and reviewed.
- **Dependencies:** Verified deployment and P0 critical path.
- **Tests:** Timed rehearsals, fresh-session permission flow, alternate device/network, link/video playback.
- **Acceptance/exit:** Repeatable live/recorded proof with no fabricated telemetry or unsupported diagnosis claim.

## Phase 15 — Submission and repository audit

- **Objective:** Deliver the exact verified repository and competition package without merging default branch.
- **Tasks:** Re-check rules/deadline, full diff/history/dependencies/config/docs/security audit, complete suite,
  clean final commit, push, remote SHA verification, submission links/visibility and CI check.
- **Files/modules:** Entire repository and Devpost submission.
- **Dependencies:** Phases 0–14 and required account access.
- **Tests:** Clean install; format/lint/types/unit/integration/E2E/build; schema/migrations; deployment/physical flow;
  secret/junk/large-file scan; remote/CI verification.
- **Acceptance/exit:** Submitted commit SHA equals remotely verified SHA; required artifacts open correctly;
  statuses and unknowns are accurately reported. No merge to `main` without explicit authorization.

## Scope priorities

- **P0:** Real microphone, sensor check, machine/state, known-normal baseline, versioned features,
  valid comparison/result, history/trend, honest failures, accessible instrument UI, HTTPS deployment, docs/demo.
- **P1:** IMU fusion after compatibility proof, reproducible benchmark lab, optional Featherless explanation,
  polished history analytics, privacy-safe Sentry.
- **P2:** Authentication/sync/teams, fleet operations, alerts/work orders, native app, advanced ML,
  remote raw-recording workflows, integrations not required by the core proof.
