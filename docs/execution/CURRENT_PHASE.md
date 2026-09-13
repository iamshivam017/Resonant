# RESONANT Current Phase

## Current active phase

**Phase 3 — Machine setup and operating-state-specific known-normal baseline**

## Objective

Commission a locally persisted, operator-confirmed baseline for one Machine ×
Operating-State pair using only the existing real microphone observations and the selected
RMS, peak, dominant-frequency, and dominant-bin features. Preserve source traceability,
manual consistency review, and versioned recalibration without adding scoring.

## Completed implementation evidence

- Machine, operating-state, capture-summary, and baseline-version contracts are implemented
  with validation on persistence reads and writes.
- The seven-screen commissioning flow uses the protected `FlowStack` and keyboard-aware inputs.
- A capture collector subscribes to the existing sensor session; it creates no competing
  microphone or DSP subsystem.
- Two captures are enforced only as the literal structural minimum. Additional captures
  remain possible and the UI makes no scientific-sufficiency claim.
- Exact silence, digital full-scale clipping, degraded/insufficient/stale input,
  non-advancing timing, interruption, or fewer than two advancing observations reject a
  capture with explicit guidance.
- Capture and baseline summaries use medians plus observed min/max for RMS, peak, dominant
  frequency, and dominant bin. Every source summary remains visible for manual review.
- IndexedDB schema version 1 persists feature summaries and context only; raw audio and raw
  time/frequency frames are excluded.
- Activation requires known-normal and manual consistency confirmations. Recalibration
  creates the next version and atomically supersedes the previous active record.
- Browser E2E completed the fixture-driven workflow, verified IndexedDB record counts
  `[1 machine, 1 state, 2 captures, 1 baseline]`, reloaded, and exposed recalibration.
- Live browser layout inspection verified the 390 px machine-setup surface and corrected
  a zero-gutter selector defect. A real microphone request reached the permission prompt,
  but permission did not resolve in this run; no new sensor observation is claimed.
- Browser E2E now exercises commissioning and sensing without horizontal overflow at
  arbitrary 320, 360, 390, 412, and 480 CSS-pixel widths. Pixel/iPhone preview labels are
  viewport presets only; compatibility remains a separate brand-agnostic browser/API matrix.

- The selected Scientific Strip Chart Product Design direction is implemented in the
  protected mobile React/Vite runtime under `app/`.
- Production capture uses `getUserMedia` and Web Audio only after an explicit action.
- Raw frames remain ephemeral and local; no persistence, upload, cached telemetry, or
  generated fallback exists in the production sensing path.
- Lifecycle, permission, interruption, insufficient, degraded, stale, unsupported, and
  processing-failure behavior fail closed and clear interpreted evidence.
- Stop, unmount, late permission resolution, stream end, and `pagehide` release owned
  microphone and audio-processing resources.
- Spec Kit convergence added and closed T039–T042 for degraded quality, explicit
  dominant-bin eligibility, lifecycle summaries, and RMS/peak display.
- The same `001-real-sensor-spike` artifacts now specify exact-zero silent evidence,
  digital full-scale clipping evidence, monotonic capture duration, interval-derived
  update cadence, explicit user guidance, and the primary `Dominant Spectral Peak` label.
- Deterministic unit/component coverage exercises the new quality and timing behavior.
- An interactive local browser run reached real microphone capture and rendered live values.
  The observed run reported a 48,000 Hz audio/track sample rate, 2 channels, transform size
  2,048, and 23.438 Hz/bin. Capture stopped cleanly and live evidence cleared. This is one
  desktop runtime observation, not a compatibility, repeatability, or performance guarantee.
- Product Design comparison evidence is recorded in `docs/design/` and `design-qa.md`.
- The final immutable working-tree security review is sealed at
  `docs/security/review-2026-09-13-final/report.md` with complete source-diff coverage
  and zero reportable findings. The later E2E harness fix is covered by the sealed
  `docs/security/review-2026-09-13-harness-supplement/report.md`, also with complete
  scoped coverage and zero reportable findings.
- The Sites registration manifest is covered by
  `docs/security/review-2026-09-13-deployment-config/report.md`, with complete scoped
  coverage and zero reportable findings.

## Last verified deployment evidence (pre-Phase-3 commit)

