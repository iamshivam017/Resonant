# Feature Specification: Real Sensor Feasibility Spike

**Feature Branch**: `bootstrap/repository-foundation`

**Created**: 2026-09-13

**Status**: Draft

**Input**: User description: "Prove that RESONANT can capture real microphone input on the target smartphone/browser, visibly react to the signal, show its frequency content, and expose useful frequency-domain measurements without fake telemetry."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Observe Live Machine Sound (Priority: P1)

As a tester standing near a machine or other physical sound source, I want to grant
microphone access and see a live signal respond to the sound so that I can verify the
product is measuring the real environment rather than replaying or fabricating data.

**Why this priority**: Real, permissioned microphone capture is the feasibility gate
for the entire acoustic condition-monitoring product.

**Independent Test**: Open the spike on a target device, grant microphone permission,
start capture, and compare the displayed signal while the physical environment is quiet
and while a nearby sound source is active.

**Acceptance Scenarios**:

1. **Given** a supported device in an allowed context with no active capture, **When** the tester explicitly starts sensing and grants permission, **Then** the product identifies capture as active and displays measurements derived from that live input.
2. **Given** active capture in a quiet environment, **When** a nearby physical sound grows louder or quieter, **Then** the live signal visibly changes in the corresponding direction.
3. **Given** active capture, **When** the tester stops sensing, **Then** microphone use ends and the interface clearly reports that capture is inactive.

---

### User Story 2 - Inspect Frequency-Domain Evidence (Priority: P2)

As a technical tester, I want to see the live frequency distribution and dominant
frequency evidence so that I can judge whether the captured sound contains useful,
changing machine-signature information.

**Why this priority**: Capturing sound alone does not establish that RESONANT can
extract the evidence needed for later baseline comparison.

**Independent Test**: While capture is active, expose the microphone to two physically
produced sounds with clearly different dominant tones and observe the displayed
frequency distribution and dominant-frequency output for each.

**Acceptance Scenarios**:

1. **Given** valid live capture, **When** a sustained physical sound is present, **Then** the product displays a frequency distribution derived from the current input and identifies its strongest observed frequency component.
2. **Given** two physically produced sounds with materially different dominant tones, **When** each is measured separately, **Then** the strongest-frequency output and visible distribution change consistently with the sound change.
3. **Given** active capture, **When** the tester inspects the measurement panel, **Then** the product shows the essential capture context and feature values needed to interpret the observation.

---

### User Story 3 - Understand Capture Failures (Priority: P3)

As a tester whose device, permission state, or environment cannot produce a valid
measurement, I want an explicit explanation and a recovery action so that I never
mistake unavailable or poor-quality data for a successful condition result.

**Why this priority**: Honest failure behavior protects the zero-fabrication promise
and makes demonstrations recoverable.

**Independent Test**: Exercise permission denial, unsupported capability, interruption,
and insufficient-signal paths and confirm that none presents live measurements as valid.

**Acceptance Scenarios**:

1. **Given** microphone permission is denied, **When** capture is requested, **Then** no measurement is shown as valid and the tester receives a clear permission-specific recovery path.
2. **Given** microphone capture is unsupported or unavailable, **When** the spike is opened or sensing is requested, **Then** the limitation is identified before a condition claim is made.
3. **Given** an active stream is interrupted, **When** new valid input stops arriving, **Then** live results become unavailable or degraded rather than freezing as credible current data.
4. **Given** captured input is insufficient for a useful frequency observation, **When** features are evaluated, **Then** the product labels the observation as insufficient instead of inventing or overstating a result.

---

### User Story 4 - Trust Signal Quality and Timing (Priority: P2)

As a technical tester, I want deterministic signal-quality and timing observations so
that I can distinguish usable live evidence from exact silence, digital clipping, or an
unmeasured performance assumption.

**Why this priority**: The sensor/DSP proof is credible only when obviously unusable
frames fail closed and timing values describe the observed session rather than a target.

**Independent Test**: Feed hand-checkable silent, full-scale, and ordinary finite frames
through the quality boundary, then observe a live session long enough to produce two
frame timestamps and confirm the displayed quality, duration, and cadence values.

**Acceptance Scenarios**:

1. **Given** an active frame whose finite time-domain samples are all exactly zero, **When** quality is evaluated, **Then** the frame is identified as no usable input and no dominant spectral peak is presented.
2. **Given** an active frame containing a sample at digital full scale, **When** quality is evaluated, **Then** clipping is identified with safe repositioning guidance and no dominant spectral peak is presented as reliable.
3. **Given** two or more live frames with advancing monotonic timestamps, **When** the tester inspects the readout, **Then** elapsed capture duration and observed analysis cadence are derived from those timestamps and shown with units.
4. **Given** a quality characteristic that requires empirical thresholds, **When** the tester reads the evidence record, **Then** the characteristic is marked `MANUAL DEVICE VERIFICATION REQUIRED` or `UNKNOWN / NEEDS CALIBRATION` rather than classified from an invented limit.

### Edge Cases

