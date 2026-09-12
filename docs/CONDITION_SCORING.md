# RESONANT Condition Scoring

## Purpose and claim boundary

Define a transparent proposal for comparing a valid scan with its compatible Known-Normal Reference. The output is baseline-relative evidence. It is never percentage machine health, fault diagnosis, remaining life, or a universal threshold.

## Inputs and preconditions

Scoring receives:

- one valid scan feature vector \(x\);
- one active compatible baseline \(B\);
- modality-quality results;
- an exact feature schema and scoring configuration version.

If quality, compatibility, or calibration sufficiency fails, scoring returns a typed refusal and no similarity number.

## Phase A: feature normalization

For feature \(j\), compute baseline median \(m_j\) and robust scale \(s_j\). The standardized deviation is:

\[
z_j = \frac{x_j - m_j}{s_j}
\]

MAD is the initial scale candidate because it is less influenced by tails than standard deviation.^1 The normal-consistency multiplier, scale floor/fallback, feature transform (for example log energy), and handling of zero-scale features must be versioned and verified. A feature without a defensible non-zero scale is excluded with an explanation.

## Phase B: raw deviation

For the initial interpretable engine, aggregate selected feature deviations with a weighted root-mean-square distance:

\[
D(x, B) = \sqrt{\frac{\sum_j w_j z_j^2}{\sum_j w_j}}
\]

This is a diagonal distance: it avoids estimating a full covariance matrix from too few baseline captures. A regularized Mahalanobis or learned novelty detector is a benchmark candidate only when sample count and validation support it; covariance-based distances are sensitive to estimation quality and outliers.^2

Weights are not tuned to make a demo look good. Initial equal weights may be used only in a clearly labelled research run. Production weights require repeatability/ablation evidence and a versioned decision.

## Phase C: modality combination

Compute acoustic and motion distances separately. Combine modalities only if both have valid, calibrated quality:

\[
D_{combined} = \frac{q_a w_a D_a + q_m w_m D_m}{q_a w_a + q_m w_m}
\]

where \(q\) is a validated quality/reliability factor and \(w\) is a calibrated modality weight. Until those values are validated, the system uses acoustic distance and displays motion separately. Missing IMU never receives a fabricated neutral value.

## Phase D: calibrated similarity representation

Split operator-confirmed normal captures by session/time into a reference set and a calibration set. Compute calibration distances \(D_1,\ldots,D_n\). For a new distance \(d\), an empirical baseline-consistency value can be represented as:

\[
S(d) = 100 \times \frac{1 + \sum_{i=1}^{n} \mathbf{1}[D_i \ge d]}{n + 1}
\]

This score means: how the current deviation ranks against held-out known-normal deviations under the same protocol. Higher is more similar to the captured reference. It does not estimate mechanical health. Its resolution is limited by \(n\), so small calibration sets must display low resolution/uncertainty and may omit the 0–100 presentation entirely.

Alternative monotonic mappings may be evaluated, but the mapping and rationale must be documented before UI use. Never hand-pick a mapping around a desired demo number.

## Status calibration

Labels such as `WITHIN REFERENCE`, `MILD DEVIATION`, and `SIGNIFICANT DEVIATION` require thresholds selected before final evaluation from:

1. held-out same-state known-normal captures and a declared false-alert objective;
2. controlled, safe operating-state changes for sensitivity—not fault claims;
3. labelled benchmark data for anomaly-method evidence;
4. target-device repeatability tests.

Thresholds are stored per scoring version and, where necessary, per machine/operating state. If there is insufficient evidence, show the raw deviation and `CALIBRATION INSUFFICIENT` rather than a categorical status.

## Evidence generation

Rank feature contributions \(c_j = w_j z_j^2\) and show the largest stable contributors with direction and units, for example:

- `Digital RMS increased relative to this baseline`;
- `Spectral centroid shifted upward`;
- `Energy distribution changed in configured band B2`.

Do not say `bearing fault`, `imbalance`, or another fault class unless a separate validated classifier supports that exact claim.

## Trend methodology

- Preserve every valid scan's raw deviation and calibration version.
- Display time order and baseline revisions.
- A persistent-drift event requires multiple consecutive or windowed deviations under one documented rule.
- The persistence rule is calibrated from normal repeat scans; it is **UNKNOWN / NEEDS VERIFICATION** until data exists.
- A single noisy scan can be flagged for retry or observation but must not be called deterioration.

## Evaluation plan

Compare candidate scoring variants using:

- within-state repeatability and false-alert rate;
- separation between safe known operating states;
- robustness to placement and environmental-noise sessions;
- DCASE/MIMII AUC and pAUC when applied to that benchmark;
- ablation by feature family;
- runtime/latency on target phone.

Select the simplest method meeting declared criteria. Do not ship a more complex detector solely because it yields one better unreplicated run.

## UNKNOWN / NEEDS VERIFICATION

- Final feature transforms, selected features, and weights.
- Baseline/calibration split and minimum sample count.
- Similarity mapping and whether the 0–100 score is statistically useful at MVP sample sizes.
- Status and persistence thresholds.
- Sensor-fusion quality and weights.
- Cross-device comparability.

## Sources

1. NIST/SEMATECH. [Measures of Scale](https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm). Accessed 2026-09-13.
2. scikit-learn. [Robust covariance estimation and Mahalanobis distances relevance](https://scikit-learn.org/stable/auto_examples/covariance/plot_mahalanobis_distances.html). Accessed 2026-09-13.
3. scikit-learn. [Novelty and Outlier Detection](https://scikit-learn.org/stable/modules/outlier_detection.html). Accessed 2026-09-13.
