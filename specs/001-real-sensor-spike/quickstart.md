# Quickstart Validation: Real Sensor Feasibility Spike

This guide defines how to prove the feature after implementation. It does not claim
that a device/browser passed before the run is performed.

## Prerequisites

- Node.js 24 or newer and npm 10.
- A desktop browser for automated/browser checks.
- A physical smartphone and a browser chosen for the evidence run.
- An HTTPS deployment reachable by that phone. `localhost` validates local development
  but is not evidence for the phone deployment path.
- A quiet-to-loud physical sound source and two physically produced sounds with clearly
  different dominant tones. Do not use generated telemetry.

## Install and validate

Run these commands after the application scaffold exists:

```powershell
Set-Location app
npm install
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run check:runtime
npm run test:e2e
npm run build
```

Expected result: every configured command exits successfully. A successful automated
suite proves deterministic behavior and build integrity; it does not prove physical
microphone compatibility.

## Local browser smoke test

```powershell
Set-Location app
npm run dev
```

1. Open the local URL shown by the development server.
2. Confirm the initial surface says the microphone is off and requests no permission.
3. Start sensing and grant permission.
4. Confirm the active indicator, waveform, spectrum, observed sample rate, transform
   size, bin resolution, RMS/peak context, and `Dominant Spectral Peak` output appear.
5. Stop sensing and confirm the browser's microphone-use indicator turns off and live
   values are cleared or labeled stale.

## Physical HTTPS evidence run

Record the following in `docs/execution/CURRENT_PHASE.md` or a linked evidence artifact.
Leave any unobserved item as `UNKNOWN / NEEDS VERIFICATION`.

| Evidence | Recorded value |
|---|---|
| Git application commit SHA | `06c51e56595abac5919623aba44b60189785a010` |
| HTTPS URL | <https://resonant.shivam-sot010060.chatgpt.site> (private Sites version 2; deployment succeeded) |
| Device and OS | UNKNOWN / NEEDS VERIFICATION |
| Browser and version | UNKNOWN / NEEDS VERIFICATION |
| Permission outcome | UNKNOWN / NEEDS VERIFICATION |
| Effective track settings | UNKNOWN / NEEDS VERIFICATION |
| Audio-context sample rate | UNKNOWN / NEEDS VERIFICATION |
| Quiet → louder → quiet waveform response | UNKNOWN / NEEDS VERIFICATION |
| First physical sound dominant-bin observation | UNKNOWN / NEEDS VERIFICATION |
| Second physical sound dominant-bin observation | UNKNOWN / NEEDS VERIFICATION |
| Repeated-trial direction consistent | UNKNOWN / NEEDS VERIFICATION |
| Stop releases microphone | UNKNOWN / NEEDS VERIFICATION |
| Exercised failure state and recovery | UNKNOWN / NEEDS VERIFICATION |
| Observed limitations | UNKNOWN / NEEDS VERIFICATION |

## Device and browser compatibility matrix

Record only an observed run. Automated fixtures do not establish microphone compatibility.
The preview's named Pixel/iPhone controls are viewport/chrome presets only; they are not a
supported-device list. Record the actual OS, browser/version, secure context, and observed
MediaDevices/Web Audio/IndexedDB behavior. Determine compatibility from those capabilities,
not the handset brand.

| OS / browser / API profile | Microphone | Waveform | Spectrum | Local persistence | Overall result |
|---|---|---|---|---|---|
| Desktop Chromium; automated fixture APIs | MANUAL DEVICE VERIFICATION REQUIRED | Automated rendering PASS; real input unverified | Automated rendering PASS; real input unverified | Automated IndexedDB PASS | MANUAL DEVICE VERIFICATION REQUIRED |
| Desktop in-app Chromium; version unavailable; localhost; real MediaDevices/Web Audio | PASS — explicit permission/start produced a live track | PASS — real frame rendered | PASS — real spectrum rendered | MANUAL DEVICE VERIFICATION REQUIRED | LOCAL RUNTIME PASS — not physical-phone or deployed-HTTPS evidence |
| Android-compatible browser with secure-context MediaDevices, Web Audio, Canvas, and IndexedDB | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED |
| iOS WebKit browser with secure-context MediaDevices, Web Audio, Canvas, and IndexedDB | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED |
| Other mobile OS/browser with the required APIs | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED |

## Ambient and fan experiment worksheet

Use the same safe fan, phone, browser, placement protocol, and approximate measurement
duration for Tests B and C. Test D changes only the fan's normal operating speed. Never
obstruct blades, damage equipment, or label the change as a fault.

### Run context

