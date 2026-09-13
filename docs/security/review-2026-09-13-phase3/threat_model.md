# Phase 3 threat model

## Assets

- Browser microphone permission and live capture resources.
- Operator-entered machine, operating-state, and placement metadata.
- Derived RMS, peak, dominant-frequency, and dominant-bin capture summaries.
- Baseline version lineage and explicit operator confirmations.

## Trust boundaries and threats

| Boundary | Threat | Implemented control |
|---|---|---|
| Operator → form → IndexedDB | malformed or cross-related metadata | validation on repository reads/writes and strict Machine × Operating-State IDs |
| MediaDevices/Web Audio → capture collector | silent, clipped, stale, interrupted, or non-advancing evidence accepted | fail-closed deterministic quality/timing checks; no invented signal threshold |
| Ephemeral frames → persistence | raw audio/frame retention | storage contracts exclude raw frame arrays; production-boundary tests enforce the exclusion |
| Manual review → activation | baseline activated without required evidence | known-normal confirmation, at least two persisted source captures, and separate manual consistency confirmation |
| Recalibration → version store | prior evidence overwritten or two active versions left behind | atomic transaction creates the next version and supersedes the previous active record |
| Stored records → UI | corrupted relationships presented as trusted evidence | complete load validation rejects invalid relationship graphs |

## Out of scope / unresolved

Remote synchronization, multi-user authorization, exports, scoring, anomaly classification,
and raw-audio storage are not implemented. Shared-device storage governance and real-device
API behavior require later product decisions and manual verification.
