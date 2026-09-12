# RESONANT Current Phase

## Current active phase

**Phase 1 — Real microphone spike awaiting physical HTTPS evidence**

## Objective

Prove the smallest trustworthy microphone-first sensing loop: explicit permission,
real live capture, waveform and spectrum evidence, dominant-bin/RMS/peak observations,
observed capture settings, honest quality states, and complete resource teardown.

## Completed implementation evidence

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
- Product Design comparison evidence is recorded in `docs/design/` and `design-qa.md`.
- The final immutable working-tree security review is sealed at
  `docs/security/review-2026-09-13-final/report.md` with complete source-diff coverage
  and zero reportable findings.

## Local validation evidence

| Check | Result | Evidence |
|---|---|---|
| Protected mobile runtime | PASS | 28 protected files verified |
| Biome format/lint | PASS | 26 files checked, no fixes required |
| TypeScript typecheck | PASS | `tsc --noEmit` exited successfully |
| Unit/component tests | PASS | 44 tests across 8 files |
| Browser E2E | PASS | 6 lifecycle, fail-closed, cleanup, and responsive checks |
| Production build | PASS | Vite client plus static hosting worker output generated |
| Hosting worker tests | PASS | 4 route/fallback/packaging checks |
| Production dependency audit | PASS | npm reported 0 vulnerabilities |
| Real microphone on a physical phone | UNKNOWN / NEEDS VERIFICATION | No authorized physical-device run is available in this environment |
| Physical update rate, long tasks, stop responsiveness | UNKNOWN / NEEDS VERIFICATION | Requires the declared demo phone and live capture |
| External HTTPS deployment and headers | UNKNOWN / NEEDS VERIFICATION | No deployment target/provider authorization has been supplied |

## Remaining Phase 1 gates

- T034: measure live performance and cleanup on the declared demo phone.
- T036: deploy the exact tested commit over HTTPS and verify reachability and headers.
- T037: execute every physical trial in the feature quickstart and record observed values.
- T038: complete the final diff/security/secret/junk audit, commit, push, and verify the
  exact local/remote SHA.

## Explicitly deferred

Baseline/scoring, persistence/history, IMU, benchmark execution, Featherless, Sentry,
authentication, machine inventory, remote explanation, and broader product features
remain outside this feasibility spike.
