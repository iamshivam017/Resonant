# RESONANT Product Requirements

## Product statement

**RESONANT — Listen before it breaks.**

RESONANT is a smartphone-powered machine condition-change monitoring system for operators who do not have permanently installed condition-monitoring equipment. It records a specific machine in an operator-confirmed, known-normal operating state, establishes a machine- and state-specific reference, and identifies later acoustic or vibration measurements that materially deviate from that reference.

RESONANT is a first-line monitoring instrument. It is not a certified diagnostic system, a remaining-useful-life predictor, or a universal machine-health classifier.

## Problem

Small workshops, farms, laboratories, makerspaces, repair facilities, and small manufacturers often operate motors, fans, pumps, compressors, generators, bearings, and other rotating equipment without dedicated instrumentation. Changes in operating sound and vibration can provide evidence that a machine or its operating state has changed, but specialist hardware may be unavailable or uneconomic.

RESONANT tests whether a smartphone can provide a useful, repeatable first-line measurement workflow while keeping claims proportional to the evidence.

## Target users

### Primary users

- Maintenance technicians and repair-shop operators.
- Small workshop and manufacturing operators.
- Engineering and college laboratory users.
- Makerspace operators.
- Farm and small-facility operators responsible for motors, pumps, or fans.

### Explicitly excluded expansion

The MVP does not target enterprise fleet management, regulated safety certification, automated shutdown control, or replacement of a qualified maintenance professional.

## Jobs to be done

- When commissioning a machine, capture repeatable measurements for a specific operating state and preserve them as the **Known-Normal Reference**.
- Before a measurement, determine whether the available phone, permissions, placement, signal, and environment can produce usable evidence.
- During a later scan, compare real measurements only with a compatible machine and operating-state reference.
- After a scan, understand what changed, how strong the evidence is, and whether to monitor, inspect, or retry.
- Across repeated scans, distinguish persistent drift from an isolated noisy measurement.
- For judges and engineers, inspect the real sensing, DSP, scoring, limitations, and benchmark evidence without relying on opaque claims.

## Value proposition

RESONANT turns hardware already in a user's pocket into a transparent, low-cost condition-change instrument. Its differentiator is not universal diagnosis; it is careful commissioning, real sensor evidence, operating-state awareness, explainable deviation, and reproducible evaluation.

## Product terminology

| Preferred term | Meaning | Prohibited implication |
|---|---|---|
| Known-Normal Reference | Multiple operator-confirmed measurements for one machine and operating state | Mechanical certification |
| Baseline Similarity | Similarity to that specific reference | Percentage machine health |
| Deviation evidence | Measured feature changes relative to the reference | A diagnosed fault |
| State change detected | A material signature difference | Mechanical failure |
| Monitor / inspect / investigate | Proportionate next step | Guaranteed diagnosis or failure prediction |

## Core use cases

1. Add a machine and one or more named operating states.
2. Run a sensor and environment quality check.
3. Capture multiple known-normal measurements for one operating state.
4. Validate baseline consistency; refuse commissioning if evidence is insufficient.
5. Run a live scan using real microphone data.
6. Show waveform, spectrum, measured features, and quality status.
7. Compare the scan only with the selected operating-state baseline.
8. Explain similarity/deviation using changed measured features.
9. Review scan history and persistent drift.
10. Reproduce anomaly-method evaluation in a separate Benchmark Lab.

## User stories

- As an operator, I can name a machine and its operating state so that later comparisons are context-compatible.
- As an operator, I must explicitly start microphone capture so there is no hidden recording.
- As an operator, I receive a clear retry instruction instead of a score when measurement quality is inadequate.
- As an operator, I can see that the waveform and spectrum react to the physical machine in real time.
- As an operator, I can see which measured features changed without being told that the machine has a diagnosed fault.
- As an operator, I am warned before comparing incompatible operating states.
- As a judge, I can distinguish the live state-change demonstration from labelled anomaly benchmarking.
- As an engineer, I can reproduce the feature and benchmark pipeline from versioned configuration and source data references.

## Functional requirements

### P0 — demo blocking

- Real microphone permission, capture, explicit active-recording indication, and stop/release behavior.
- Browser and sensor capability detection with actionable unsupported and denied states.
- Live waveform and FFT spectrum derived from the active microphone stream.
- Measured dominant-frequency-bin output and basic acoustic features with units and capture metadata.
- Quality gates for absent signal, digital clipping evidence, interruption, insufficient duration, and unavailable capture. Environmental-noise rules remain unscored until calibrated.
- Machine and operating-state creation.
- Multiple-capture Known-Normal Reference workflow with baseline consistency validation.
- State-compatible scan comparison and explicit mismatch warning.
- Baseline Similarity/deviation result with feature evidence and uncertainty/quality context.
- Local history and trend view using real completed scans.
- Safe failure states; no generated result when prerequisites fail.
- HTTPS deployment and a documented, rehearsed fan state-change demo.
- Methodology and limitations visible to judges.

