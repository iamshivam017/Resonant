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

An `active` session with insufficient input displays measured capture context plus an
`insufficient` quality state, but it MUST NOT display a dominant frequency as reliable.

## Live frame contract

A render frame may include time-domain samples, spectrum magnitudes, RMS, peak,
dominant-bin center frequency, bin resolution, observed sample rate, and transform
size. The surface MUST label digital amplitude as uncalibrated and dominant frequency
as an observed spectrum peak.

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
