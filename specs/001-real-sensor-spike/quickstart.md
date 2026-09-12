# Quickstart Validation: Real Sensor Feasibility Spike

This guide defines how to prove the feature after implementation. It does not claim
that a device/browser passed before the run is performed.

## Prerequisites

- Node.js 20.9 or newer and npm.
- A desktop browser for automated/browser checks.
- A physical smartphone and a browser chosen for the evidence run.
- An HTTPS deployment reachable by that phone. `localhost` validates local development
  but is not evidence for the phone deployment path.
- A quiet-to-loud physical sound source and two physically produced sounds with clearly
  different dominant tones. Do not use generated telemetry.

## Install and validate

Run these commands after the application scaffold exists:

```powershell
npm install
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Expected result: every configured command exits successfully. A successful automated
suite proves deterministic behavior and build integrity; it does not prove physical
microphone compatibility.

## Local browser smoke test

```powershell
npm run dev
```

1. Open the local URL shown by the development server.
2. Confirm the initial surface says the microphone is off and requests no permission.
3. Start sensing and grant permission.
4. Confirm the active indicator, waveform, spectrum, observed sample rate, transform
   size, bin resolution, RMS/peak context, and strongest-bin output appear.
5. Stop sensing and confirm the browser's microphone-use indicator turns off and live
   values are cleared or labeled stale.

## Physical HTTPS evidence run

Record the following in `docs/execution/CURRENT_PHASE.md` or a linked evidence artifact.
Leave any unobserved item as `UNKNOWN / NEEDS VERIFICATION`.

| Evidence | Recorded value |
|---|---|
| Git commit SHA | TODO after run |
| HTTPS URL | TODO after deployment |
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
