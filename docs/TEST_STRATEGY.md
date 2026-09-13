# RESONANT Test Strategy

## Quality objective

Demonstrate that deterministic behavior is correct, real sensor paths fail honestly, and
physical acceptance evidence is never replaced by mocks. Validation is proportional to
risk and every reported pass must cite a command, artifact, CI run, or observed device run.

## Test layers

| Layer | Scope | Typical evidence |
|---|---|---|
| Static | Formatting, lint, types, configuration, forbidden imports/secret exposure | Successful commands and concise logs |
| Unit | Pure DSP math, state reducers, quality and compatibility rules | Deterministic fixtures clearly labeled as tests |
| Component | Permission/capture states, accessible controls, stale-data clearing, chart summaries | DOM interaction tests |
| Contract | Runtime entity schemas, feature versions, local storage, provider payload limits | Schema/contract tests |
| Integration | Capture lifecycle with browser adapters; persistence/migration; scoring flow | Controlled adapters plus boundary assertions |
| Browser E2E | Critical navigation, denial/unsupported paths, cleanup, responsive/accessibility smoke | Browser-run report/screenshots |
| Physical device | Real microphone/IMU permission, capture, signal response, performance, teardown | Device/browser evidence worksheet |
| Benchmark | Dataset provenance, preprocessing, splits, metrics, reproducibility | Run manifest, checksums, versioned results |
| Deployment | HTTPS, headers, environment, critical route health, device reachability | Live URL checks and exact commit/deploy ID |

Synthetic signals are allowed only as named test fixtures for mathematical expectations.
They are prohibited from production/demo telemetry and cannot prove device compatibility.

## Test-first workflow

1. Write one focused test for the next behavior.
2. Run it and confirm failure for the intended missing/incorrect behavior.
3. Implement the smallest passing change.
4. Re-run the focused test, then affected suites.
5. Refactor only while tests remain green.
6. Record evidence at feature and final checkpoints.

Tests written after implementation do not satisfy the project's red-green requirement
unless the production change is reverted and the failure is observed.

## First sensor spike matrix

### Automated

- Capability check does not request permission.
- Explicit start creates at most one session.
- Browser error categories map to distinct safe states.
- Stop/unmount/interruption releases every owned resource and invalidates old frames.
- RMS, peak, bin resolution, and dominant-bin calculations pass known mathematical fixtures.
- Non-finite, empty, exact-zero silent, digital full-scale clipping, and stale frames do
  not produce valid frequency evidence.
- Monotonic capture duration and positive-interval update cadence are derived without an
  invented acceptability threshold; non-advancing timestamps produce no cadence value.
- Component text and controls match ready/requesting/active/stopped/error states.
- Responsive surface retains accessible actions and text summaries.
- Production build contains no fake telemetry path or secret value.

### Physical

- Permission outcome on each declared device/browser.
- Actual track and audio-context settings.
- Quiet → louder → quiet waveform response.
- Spectrum and dominant-spectral-peak change for two physically produced sounds.
- Stable/repeatable direction across documented trials.
- Stop and navigation release the microphone.
- At least one real failure/recovery path.
- HTTPS deployment path, not only desktop localhost.

Physical results remain `UNKNOWN / NEEDS VERIFICATION` until observed.

The repository's Chromium run uses controlled browser fixtures for deterministic lifecycle
coverage. It is not physical-device evidence. A separate interactive desktop browser run
may establish that the real runtime reaches capture and renders observed microphone values,
but it does not establish target phone/browser compatibility or repeatability.

## Baseline and scoring tests

- Reject too few, incompatible, corrupted, non-finite, or poor-quality measurements.
- Keep baselines scoped to machine, operating state, sensor context, and pipeline version.
- Verify medians, robust scales, zero-scale handling, distances, calibration transforms,
  uncertainty, and evidence ranking against hand-checkable fixtures.
- Metamorphic checks: duplicated samples do not change medians; uniform gain affects only
  features expected to be gain-sensitive; incompatible version/state never scores.
- No status threshold passes merely because a default constant exists; calibration
  evidence is required.

## Persistence and migration tests

Phase 3 coverage includes entity normalization, ownership validation, invalid-capture
rejection, scalar median/range aggregation, source traceability, repository reload,
version supersession, browser IndexedDB counts, and recalibration entry. Fixture-driven
browser results prove mechanics only; physical repeatability remains
**MANUAL DEVICE VERIFICATION REQUIRED**.

Responsive E2E runs commissioning and live sensing at 320, 360, 390, 412, and 480
CSS-pixel widths and asserts no horizontal overflow. Named Pixel/iPhone development
presets are not compatibility fixtures. Real compatibility is recorded separately by
OS/browser/version, secure context, and observed MediaDevices/Web Audio/Canvas/IndexedDB
behavior.

- Schema validation on every read/write boundary.
- Upgrade from each supported schema version with preserved records.
- Interrupted transaction/quota/storage eviction handling.
- Delete/export behavior and corrupt-record quarantine.
- Previously applied migrations remain immutable; changes are additive when practical.

## Benchmark tests

- Manifest URL, license, archive checksum, machine ID, section/domain, and labels validated.
- Safe extraction rejects path traversal, unexpected file counts/types, and excessive size.
- Train/validation/test boundaries avoid label leakage.
- Browser/Python feature parity on an approved fixture before connecting benchmark claims.
- AUC and pAUC calculations verified on a small labelled fixture.
- Same revision/config/seed/input checksum reproduces metrics within documented tolerance.
- Missing data or failed run produces no result artifact presented as complete.

## Security, privacy, and resilience tests

- Raw sensor buffers absent from persistence, provider payloads, logs, and telemetry.
- Provider key absent from source and browser build output.
- Explanation payload limits, timeouts, rate-limit behavior, and provider failure are safe.
- Offline mode preserves deterministic sensing/results and labels unavailable remote features.
- Corrupt storage, missing benchmark files, denied permissions, noisy/insufficient signal,
  backend outage, and deployment misconfiguration are exercised.
- Headers and Permissions Policy inspected on the actual deployed URL.

## Accessibility and performance

- Automated accessibility scan plus keyboard/focus and screen-reader state-announcement review.
- Color-independent statuses, contrast, reduced motion, and accessible Canvas summaries.
- Measure visualization update rate, long tasks, memory/resource cleanup, and stop-control
  responsiveness on the declared demo phone. Targets are requirements; results must be observed.

## Validation cadence

- **Routine change**: focused unit/component check plus syntax/type sanity.
- **High-impact small change**: targeted security, contract, schema, dependency, build, or
  environment checks regardless of diff size.
- **Feature checkpoint**: affected lint, types, tests, build, integration, and physical
  checks where the feature depends on a device.
- **Final checkpoint**: clean install, format, lint, types, all unit/integration/E2E tests,
  production build, schema/migration validation, deployment/critical flow, accessibility,
  security/secret/junk audit, and exact remote SHA verification.

## Failure reporting

Report `PASS`, `FAIL`, or `UNVERIFIED`. Include only concise successful summaries. For a
failure, retain the smallest relevant log and distinguish current-work defects from
verified pre-existing failures. Never reinterpret an unavailable physical test as pass.

## TODO

- Define calibrated tolerances only from measured device trials.
- Add CI only when repository policy and useful remote execution are available.

## UNKNOWN / NEEDS VERIFICATION

- Available physical devices, browser versions, machine/fan, mounting fixture, and test environment.
- Final deployment provider and whether CI/device automation is available before submission.
- Empirical performance, signal-quality, repeatability, and scoring tolerances.
