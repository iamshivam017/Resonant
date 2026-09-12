# Data Model: Real Sensor Feasibility Spike

The spike keeps raw frames in memory only. These entities are runtime contracts, not
persistent database records.

## Capture Capability

| Field | Meaning | Validation |
|---|---|---|
| `secureContext` | Whether the page may request microphone access | Observed boolean |
| `mediaDevicesAvailable` | Whether the capture interface exists | Observed boolean |
| `audioInputSupported` | Whether an audio-input request can be attempted | Derived from current environment |
| `supportedConstraints` | Processing preferences the browser recognizes | Observed values only |
| `checkedAt` | Capability-check time | Valid timestamp |

Capability never claims permission is granted before a request resolves.

## Capture Session

| Field | Meaning | Validation |
|---|---|---|
| `id` | Identifier for one start-to-terminal lifecycle | Unique within the page session |
| `state` | Current lifecycle state | One value from the state table below |
| `startedAt` / `stoppedAt` | Lifecycle timestamps | Stop cannot precede start |
| `trackSettings` | Effective device/browser settings | Copied only from observed track settings; missing values stay unknown |
| `audioSampleRate` | Effective analysis sample rate | Finite positive observed value |
| `analysisWindowSize` | Current transform size | Supported positive power of two |
| `error` | Typed failure and recovery guidance | Present only for terminal/degraded failure states |

### Session states

`idle → ready → requesting-permission → initializing → active → stopping → stopped`

From a non-terminal state, the session may enter `denied`, `unsupported`,
`interrupted`, or `failed`. An active session may report frame quality as
`valid`, `insufficient`, or `stale` without inventing a terminal success.

Only one start or stop transition may be in flight. Stop and terminal failure clear
feature observations and release every owned resource.

## Signal Frame

| Field | Meaning | Validation |
|---|---|---|
| `capturedAt` | Monotonic observation time | Must advance for a frame to be fresh |
| `timeDomain` | Current normalized digital samples | Finite values from the active stream |
| `frequencyDomain` | Current spectrum-bin magnitudes | Finite values from the same analysis interval |
| `quality` | `valid`, `insufficient`, or `stale` | Invalid quality suppresses interpreted output |

Frames are bounded, ephemeral, and never persisted or transmitted by this feature.

## Feature Observation

| Field | Meaning | Validation |
|---|---|---|
| `rms` | Digital root-mean-square amplitude | Finite, non-negative; not calibrated sound pressure |
| `peak` | Greatest absolute digital sample magnitude | Finite, non-negative |
| `dominantBin` | Strongest eligible spectrum-bin index | Within the available bin array |
| `dominantFrequencyHz` | Center frequency of the strongest eligible bin | Derived from observed sample rate and transform size |
| `binResolutionHz` | Frequency width represented by one bin | Observed sample rate divided by transform size |
| `freshness` | Whether values belong to the current active stream | Must be current before display as live evidence |

The dominant bin is evidence of an observed spectrum peak, not proof of a mechanical
fundamental, fault frequency, diagnosis, or health percentage.

## Capture Error

| Field | Meaning | Validation |
|---|---|---|
| `code` | Stable error family | `permission-denied`, `unsupported`, `device-unavailable`, `constraint-failed`, `interrupted`, or `processing-failed` |
| `summary` | Concise user-facing explanation | Must not expose sensitive implementation details |
| `recovery` | Safe next action | Specific to the code |
| `causeName` | Browser-reported category when available | Diagnostic only; may be unknown |

## Verification Run

| Field | Meaning | Validation |
|---|---|---|
| Device/browser context | Device, OS, browser/version, secure URL | Values observed by the tester |
| Permission result | Granted, denied, dismissed, or unavailable | Recorded, never inferred |
| Capture settings | Effective settings shown by the spike | Unknown remains explicit |
| Physical trials | Quiet/louder/quiet and two distinct physical sounds | Each recorded pass/fail/unknown |
| Failure trials | At least one exercised failure plus other attempted paths | No unattempted path marked pass |
| Limitations | Deviations, instability, environmental notes | Free text with no diagnosis claim |

Verification runs are evidence records. No benchmark or reliability conclusion is
created until the relevant run actually occurs.
