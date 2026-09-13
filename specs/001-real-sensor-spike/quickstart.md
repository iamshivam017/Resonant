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
| Git commit SHA | `85dc747ad793cbf03c97d53099f666efef3cbcd4` |
| HTTPS URL | <https://resonant.shivam-sot010060.chatgpt.site> (private; deployment succeeded) |
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

| Device / browser | Microphone | Waveform | Spectrum | Quality/timing | Overall result |
|---|---|---|---|---|---|
| Desktop Chromium (automated fixtures only) | MANUAL DEVICE VERIFICATION REQUIRED | Automated rendering PASS; real input unverified | Automated rendering PASS; real input unverified | Deterministic tests only | MANUAL DEVICE VERIFICATION REQUIRED |
| Desktop browser with real microphone | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED |
| Android Chrome | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED |
| iOS Safari | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED | MANUAL DEVICE VERIFICATION REQUIRED |

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
