# RESONANT Baseline Engine

## Purpose

Define how an operator commissions, validates, versions, and uses a machine- and operating-state-specific **Known-Normal Reference**.

## Core invariant

A baseline is evidence that a specific machine, in a named operating state, measured with a documented device and placement protocol, produced a repeatable feature distribution during operator-confirmed normal operation. It is not proof of mechanical health.

## Hierarchy

## Phase 3 implemented boundary

Phase 3 uses a structural minimum of two accepted captures. Two is only the smallest
literal multiple, not evidence of scientific adequacy; the operator may add more.
Stronger count, seconds-based duration, and automatic consistency rules remain
**UNKNOWN / NEEDS CALIBRATION**.

Each capture requires at least two advancing valid observations and positive observed
duration. Exact silence, digital full-scale clipping, degraded/insufficient/stale input,
non-advancing timing, and interruption reject it. Stored capture summaries contain
median RMS, peak, dominant frequency, dominant bin, duration, observation count, and
capture context—never raw frames or audio.

The baseline uses median plus observed minimum/maximum for all four features and retains
every source summary. Dominant-peak/bin movement stays visible for explicit manual review;
no automatic consistency tolerance is inferred.

```text
Machine
└── Operating State
    ├── Baseline Session (versioned)
    │   └── Accepted Baseline Measurements
    └── Scan evidence compared only with the active compatible baseline
```

## Commissioning workflow

1. Identify the machine and operating state.
2. Confirm the operator believes the state is normal and safe to measure.
3. Record device, environment, and placement protocol.
4. Run the sensor-quality workflow.
5. Capture multiple independent measurement windows, repositioning only according to the protocol.
6. Reject individual captures that fail quality checks.
7. Inspect between-capture feature consistency.
8. Activate the reference only when the configured evidence criteria pass.
9. Store the baseline summary, accepted measurement references, configuration, and pipeline version.

The illustrative five captures in the product brief are a UX example, not a statistically proven universal minimum. Two is only the structural minimum needed to implement multiple captures; any stronger minimum and a duration requirement remain **UNKNOWN / NEEDS CALIBRATION** until repeatability experiments establish defensible rules.

## Compatibility key

A scan is compatible only when all required keys match:

- `machineId`;
- `operatingStateId`;
- feature schema and DSP pipeline version;
- required modality set;
- calibration/device policy selected for the MVP.

Placement protocol and device identity may be hard compatibility keys or prominent warnings depending on repeatability evidence. The decision is deferred until real-device experiments.

## Baseline representation

For each selected feature \(j\), store:

- robust center \(m_j = \operatorname{median}(x_{1j}, \ldots, x_{nj})\);
- a future robust scale based on median absolute deviation (MAD) or an explicitly documented fallback, deferred until repeatability evidence justifies scoring;
- observed minimum/maximum for diagnostic display, not as automatic universal bounds;
- capture-level feature values for audit and leave-one-out calibration;
- correlation/covariance only when sample count is sufficient for a stable estimate.

MAD is less influenced by tails than standard deviation, making it a reasonable starting estimator for small, potentially contaminated commissioning sets.^1 Zero-scale features are removed or handled by an evidence-backed floor; they are never divided by an invented epsilon and presented as valid.

## Consistency validation

- Each baseline capture must pass sensor quality independently.
- Leave-one-capture-out distances are computed against the remaining captures.
- A capture with unexplained large deviation is flagged for review/retry rather than silently accepted.
- The engine checks whether too many features have zero/unstable scale.
- It reports resolution limits when the calibration set is too small for requested confidence/status labels.

No baseline activates merely because a progress counter reached a fixed number.

## Lifecycle

- `draft`: metadata exists, no accepted evidence.
- `collecting`: valid captures are accumulating.
- `validating`: consistency and sufficiency checks run.
- `active`: available for compatible scans.
- `insufficient-evidence` / `inconsistent`: no scoring allowed.
- `superseded`: retained for history but not selected by default.
- `abandoned`: incomplete session retained only if useful for audit, otherwise deletable.

A change in machine operating state, physical configuration, placement protocol, sensor device policy, or incompatible feature schema starts a new baseline version.

## Storage policy

Persist feature vectors, quality summaries, metadata, and baseline statistics locally. Do not persist raw audio by default. If export is added, make it explicit, user-initiated, provenance-labeled, and privacy-reviewed.

Implemented persistence uses additive IndexedDB schema version 2. The original machine,
state, capture, and baseline stores remain unchanged; version 2 adds `scans`. Recalibration
appends a new version and retains the former active record as `superseded`.

## Phase 4 comparison use

A current scan resolves one exact active Machine × Operating-State baseline and records
that baseline's immutable ID and version. A missing, mismatched, superseded, invalid-quality,
or non-finite input blocks comparison. Historic scan records may continue to reference a
baseline version that was active when they were created.

The stored scan contains current four-feature summaries, capture context, and transparent
native-unit deviations only. It contains no raw audio or signal arrays. A two-capture
reference is labeled `LIMITED REFERENCE DATA`; larger counts are shown without claiming
adequacy. Scientific baseline sufficiency remains `UNKNOWN / NEEDS CALIBRATION`.

## Acceptance criteria

- A baseline cannot mix machines or operating states.
- Invalid-quality captures cannot become baseline evidence.
- Activation criteria and pipeline version are stored with the reference.
- An incompatible scan is blocked with an explicit message.
- Recalibration creates a new version and preserves traceability.
- Baseline UI and stored fields never represent certification or percentage health.

## UNKNOWN / NEEDS VERIFICATION

- Minimum accepted captures and capture duration.
- Placement/device compatibility policy.
- Repeatability and stability thresholds.
- Scale fallback for near-constant features.
- Whether environmental reference captures add enough value for P0.

## Sources

1. NIST/SEMATECH. [Measures of Scale](https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm). Accessed 2026-09-13.
