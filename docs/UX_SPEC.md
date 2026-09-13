# RESONANT UX Specification

## Experience goal

RESONANT must feel like a portable engineering instrument: precise, calm, transparent,
and trustworthy under demo pressure. The interface separates observed sensor evidence
from interpretation and never makes an unavailable measurement look complete.

## Primary users and contexts

- A maintenance technician or machine operator establishing a known-normal reference.
- A small-facility owner comparing later measurements without specialist equipment.
- A hackathon judge evaluating whether sensing, processing, and claims are real.

P0 assumes a single operator, one phone, intermittent connectivity, noisy physical
surroundings, and limited time to position the device and repeat a measurement.

## Information architecture

| Surface | Purpose | Priority |
|---|---|---|
| Live Sensor Spike | Prove permission, real capture, waveform, spectrum, and measured features | First implementation gate |
| Machines | Select or create the machine being observed | P0 |
| Sensor Check | Confirm compatibility, placement, signal, and capture settings | P0 |
| Baseline Calibration | Gather repeated known-normal measurements for one operating state | P0 |
| Live Scan | Capture a comparable later observation | P0 |
| Scan Result | Explain similarity/deviation, evidence, quality, and uncertainty | P0 |
| History | Review observations and persistent drift for one machine/state | P0 |
| Benchmark Lab | Show reproducible labelled-dataset evaluation | P1 |
| Methodology | Explain sensing, DSP, calibration, limitations, and privacy | P1 |
| AI Explanation | Translate deterministic evidence without changing the result | P1 |

Authentication, teams, fleet administration, work orders, alerts, and native mobile
packaging are P2 or later.

## Navigation model

Mobile P0 uses a shallow task sequence rather than a dashboard. The persistent primary
destinations are Machines, Measure, History, and Method. Contextual steps guide the
operator through sensor check, baseline, scan, and result. The current machine and
operating state remain visible whenever a comparison could occur.

Desktop may expose the same destinations in a rail, but must preserve the task order
and terminology. Navigation never implies a score exists before capture quality and
baseline compatibility pass.

## Critical flow: first sensor proof

1. The surface opens with microphone off and no permission prompt.
2. Capability status explains secure-context and microphone readiness.
3. `Start sensing` triggers the permission request.
4. Requesting and initializing states show progress without invented values.
5. Active capture makes microphone use unmistakable and exposes stop control.
6. Waveform and spectrum occupy the primary visual field; measured context and the
   dominant spectral peak and secondary FFT-bin detail support interpretation.
7. Insufficient input suppresses overstated frequency evidence and suggests recovery.
8. Stop, navigation, interruption, or error clears live evidence and releases capture.

## Critical flow: known-normal baseline

1. Select one machine and one explicit operating state.
2. Review placement and environment protocol.
3. Complete sensor check.
4. Capture multiple real measurements; each receives a quality result before inclusion.
5. Review consistency and any rejected measurements.
6. Activate the baseline only when evidence requirements pass; otherwise retry or leave
   the session incomplete.

Exact sample counts and quality thresholds remain `UNKNOWN / NEEDS VERIFICATION` until
repeatability experiments justify them.

## Critical flow: later scan

1. Select the same machine, operating state, placement protocol, and compatible pipeline.
2. Confirm sensor quality and capture a real observation.
3. If compatibility or quality fails, show no condition result.
4. If valid, show deviation/similarity with changed features, uncertainty, and baseline
   context—not percentage machine health or a diagnosis.
5. Save the feature/result record locally and place it in the machine-state timeline.

## State language

| State | Required language | Prohibited behavior |
|---|---|---|
| Ready | “Microphone off — ready to check” | Requesting permission on load |
| Requesting | “Waiting for microphone permission” | Showing live-looking charts |
| Active | “Microphone active” plus visible stop action | Hiding recording state |
| Insufficient | Specific measured limitation and retry guidance | Emitting a score |
| Denied | Permission-specific browser/OS recovery | Generic success or retry loop |
| Unsupported | Exact missing capability/context | Fake fallback telemetry |
| Interrupted | Input ended; measurement unavailable | Leaving frozen values labeled live |
| Result | “Similarity to known-normal baseline” and evidence | “Machine health %” or diagnosis |

## Visual direction

- Dark graphite base with high-contrast neutral text and one restrained status/accent
  family. Red is reserved for errors or verified critical states, not decoration.
- Use strong numeric typography, aligned units, fine grid/rule structure, and meaningful
  density. Prefer flat instrument surfaces and dividers over nested cards or glass panels.
- Waveform and spectrum are functional primary graphics. Every plot needs scale/context,
  current/stale state, and readable fallback content.
- Motion is state-driven: acquisition pulse, live trace, smooth scale change, and explicit
  teardown. Respect reduced-motion preference and never animate fake data.
- Rounded corners, gradients, shadows, badges, and decorative charts are exceptional,
  not defaults.

## Responsive behavior

- Design the sensing flow mobile-first at a narrow portrait viewport with touch targets
  at least 44 by 44 CSS pixels.
- Keep start/stop and recording status visible without covering plots.
- Stack measurement details below the primary plots; do not shrink numerics below a
  readable size to retain desktop density.
- Support landscape and desktop by widening plots and moving evidence into an adjacent
  column, not by adding unrelated dashboard panels.

## Accessibility

- All states and chart insights require textual equivalents; color is never the only cue.
- Keyboard focus order follows the sensing flow and focus remains visible.
- Live updates must avoid overwhelming assistive technology; announce lifecycle/errors,
  not every frame.
- Canvas content requires an accessible summary and respects contrast and reduced motion.
- Permission and error guidance uses direct language without blame.

## Design gate for the first spike

Product Design generated three independent mobile live-instrument concepts. The user
selected **Option 3 — Scientific Strip Chart** on 2026-09-13. The immutable visual
reference is `docs/design/scientific-strip-chart-reference.png`.

The selected direction uses an edge-to-edge graphite instrument surface, near-white
high-tracking headings, restrained electric-blue live traces, and one signal-yellow
capture/action color. Waveform and spectrum dominate the vertical rhythm; the strongest
observed bin is the primary numeric readout; sample rate and bin resolution form a compact
secondary column. Fine rules and a subtle grid replace cards, shadows, and decorative chrome.

Implementation may adapt only where product truth requires it: initial/denied/stopped
states use real lifecycle copy, no waveform is drawn before live input exists, and the
concept-preview disclaimer is removed from the running product. The mobile Product Design
runtime owns its device frame/status chrome; app-owned content must match the reference.

## Design QA evidence

The active, idle, and permission-denied surfaces were captured at an unscaled 393 × 852
CSS viewport and compared with the selected source. The final combined comparison is
`docs/design/qa-comparison.png`; the detailed audit is `design-qa.md` and records
`final result: passed`. The active screenshot uses a deterministic test-only browser
adapter strictly for layout QA and is not presented as physical sensor evidence.

The implementation intentionally derives displayed sampling context from the active
browser graph, suppresses spectrum/dominant-peak output for insufficient frames, and
omits the source image's concept-preview disclaimer. The plot hierarchy, quality rail,
yellow capture state, blue trace, measurement band, and error treatment match the
selected direction without adding calibrated quality thresholds.

## TODO

- Test the first implementation at 390 × 844, landscape phone, and desktop widths.
- Run accessibility and physical-use checks while the microphone is active.

## UNKNOWN / NEEDS VERIFICATION

- Target phone sizes, one-handed use constraints, and sunlight/industrial-light visibility.
- Whether gloves, hearing protection, or mounting fixtures change interaction requirements.
- Final plot scales and update rates on the actual demo device.
