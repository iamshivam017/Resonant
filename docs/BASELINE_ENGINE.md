# RESONANT Baseline Engine

## Purpose

Define how an operator commissions, validates, versions, and uses a machine- and operating-state-specific **Known-Normal Reference**.

## Core invariant

A baseline is evidence that a specific machine, in a named operating state, measured with a documented device and placement protocol, produced a repeatable feature distribution during operator-confirmed normal operation. It is not proof of mechanical health.

## Hierarchy

```text
Machine
└── Operating State
    ├── Baseline Session (versioned)
    │   └── Accepted Baseline Measurements
    └── Future Scans compared only with the active compatible baseline
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

The illustrative five captures in the product brief are a UX example, not a statistically proven universal minimum. The minimum count and duration remain **UNKNOWN / NEEDS VERIFICATION** until repeatability experiments on the target device establish a defensible rule.

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
- robust scale based on median absolute deviation (MAD) or an explicitly documented fallback;
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
