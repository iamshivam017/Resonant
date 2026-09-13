# Contract: Sensor Session and Instrument Surface

This is the internal user-interface/domain contract for the spike. It exposes no
network API.

## Commands

### `checkCapability()`

Returns observed secure-context and microphone-interface capability. It performs no
permission request and starts no capture.

### `start()`

- MUST be initiated by an explicit user action.
- Is valid from `ready`, `stopped`, or a recoverable terminal state.
- Enters `requesting-permission` before invoking the browser permission flow.
- Resolves to `active` only after a live track and analysis graph are ready.
- Maps expected permission/device failures to a typed state and leaves no live resource.
- Repeated calls while starting or active MUST NOT create a second stream.

### `stop(reason)`

- Is idempotent.
- Cancels drawing and sampling loops.
- Disconnects analysis nodes, stops every owned track, and closes the owned audio context.
- Clears or marks stale every feature observation.
- Completes in `stopped` unless teardown itself reports `failed`.

## Observable state

| State | Primary message | Valid live features | Allowed primary action |
|---|---|---:|---|
| `ready` | Microphone check ready | No | Start sensing |
| `requesting-permission` | Awaiting browser permission | No | Cancel/await |
| `initializing` | Preparing live analysis | No | Stop |
| `active` | Microphone active | Yes, only for fresh valid frames | Stop sensing |
| `stopping` | Releasing microphone | No | None |
| `stopped` | Microphone off | No | Start again |
| `denied` | Permission blocked | No | Show permission recovery |
| `unsupported` | Capture unavailable in this context | No | Show compatibility recovery |
| `interrupted` | Live input ended unexpectedly | No | Retry |
| `failed` | Capture or processing failed | No | Retry when safe |

An `active` session with degraded, insufficient, silent, or clipping input displays measured capture
context plus the specific quality state, but it MUST NOT display a dominant frequency
as reliable. `degraded` means a usable frame was observed while the browser reported
acoustic processing remained active; it does not imply a calibrated quality threshold.

## Live frame contract

A render frame may include time-domain samples, spectrum magnitudes, RMS, peak,
dominant-bin center frequency, bin resolution, observed track settings, analysis sample
rate, transform size, elapsed capture duration, and observed update cadence. Timing values
MUST come from advancing monotonic frame timestamps; unavailable timing remains unknown.
Dominant-bin selection MUST receive its eligible range as explicit configuration;
the spike excludes DC with `firstEligibleBin: 1`. The surface MUST label digital
amplitude as uncalibrated and use `Dominant Spectral Peak` as the primary frequency label.

An exact-zero non-empty time frame produces `silent`; a sample whose absolute value is at
least one produces `clipping`. Both suppress reliable dominant-peak output. Low signal,
SNR, instability, and acceptable-performance classification remain `UNKNOWN / NEEDS
CALIBRATION` and MUST NOT be inferred from a placeholder threshold.

No frame may include a baseline similarity, anomaly, condition status, diagnosis, or
machine-health percentage in this feature.

## Cleanup contract

Cleanup runs after explicit stop, navigation/unmount, page lifecycle termination where
available, stream-ended notification, or initialization failure. Once cleanup begins,
new frames are rejected for the old session identifier.

## Test boundary

Deterministic test doubles MAY exercise commands and state transitions in automated
tests. They MUST be named as fixtures and MUST NOT be reachable as a production or demo
telemetry source. Physical acceptance uses a real microphone only.

## Phase 3 Baseline Collector Contract

- Collection attaches to the existing capture-session subscription and never creates a
  second microphone or DSP path.
- Start begins an operator-controlled capture window; finish commits only a summary after
  at least two advancing valid observations and positive observed duration.
- Silent, clipping, insufficient, stale, degraded, non-advancing, interrupted, or failed
  evidence rejects the window and explains that it was not added.
- Accepted summaries retain machine/state identity, observed duration and context, feature
  medians, and observation count. Raw frames are discarded when the window ends.
- Aggregation rejects mixed machine/state input, requires at least two accepted captures,
  returns median plus observed minimum/maximum, and preserves source summaries.
- Activation requires explicit known-normal and manual-consistency confirmations.
- Recalibration appends a new version and supersedes prior active versions without deletion.

## Phase 4 Scan Comparison Contract

- Scan collection subscribes to the same capture-session controller and applies the same
  deterministic acceptance/rejection boundary as baseline capture.
- Comparison requires an exact active Machine × Operating-State baseline and records its
  immutable identifier and version.
- Each feature emits native-unit signed/absolute differences and observed-range position.
- Missing, non-finite, mismatched, superseded, or invalid-quality evidence produces no result.
- Composite similarity is `null`; normalization, weights, and severity remain `UNKNOWN /
  NEEDS CALIBRATION` until physical evidence supports them.
- Persisted results contain summaries/context only and never raw audio or signal frames.