### P1 — high value

- Progressive accelerometer/gyroscope capture where the browser and device expose reliable readings.
- Sensor-fusion scoring only after modality-specific quality and calibration are validated.
- Reproducible DCASE/MIMII Benchmark Lab with executed metrics.
- Optional Featherless explanation generated only from structured, already-computed evidence.
- More complete historical analytics, event grouping, and export/import.
- Sentry error monitoring after privacy review and configuration.

### P2 — optional

- Accounts and multi-device synchronization.
- Shared machine inventories and team workflows.
- Advanced feature families such as MFCC embeddings or learned models beyond benchmark evidence.
- Notifications, scheduled measurements, fleet views, and integrations.
- Native mobile packaging.

## Non-goals and safety boundaries

- No universal diagnosis, certification, fault classification, or remaining-useful-life prediction.
- No percentage-health claim.
- No arbitrary universal Hz, vibration, similarity, or alert threshold.
- No unsafe fault simulation: do not damage equipment, block blades, loosen parts, or present manual phone shaking as machine vibration.
- A fan speed change demonstrates physical state-change detection, not failure detection.
- No fake/random telemetry, sensor readings, anomaly outcomes, metrics, or API success.
- No automatic action on machinery.

## Non-functional requirements

- **Evidence integrity:** retain provenance for device settings, pipeline version, baseline version, and quality outcome.
- **Reliability:** fail closed for scoring when required evidence is missing or corrupted.
- **Privacy:** explicit sensor activation; local feature processing; no raw-audio upload or persistence by default.
- **Performance:** live charts must remain responsive on the target phone; exact frame and CPU budgets require device measurement.
- **Accessibility:** controls must be keyboard accessible, labeled, high contrast, and not encode status by color alone.
- **Portability:** microphone is the minimum supported modality; IMU absence must not break the core path.
- **Reproducibility:** benchmark inputs, configuration, code revision, random seeds, and produced artifacts must be recorded.
- **Security:** secrets remain server-side; untrusted files and API inputs are bounded and validated.
- **Observability:** failures must be diagnosable without logging raw sensor content or secrets.

## Success criteria

### First sensor spike

- On at least one target smartphone/browser over HTTPS, a user gesture obtains microphone permission and real audio.
- The live waveform visibly responds to sound.
- The spectrum is computed from the captured stream and dominant-bin frequency changes with a controlled physical sound/state change.
- Permission, unsupported, no-signal, interruption, and stop states are explicit.
- No generated or prerecorded telemetry appears as live input.
- Lint, typecheck, automated tests, and production build pass.
- Device/browser/date and observed constraints are recorded.

### P0 submission

- A safe fan demonstration completes baseline → same-state scan → changed-speed scan → restored-state scan without fabricated values.
- Incompatible operating-state comparison is prevented or explicitly blocked.
- Poor-quality measurement produces retry guidance and no similarity score.
- At least one real scan history trend is preserved locally.
- All displayed benchmark values come from a committed reproducible run.
- Required VoltHacks submission materials are ready before the official deadline.

## Known limitations

- Phone microphones, automatic gain control, noise suppression, placement, enclosures, and sampling behavior vary by device/browser.
- Browser IMU availability and permission behavior are inconsistent; it is not P0-critical.
- A baseline represents only the captured machine, state, placement protocol, device, and environment.
- DCASE/MIMII recordings differ materially from smartphone field captures and validate methodology, not field accuracy.
- Local browser storage may be evicted and private-browsing persistence is limited.

## Open questions

- Exact target smartphone model and OS/browser versions.
- Repeatable phone placement fixture or placement protocol.
- Empirically sufficient number and duration of baseline captures.
- Quality thresholds after measurements from the target fan and environment.
- Final deployment provider and HTTPS test URL.
- Whether the participant has active Featherless and Sentry credentials; neither blocks P0 sensing.

## Sources

1. VoltHacks. [Official overview](https://volthacks.devpost.com/). Accessed 2026-09-13.
2. VoltHacks. [Official rules](https://volthacks.devpost.com/rules). Accessed 2026-09-13.
3. MDN Web Docs. [`MediaDevices.getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia). Accessed 2026-09-13.
4. MDN Web Docs. [Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria). Accessed 2026-09-13.
