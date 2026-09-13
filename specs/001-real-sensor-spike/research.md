# Research: Real Sensor Feasibility Spike

## Decision 1: Use a secure-context web capture flow

**Decision**: Request one audio track only after an explicit user gesture and treat
permission denial, missing hardware, unsatisfied constraints, and interruption as
normal typed outcomes.

**Rationale**: `getUserMedia()` requires a secure context and explicit permission. Its
documented error surface maps directly to the spike's fail-closed states.

**Alternatives considered**: Native mobile capture offers greater control but adds
signing and distribution scope; prerecorded uploads cannot prove live sensing.

**Source**: MDN, [`MediaDevices.getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), accessed 2026-09-13.

## Decision 2: Use the browser analyser for the spike

**Decision**: Connect the live stream to a non-audible analysis graph and use its
time-domain and frequency-domain frames for Canvas visualization and dominant-bin
evidence.

**Rationale**: `AnalyserNode` exposes current time and frequency data without modifying
the stream and is sufficient to answer the first feasibility question with minimal
surface area. Bin frequency is derived from the actual audio-context sample rate and
configured transform size.

**Alternatives considered**: An audio worklet plus custom transform provides tighter
window control but is premature before repeatability or performance evidence shows the
built-in analyser is insufficient. A charting library adds dependency and render-path
cost without improving the proof.

**Sources**: MDN, [`AnalyserNode`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) and [Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API), accessed 2026-09-13; W3C, [Web Audio API](https://www.w3.org/TR/webaudio-1.0/), accessed 2026-09-13.

## Decision 3: Record observed capture settings

**Decision**: Request processing constraints as preferences only when supported, then
display and record the effective track settings and audio-context sample rate.

**Rationale**: Browsers and devices may ignore or alter requested sample rate, channel
count, echo cancellation, noise suppression, and automatic gain control. Observed
settings are evidence; requested settings are not.

**Alternatives considered**: Hard-requiring a specific rate or processing flag risks
rejecting otherwise useful devices and would create an unverified compatibility claim.

**Sources**: MDN, [`MediaTrackSettings`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings) and [`MediaTrackSupportedConstraints`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSupportedConstraints), accessed 2026-09-13.

## Decision 4: Keep analysis local and ephemeral

**Decision**: Do not persist or transmit raw frames. Tear down tracks, nodes, animation
loops, and the audio context whenever the session stops, fails, or unmounts.

**Rationale**: The spike needs no backend or account. Local ephemeral processing
minimizes privacy exposure and makes provider/network failure irrelevant to the proof.

**Alternatives considered**: Server processing would require upload, storage controls,
latency handling, and a second failure boundary without improving capture feasibility.

## Decision 5: Use one typed lifecycle contract

**Decision**: Model capability and capture as explicit states. Only `active` with a
fresh valid frame may expose live features; all other states clear or label them stale.

**Rationale**: A finite state model makes denial, interruption, double actions, and
cleanup testable and prevents frozen values from masquerading as current measurements.

**Alternatives considered**: Independent booleans allow contradictory states such as
`isActive` plus `permissionDenied` and make teardown races harder to prove.

## Decision 6: Use the selected Product Design mobile runtime with minimal additions

**Decision**: Use the protected Product Design mobile React/Vite runtime under `app/`
with npm and TypeScript, app-owned CSS variables, Canvas 2D, Vitest/Testing Library,
and Playwright. No backend route is part of this feature.

**Rationale**: The user selected the Scientific Strip Chart mobile concept. Product
Design's image-to-code contract requires its locked mobile runtime for fresh mobile
targets. The spike is entirely client-side, so React/Vite can prove real sensing without
a server framework while retaining the tested device-frame preview and design-QA path.

**Alternatives considered**: Next.js was selected before the visual target existed, but
would duplicate or replace the protected mobile runtime for no spike requirement. A
future integrated MVP may still choose a server-capable shell after sensing evidence.
FastAPI remains appropriate only for isolated offline benchmark tooling.

**Source**: Product Design bundled `mobile-app` runtime and its local prototype contract,
version inspected 2026-09-13. The earlier Context7 Next.js research remains relevant to
future server-only integration evaluation but no longer selects the spike runtime.

## Decision 7: Separate automated confidence from physical proof

**Decision**: Unit tests use explicitly named mathematical fixtures; component and
browser tests exercise state/error contracts; a human HTTPS run on a real phone records
the only acceptance evidence for microphone behavior.

**Rationale**: Automated browser input can validate wiring but cannot prove that a
specific physical phone and browser capture and react reliably. Test fixtures are
allowed by the constitution only when they are never presented as live/demo telemetry.

**Alternatives considered**: Treating mocked browser tests as device evidence violates
the project's evidence rules. Committing recordings before consent and privacy review
adds unnecessary risk.

## Resolved planning unknowns

- **Runtime and project shape**: one protected Product Design React/Vite mobile web application under `app/`.
- **Package manager**: npm; no existing package manager or lockfile is being replaced.
- **Live graphics**: Canvas 2D, driven outside high-frequency React state.
- **First analysis path**: Web Audio analyser; worklet/worker only after evidence.
- **Persistence/API/authentication**: none in this feature.
- **Verification boundary**: automated contract checks plus required physical-device run.
- **Physical support matrix**: remains an output to measure and record, not a planning ambiguity.