| Field | Verified value |
|---|---|
| GitHub application source revision | `06c51e56595abac5919623aba44b60189785a010` |
| Sites source revision | `16a4f12e70b119122a16798e477dcc73ae1cf0b4` |
| URL | <https://resonant.shivam-sot010060.chatgpt.site> |
| Sites version | 2 |
| Deployment | PASS — provider reports `succeeded` |
| Audience | Owner-only custom access |
| Unauthenticated edge | PASS — reachable HTTPS sign-in gate returned `401` |
| Authenticated application and headers | UNKNOWN / NEEDS VERIFICATION — authorized ChatGPT session unavailable |

## Local validation evidence

| Check | Result | Evidence |
|---|---|---|
| Protected mobile runtime | PASS | 28 protected files verified |
| Clean dependency install | PASS | Exact lockfile restored with `npm ci --ignore-scripts` |
| Biome format/lint | PASS | 39 files checked; zero errors and warnings |
| TypeScript typecheck | PASS | `tsc --noEmit` exited successfully |
| Unit/component tests | PASS | 73 tests across 13 files |
| Browser E2E | PASS | 7 commissioning, persistence, lifecycle, fail-closed, cleanup, and arbitrary-width checks |
| Production build | PASS | Vite client plus static hosting worker output generated |
| Hosting worker tests | PASS | 4 route/fallback/packaging checks |
| Production dependency audit | PASS | npm reported 0 vulnerabilities |
| Phase 3 security review | PASS | Parent-agent diff/threat/secret/junk review found no reportable issue; npm reported 0 production vulnerabilities |
| Interactive desktop microphone runtime | PARTIAL | Earlier Phase 2 run reached active local capture; Phase 3 browser run reached the permission prompt but permission did not resolve, so no new physical observation is claimed |
| Real microphone on a physical phone | UNKNOWN / NEEDS VERIFICATION | No authorized physical-device run is available in this environment |
| Physical update rate, long tasks, stop responsiveness | UNKNOWN / NEEDS VERIFICATION | Requires the declared demo phone and live capture |
| External HTTPS deployment | PENDING | The exact Phase 3 commit must exist and be pushed before a matching private version can be saved and verified |
| Unauthenticated HTTPS edge | PASS | Reachable; expected private-access sign-in gate returned `401` |
| Authenticated application health and headers | UNKNOWN / NEEDS VERIFICATION | Requires an authorized ChatGPT browser session |

The browser automation layer supplied interactive inspection while repository Playwright
provided deterministic browser E2E coverage. Named phone controls in the preview are UI
presets only. Neither form of automation replaces the brand-agnostic physical
OS/browser/API compatibility matrix.

The Phase 3 review traced operator input, sensor observations, IndexedDB relationships,
activation, versioning, rendering, and teardown. Raw frames remain memory-only; the only new
persistence sink contains validated metadata and feature summaries. No network, secret,
scoring, or fabricated-data path was added. Changed-tree secret/junk checks,
production-boundary tests, dependency audit, and the threat review remained green. The
Codex Security workbench could not create its durable scan because its Git subprocess
rejected this checkout's Windows ownership and could not resolve `HEAD`; no
workbench-generated report is claimed. The parent-agent evidence is recorded in
`docs/security/review-2026-09-13-phase3/`.

## Remaining inherited physical/manual gates

- T034: measure live performance and cleanup on the declared demo phone.
- T036: deployment is complete; verify the authenticated application response and headers.
- T037: execute every physical trial in the feature quickstart and record observed values.
- Ambient/fan trials and every target phone/browser row remain
  **MANUAL DEVICE VERIFICATION REQUIRED**.
- Low-signal, SNR, instability, acceptable-performance, minimum-duration, repeatability,
  and machine-condition thresholds remain **UNKNOWN / NEEDS CALIBRATION**.

## Explicitly deferred

Baseline similarity/scoring, anomaly detection, scans/trends, IMU, benchmark execution,
Featherless, Sentry, authentication, remote explanation, and broader product features
remain outside Phase 3.

## Phase 3 calibration and manual gates

- Physical same-fan/same-speed capture repeatability: **MANUAL DEVICE VERIFICATION REQUIRED**.
- Physical commissioning/persistence across Android-compatible, iOS WebKit, and other
  browser/API profiles: **MANUAL DEVICE VERIFICATION REQUIRED**. Phone brand is not a
  compatibility criterion.
- Stronger capture-count requirement: **UNKNOWN / NEEDS CALIBRATION**.
- Seconds-based minimum capture duration: **UNKNOWN / NEEDS CALIBRATION**.
- Automatic dominant-peak/spread consistency threshold: **UNKNOWN / NEEDS CALIBRATION**.
- Scientific baseline adequacy and machine-condition interpretation: **UNKNOWN / NEEDS CALIBRATION**.
