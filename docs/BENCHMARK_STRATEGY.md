# RESONANT Benchmark Strategy

## Purpose

Evaluate RESONANT's anomaly/deviation methodology against independently labelled machine-sound data without presenting dataset performance as smartphone field accuracy.

## Selected benchmark family

Use the **DCASE 2020 Challenge Task 2 development dataset** as the first reproducible benchmark target. The task trains from normal machine sounds and evaluates anomaly scores on normal and anomalous test recordings. The official development material combines ToyADMOS and MIMII machine families and defines machine type/ID file organization.^1

Start with the MIMII fan subset because it aligns with the safe live fan demonstration, then expand across other machine types if time and storage permit. This is an evaluation alignment choice, not evidence that phone recordings match the dataset.

MIMII's authoritative Zenodo record describes valves, pumps, fans, and slide rails, recordings from an eight-channel microphone array at 16 kHz/16-bit, factory-noise mixtures, and CC BY-SA 4.0 licensing.^2 Those properties establish a substantial domain mismatch with a single smartphone microphone.

## Dataset acquisition and provenance

- Download only from the official DCASE/Zenodo links.
- Keep archives and extracted audio outside Git.
- Record dataset name/version, URL, access date, license, file size, and official checksum where provided.
- Verify the downloaded checksum before extraction.
- Extract into a configured local data directory with traversal-safe handling.
- Generate a manifest containing relative path, machine type, machine ID, condition label, source split, and checksum derived from the verified official layout.
- Do not infer undocumented labels from filenames; fail on unknown layouts.

## Experimental protocol

### Primary protocol

1. Preserve the DCASE train/test separation.
2. Fit the detector using normal training samples only.
3. Use a declared validation partition from training data for feature/model selection without reading test labels.
4. Produce one continuous anomaly score per test clip.
5. Evaluate normal vs anomalous test labels by machine type and machine ID.
6. Aggregate only with the official or explicitly documented method.

### Compared systems

- `R0`: simple reproducible reference (for example standardized feature distance) using the same selected feature schema.
- `R1`: RESONANT robust diagonal-distance methodology.
- `B0`: official DCASE baseline when its pinned environment can be reproduced.
- Additional Isolation Forest, one-class SVM, LOF novelty, covariance, or embedding methods only as time-boxed experiments with declared hyperparameter selection.

No published DCASE leaderboard number is a RESONANT result. RESONANT result tables remain empty until scripts run successfully against verified data.

## Preprocessing

- Decode with a pinned library and reject unreadable files.
- Record original sample rate/channel count.
- Apply any channel selection, resampling, framing, window, normalization, and feature transform through a versioned configuration.
- Do not silently tune preprocessing per test label.
- Preserve online/offline feature parity tests where the web product uses the same feature definition.

Exact preprocessing values are **UNKNOWN / NEEDS VERIFICATION** until the official dataset/baseline code is inspected and a first reproducible run is configured.

## Metrics

The official DCASE 2020 Task 2 metrics are ROC-AUC and partial AUC over false-positive rates up to 0.1.^1 Report these per machine type/ID with the exact aggregation procedure.

Precision, recall, F1, and confusion matrices require a fixed decision threshold. They may be added only when the threshold is selected on validation data before test evaluation. Include:

- score direction;
- class mapping;
- threshold source;
- confidence interval or repeated-run variability where practical;
- failed/missing file counts;
- runtime and environment metadata.

## Reproducibility contract

Each `BenchmarkRun` records:

- Git commit SHA;
- dataset manifest/checksum;
- environment lock and runtime versions;
- configuration and random seeds;
- command invoked and exit status;
- per-file anomaly scores;
- aggregate metrics and plots;
- timestamp and hardware summary;
- stdout/stderr path for failures.

Generated web-visible results must be copied from a successful run artifact by a deterministic export step. On missing/corrupt data, the Benchmark Lab shows `Benchmark data unavailable` rather than example numbers.

## Domain-separation statement

The benchmark answers: *Can the selected method rank labelled anomalous machine recordings apart from normal recordings in this dataset?*

The live demo answers: *Can a smartphone capture and show a repeatable physical operating-state change on the demonstrated machine?*

Neither result alone proves field fault-diagnosis performance. The final presentation must keep these evidence layers separate.

## Acceptance criteria

- Source, license, version, and checksums are verified.
- One command reproduces preprocessing, scoring, metrics, and export from a clean environment.
- Training uses no anomalous test labels.
- Metrics match independently recalculated values from saved per-file scores.
- The result artifact identifies failures and contains no hand-entered numbers.
- Limitations and smartphone domain mismatch appear beside results.

## UNKNOWN / NEEDS VERIFICATION

- Exact DCASE download artifact and official baseline revision to pin.
- Local storage/time budget for dataset subsets.
- Final model/feature configurations and seeds.
- Whether full multi-machine evaluation can complete before submission.
- Actual RESONANT benchmark metrics: no run has occurred.

## Sources

1. DCASE Community. [DCASE 2020 Task 2: Unsupervised Detection of Anomalous Sounds for Machine Condition Monitoring](https://dcase.community/challenge2020/task-unsupervised-detection-of-anomalous-sounds). Accessed 2026-09-13.
2. Purohit et al./Hitachi. [MIMII Dataset, public 1.0](https://zenodo.org/records/3384388). Zenodo, 2019.
3. DCASE Community. [DCASE 2020 Challenge index](https://dcase.community/challenge2020/). Accessed 2026-09-13.
