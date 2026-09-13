# Phase 4 threat model

## Assets

- Browser microphone permission and active capture resources.
- Operator-entered machine and operating-state identities.
- Derived RMS, peak, dominant-frequency, and dominant-bin summaries.
- Baseline version lineage, observed ranges, and current-scan provenance.
- Locally persisted scan evidence in the browser profile.

## Trust boundaries and threats

| Boundary | Threat | Implemented control |
|---|---|---|
| MediaDevices/Web Audio → scan collector | invalid, silent, clipped, stale, interrupted, or non-advancing evidence accepted | existing fail-closed Phase 2/3 quality and timing collector is reused |
| Selected UI pair → comparison | wrong machine, state, or baseline version used | exact machine ID, operating-state ID, baseline ID/version, and active status are revalidated at save time |
| Numeric evidence → result | missing/non-finite or internally inconsistent values produce credible output | finite-number, range-order, current/deviation, position, and composite-null validation |
| Ephemeral frames → IndexedDB | raw audio or signal arrays retained | persistence reconstructs an allowlisted scalar result; unit and browser checks confirm raw arrays are absent |
| IndexedDB v1 → v2 | existing Phase 3 records are lost or overwritten | additive store creation only; browser migration test preserves a seeded v1 record |
| Stored record → UI | orphaned provenance is shown as trustworthy evidence | repository load fails closed when the referenced baseline version is unavailable |
| Operator-facing output | an observed difference is misrepresented as condition or severity | no composite, threshold, classification, health, fault, diagnosis, or remaining-life output exists |

## Attacker capabilities and assumptions

The implemented application is local-only and has no authentication, remote sync, API,
telemetry, or server-side scan boundary. A person with access to the same browser profile
can inspect or alter IndexedDB and is already inside the local evidence boundary. React
text rendering escapes operator-entered names. The deployment host serves static assets and
does not receive microphone frames or scan records.

## Out of scope and unresolved

Shared-device access governance, deletion/export, multi-user authorization, physical-phone
browser behavior, and browser-storage eviction remain future work. Scientific repeatability,
normalization, weights, and machine-condition interpretation are uncalibrated and are not
treated as security assertions.