| Field | Recorded value |
|---|---|
| Date/time | MANUAL DEVICE VERIFICATION REQUIRED |
| Git commit and deployment version | MANUAL DEVICE VERIFICATION REQUIRED |
| Device / OS | MANUAL DEVICE VERIFICATION REQUIRED |
| Browser / version | MANUAL DEVICE VERIFICATION REQUIRED |
| Phone placement and distance | MANUAL DEVICE VERIFICATION REQUIRED |
| Audio-context sample rate | MANUAL DEVICE VERIFICATION REQUIRED |
| Reported track sample rate / channels | MANUAL DEVICE VERIFICATION REQUIRED |
| FFT size / bin resolution | MANUAL DEVICE VERIFICATION REQUIRED |
| Observed update cadence | MANUAL DEVICE VERIFICATION REQUIRED |

### Measurements

| Test | Physical state | RMS | Peak amplitude | Dominant spectral peak | Quality | Observation |
|---|---|---|---|---|---|---|
| A — Ambient | Ordinary room/background | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | Confirm pipeline activity only |
| B — Fan speed 1 | Safe fixed operating speed | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | No fault claim |
| C — Same fan / same speed | Repeat of Test B | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | Compare direction and variability; identical values are not expected |
| D — Operating state change | Same fan at another normal speed | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | Label only `OPERATING STATE CHANGE` |

### Quality and performance observations

| Evidence | Recorded value |
|---|---|
| Exact no-input/silent state exercised | MANUAL DEVICE VERIFICATION REQUIRED |
| Digital full-scale clipping state exercised safely | MANUAL DEVICE VERIFICATION REQUIRED |
| Low-signal threshold | UNKNOWN / NEEDS CALIBRATION |
| Signal-to-noise threshold | UNKNOWN / NEEDS CALIBRATION |
| Instability threshold | UNKNOWN / NEEDS CALIBRATION |
| Acceptable cadence/responsiveness threshold | UNKNOWN / NEEDS CALIBRATION |
| Stop releases microphone indicator | MANUAL DEVICE VERIFICATION REQUIRED |
| Memory growth / long-task observations | MANUAL DEVICE VERIFICATION REQUIRED |

## Failure-path checks

- Deny permission and confirm no live feature is presented.
- Test an insecure or unsupported context only when safe and confirm the limitation is
  identified; never weaken production security to manufacture the test.
- End or remove the selected input when the browser/device permits and confirm old data
  becomes unavailable.
- Use an insufficient physical signal and confirm the interface does not overstate the
  strongest-frequency observation.
- Reload or navigate away during capture and confirm the microphone is released.

## Exit decision

The spike passes only when the automated checks, production build, and every required
physical acceptance observation have current evidence. Otherwise record `FAIL` or
`UNKNOWN / NEEDS VERIFICATION`, diagnose the specific gap, and do not expand into
baseline or condition-scoring implementation.

## Phase 3 Known-Normal Baseline Verification

1. Create one machine and one named normal operating state.
2. Confirm the machine is currently in that state and acknowledge that this is an
   operator statement, not a certified health assessment.
3. Keep the phone in one documented position and run the sensor check.
4. Collect at least two operator-ended captures; add further captures when practical.
5. Confirm rejected captures do not enter the source list.
6. Review every source RMS, peak, dominant frequency/bin, duration, and capture context.
7. Compare the visible dominant-peak/bin range manually. Do not infer a pass from an
   uncalibrated tolerance.
8. Confirm manual consistency review and create the baseline.
9. Reload and verify the same machine/state/version returns without raw signal data.
10. Recalibrate and verify a new version appears while the prior version remains superseded.

### Physical repeatability evidence

| Field | Recorded value |
|---|---|
| Git commit / deployment | MANUAL DEVICE VERIFICATION REQUIRED |
| Machine / operating state | MANUAL DEVICE VERIFICATION REQUIRED |
| Device / OS / browser | MANUAL DEVICE VERIFICATION REQUIRED |
| Placement and distance | MANUAL DEVICE VERIFICATION REQUIRED |
| Accepted capture count | MANUAL DEVICE VERIFICATION REQUIRED |
| Rejected capture count and reasons | MANUAL DEVICE VERIFICATION REQUIRED |
| Capture durations | MANUAL DEVICE VERIFICATION REQUIRED |
| Source RMS values | MANUAL DEVICE VERIFICATION REQUIRED |
| Source peak values | MANUAL DEVICE VERIFICATION REQUIRED |
| Source dominant frequencies / bins | MANUAL DEVICE VERIFICATION REQUIRED |
| Observed min/max movement | MANUAL DEVICE VERIFICATION REQUIRED |
| Operator manual consistency decision | MANUAL DEVICE VERIFICATION REQUIRED |
| Stronger minimum capture requirement | UNKNOWN / NEEDS CALIBRATION |
| Minimum duration threshold | UNKNOWN / NEEDS CALIBRATION |
| Automatic repeatability/consistency threshold | UNKNOWN / NEEDS CALIBRATION |

Automated fixtures validate contracts only. They MUST NOT be copied into this table or
reported as physical repeatability evidence.
