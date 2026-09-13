# RESONANT Current Phase

## Current active phase

**Phase 4 — Transparent baseline deviation evidence (complete)**

## Implemented objective

Capture one current real-microphone feature summary and compare it only with the exact
active Machine × Operating-State baseline. Present and persist transparent native-unit
evidence without a composite score, normalization, condition classification, or raw audio.

## Verified implementation evidence

- `app/src/features/scan/` reuses the existing capture-session controller and collector
  quality rules; it creates no second sensor or DSP path.
- RMS, peak, dominant frequency, and dominant bin each expose reference median/min/max,
  current value, signed and absolute difference, and `below`/`inside`/`above` position.
- Missing, mismatched, superseded, invalid-quality, inconsistent, and non-finite evidence
  fails closed.
- Every saved scan retains machine ID, operating-state ID, exact baseline ID/version,
  timestamp, four-feature summary, deviations, quality, and capture context.
- IndexedDB schema version 2 additively creates `scans` and preserves the Phase 3 stores.
- Persistence reconstructs an allowlisted result; raw audio and raw signal arrays are absent.
- Two-capture references display `LIMITED REFERENCE DATA`. Composite similarity displays
  `Not calculated` and `UNKNOWN / NEEDS CALIBRATION`.
- Result copy makes no health, fault, diagnosis, severity, probability, or remaining-life claim.
- Responsive layout remains brand-agnostic; phone names in the preview are viewport presets only.

## Current validation evidence

| Check | Current result |
|---|---|
| Full unit/component suite | PASS — 90 tests across 18 files |
| TypeScript targeted checkpoint | PASS |
| Browser E2E checkpoint | PASS — 8 tests, including v1→v2 migration and commission → reload → compare → persist |
| IndexedDB v1→v2 behavior | PASS in browser fixture; existing records preserved and `scans` added |
| Raw-frame exclusion | PASS in unit and browser persistence checks |
| Full final format/lint/type/test/build pipeline | PASS |
| Security diff review | PASS — no reportable finding; workbench unavailable, documented terminal fallback used |

## Physical evidence status

No new physical machine or phone experiment was performed in this Phase 4 implementation
run. Automated Web Audio fixtures prove deterministic software behavior only.

- Same machine/state repeatability: **MANUAL DEVICE VERIFICATION REQUIRED**.
- Ambient/fan comparison worksheet: **MANUAL DEVICE VERIFICATION REQUIRED**.
- Brand-agnostic phone/browser/API compatibility rows: **MANUAL DEVICE VERIFICATION REQUIRED**.
- Capture-count adequacy, duration, low signal, SNR, instability, performance, and machine
  interpretation thresholds: **UNKNOWN / NEEDS CALIBRATION**.
- Composite normalization, weights, uncertainty, and status thresholds:
  **UNKNOWN / NEEDS CALIBRATION**.

## Explicitly deferred

Composite similarity, baseline adequacy automation, condition scoring, anomaly detection,
trend/history UI, IMU, Featherless, Sentry, benchmark execution, and broader product
expansion remain outside Phase 4.