- Permission is dismissed without an explicit allow or deny decision.
- Permission was previously denied at the browser or operating-system level.
- The page is loaded in a context where microphone access is prohibited.
- The selected input device disappears or changes during capture.
- The page is backgrounded, suspended, reloaded, or closed during capture.
- A second start or stop action occurs while a transition is already in progress.
- Input is silent, clipped, extremely noisy, or too brief to support a stable feature.
- The device reports capture settings that differ from the requested settings.
- A stale visualization or feature value remains after capture ends or fails.
- A non-empty frame contains only exact digital zeros.
- One or more samples reach positive or negative digital full scale.
- Two sampled frames receive the same or non-advancing monotonic timestamp.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST require an explicit user action before requesting microphone access or beginning capture.
- **FR-002**: The product MUST show whether microphone capability is ready, awaiting permission, active, stopped, unavailable, denied, interrupted, or producing insufficient input.
- **FR-003**: When capture is active, all displayed signal and feature values MUST be derived from the current real microphone stream.
- **FR-004**: The product MUST display a continuously updating time-domain representation of valid live input.
- **FR-005**: The product MUST display a continuously updating frequency-domain representation of valid live input.
- **FR-006**: The product MUST identify the strongest observed frequency component and show its measurement unit.
- **FR-007**: The product MUST expose the actual capture context needed to interpret a run, including the effective sampling setting reported by the device and the analysis-window setting.
- **FR-008**: The product MUST distinguish valid, degraded, insufficient, stale, and unavailable measurements.
- **FR-009**: The product MUST stop using the microphone when the tester stops capture, leaves the sensing surface, or the capture session terminates.
- **FR-010**: Permission denial, unsupported capability, stream interruption, and processing failure MUST each produce a specific, actionable error state.
- **FR-011**: The product MUST NOT substitute prerecorded, random, generated, or cached telemetry when live input is absent.
- **FR-012**: The product MUST NOT persist or transmit raw microphone input as part of this spike.
- **FR-013**: The product MUST provide a documented physical-device verification procedure that records device, browser, permission outcome, observed behavior, and limitations without recording invented results.
- **FR-014**: The feature MUST remain bounded to microphone feasibility; machine inventory, commissioning, anomaly scoring, history, IMU fusion, remote explanation, and benchmark evaluation are outside this slice.
- **FR-015**: The product MUST identify a non-empty finite frame containing only exact digital zeros as no usable input and suppress interpreted spectral output.
- **FR-016**: The product MUST identify samples at digital full scale as clipping evidence, show specific repositioning guidance, and suppress the dominant spectral peak as reliable evidence.
- **FR-017**: During active capture, the product MUST expose elapsed capture duration derived from the session's observed monotonic timestamps.
- **FR-018**: After two advancing live frame timestamps exist, the product MUST expose the observed analysis cadence with units and MUST NOT present it as an acceptable-performance judgment.
- **FR-019**: The primary user-facing frequency label MUST be `Dominant Spectral Peak`; FFT/bin terminology MAY appear as secondary technical context.
- **FR-020**: Low-signal, signal-to-noise, instability, acceptable-performance, and machine-condition thresholds MUST remain `UNKNOWN / NEEDS CALIBRATION` or `MANUAL DEVICE VERIFICATION REQUIRED` until physical evidence supports them.
- **FR-021**: The physical verification procedure MUST include a device/browser compatibility matrix and ambient, repeated same-state fan, and changed-state fan worksheets without prefilled measurements.

### Key Entities

- **Capture Session**: One explicit interval of microphone use, including lifecycle state, start and stop events, effective capture context, and failure information.
- **Signal Frame**: A current analysis interval derived from the active stream, including time-domain observations, frequency-domain observations, and freshness state.
- **Feature Observation**: Interpretable measurements derived from a valid signal frame, including the strongest observed frequency component and data-quality state.
- **Verification Run**: A tester-recorded physical-device attempt that links the environment and device context to observed acceptance evidence and limitations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On every declared target device/browser combination, a tester can reach either an active real-input state or a specific unsupported/denied state within two minutes of opening the spike.
- **SC-002**: In a documented supported-device run, all five planned state transitions—ready, requesting permission, active, stopped, and one exercised failure state—produce the expected distinct user-visible state.
- **SC-003**: In a documented live run, the time-domain display responds in the expected direction in all three physical trials: quiet, louder sound, and return to quiet.
- **SC-004**: In a documented live run using two physically produced sounds with different dominant tones, the strongest-frequency output changes in the expected direction in all repeated trials.
- **SC-005**: Review of the production sensing path finds zero prerecorded, random, generated, or cached values used as live telemetry.
- **SC-006**: In every exercised denial, unsupported, interruption, and insufficient-input case, the product makes no successful measurement or machine-condition claim.
- **SC-007**: A new contributor can reproduce the physical verification procedure from project documentation and record an evidence-based pass, fail, or `UNKNOWN / NEEDS VERIFICATION` result without undocumented setup knowledge.
- **SC-008**: Every exact-silent and digital-full-scale deterministic fixture produces its corresponding explicit quality state and no reliable dominant spectral peak.
- **SC-009**: In an active session with at least two advancing frame timestamps, capture duration and observed cadence are displayed from those timestamps with explicit units.
- **SC-010**: The compatibility matrix and all four ambient/fan trials contain only observed results or explicit manual-verification markers.

## Assumptions

- The first declared target is a modern smartphone browser that exposes microphone input after an explicit permission gesture; exact device/browser combinations remain `UNKNOWN / NEEDS VERIFICATION` until physical testing.
- The microphone is the only sensing modality in this feature; motion sensors are progressive enhancements in a later specification.
- A physical sound source with an observable change is available for manual verification; a machine is preferred, while another physical source may validate the signal path without becoming benchmark evidence.
- Raw microphone input remains ephemeral and local during this spike.
- This feature demonstrates capture and interpretable signal evidence; it does not establish machine health, anomaly-detection accuracy, or production sensor compatibility.
