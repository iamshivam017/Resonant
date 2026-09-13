# RESONANT DSP Pipeline

## Purpose

Define how RESONANT turns real smartphone microphone and optional motion readings into quality-controlled, versioned measurements. The pipeline supports change detection; it does not infer universal machine condition.

## Feasibility findings

- `navigator.mediaDevices.getUserMedia({audio: ...})` is broadly available but only in a secure context. Permission denial, missing devices, constraint failure, and capture interruption are normal runtime outcomes, not exceptional success paths.^1
- Web Audio's `AnalyserNode` exposes current time-domain samples and FFT-derived frequency bins and is suitable for the first live visualization spike.^2
- Actual microphone settings can differ from requested constraints. The application must record `MediaStreamTrack.getSettings()` and `AudioContext.sampleRate`, not assume a sample rate, channel count, automatic gain control, echo cancellation, or noise suppression state.^3
- Generic `Accelerometer` and `Gyroscope` APIs are limited/experimental across browsers. Device Motion is also permission- and secure-context-sensitive. IMU is therefore progressive enhancement, not a P0 prerequisite.^4

## Capture contract

### Microphone request

Request one audio track in direct response to a user action. Prefer mono and request `echoCancellation: false`, `noiseSuppression: false`, and `autoGainControl: false` only as preferences after checking supported constraints. Browsers may ignore unsupported preferences; actual settings are evidence.

Never route the analyser to speakers. Stop every `MediaStreamTrack`, cancel animation/worker loops, disconnect nodes, and close the `AudioContext` when the session stops or the component unmounts.

### Capture metadata

Every accepted measurement records:

- capture start/end and monotonic duration;
- browser/user-agent summary and secure-context status;
- track `sampleRate`, `sampleSize`, `channelCount`, latency, and processing flags when exposed;
- `AudioContext.sampleRate`;
- pipeline and feature-schema versions;
- FFT/window/hop configuration actually used;
- sensor interruption and quality outcomes;
- machine, operating state, and placement-protocol identifiers.

Missing settings remain `unknown`; they are never filled with defaults and presented as observed.

## First-spike pipeline

```text
MediaStream microphone
→ MediaStreamAudioSourceNode
→ AnalyserNode
→ Float32 time-domain frame
→ waveform canvas
→ Float32 frequency-bin frame
→ spectrum canvas
→ measured frame RMS / peak / dominant bin
```

The spike uses the browser analyser to answer feasibility quickly. Its spectrum bin width is:

\[
\Delta f = \frac{f_s}{N}
\]

where \(f_s\) is the actual `AudioContext.sampleRate` and \(N\) is `fftSize`. The center frequency for bin \(k\) is \(k\Delta f\). `frequencyBinCount` is \(N/2\).^2

The dominant-bin display must state its resolution and must not call a bin a mechanical fundamental or fault frequency. DC and bins outside the displayed/validated range are excluded only through explicit configuration.

## Production measurement pipeline proposal

The first spike must determine whether `AnalyserNode` is adequate for repeatable features. If repeatability or window control is insufficient, move feature extraction to an `AudioWorklet` feeding a worker-owned bounded ring buffer. React receives low-rate summaries; it never owns sample-rate event state.

1. Acquire actual samples and metadata.
2. Convert to mono only when multiple channels are actually present; record the method.
3. Remove DC from each analysis frame.
4. Apply a documented window before FFT for reproducible offline/online parity.
5. Compute features per frame.
6. Aggregate robust statistics across the measurement window.
7. Run quality checks and reject invalid measurements.
8. Emit an immutable versioned feature vector; discard raw frames unless the user explicitly exports a recording.

Window length, overlap, measurement duration, band boundaries, and aggregation intervals are **UNKNOWN / NEEDS VERIFICATION** on the target phone and fan. They must be selected from measured resolution, latency, CPU, and repeatability—not aesthetics.

## Phase 2 acoustic features

| Feature | Why it may help | Selection status |
|---|---|---|
| Time RMS | Overall digital signal energy observation | Selected; device-relative, not calibrated SPL |
| Peak absolute amplitude | Digital full-scale clipping evidence | Selected |
| Dominant spectral peak/bin | Visible tonal shift observation | Selected; report bin index and resolution |
| Spectral centroid | Distribution shift toward higher/lower frequencies | Deferred until physical repeatability evidence exists |
| Spectral bandwidth | Spread around centroid | Deferred until physical repeatability evidence exists |
| Spectral flux | Change between adjacent spectra | Deferred until physical repeatability evidence exists |
| Band-energy features | Coarse spectral-shape observation | Deferred until physical repeatability evidence exists |
| All other derived features | Additional signal summaries | Deferred until physical repeatability evidence justifies selection |

Do not include another feature unless physical repeatability evidence shows value. RMS and
peak are normalized digital amplitudes, not physical sound pressure without microphone
calibration. The dominant spectral peak is the strongest eligible analyser bin, not a
machine fundamental or fault frequency.

## Candidate motion features

- Per-axis and vector-magnitude acceleration RMS.
- Peak, variance, and standard deviation.
- Crest factor after reliable low-signal handling.
- Frequency-domain peaks and band energy when timestamps are stable enough.
- Orientation/rotation features only when they improve placement or motion-quality detection.

Motion readings require recorded coordinate convention, requested and observed interval/frequency, timestamp stability, and gravity handling. Manually shaking the phone is never machine-vibration evidence.

## Quality gate

### Deterministic checks available in the first spike

- Secure context and API availability.
- Permission result and mapped DOM exception.
- Track starts and remains live.
- Non-empty finite sample buffers.
- Exact no-input evidence when every time-domain sample is exactly zero.
- Digital full-scale clipping evidence when any time-domain sample has absolute amplitude
  greater than or equal to `1.0`.
- Capture duration from the session's monotonic timestamps.
- Observed update cadence from the positive interval between consecutive captured frames.
- Audio context state and actual sample rate.

### Checks requiring calibration

- Non-zero but low signal relative to the device noise floor.
- Signal-to-noise ratio.
- Excessive environmental noise or transient interference.
- Placement movement.
- Update-cadence stability and acceptable performance.
- Minimum measurement duration and acceptable repeatability.
- Any machine-condition interpretation.

These threshold-dependent behaviors remain **UNKNOWN / NEEDS CALIBRATION**. Physical
compatibility and repeatability remain **MANUAL DEVICE VERIFICATION REQUIRED**. Phase 2
does not silently gate, score, or infer condition from these unresolved observations.

## Online/offline parity

- Pure DSP functions receive typed arrays plus explicit configuration.
- Golden synthetic signals may test mathematics, but must be clearly labeled test fixtures and never appear as live/demo sensor data.
- Captured real-device fixtures may be committed only with consent, provenance, size review, and privacy review.
- Python benchmark features and browser features require parity tests on the same approved fixture before benchmark conclusions are connected to product methodology.

## First spike acceptance record

The spike is not complete until a human runs it on a physical target phone/browser and records device, OS, browser, HTTPS URL, permission outcome, observed settings, waveform response, spectrum response, dominant-bin change, error-state checks, and limitations. Automated browser tests cannot prove physical sensor behavior.

## Sources

1. MDN Web Docs. [`MediaDevices.getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia). Accessed 2026-09-13.
2. MDN Web Docs. [`AnalyserNode`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) and [Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API). Accessed 2026-09-13.
3. MDN Web Docs. [`MediaTrackSettings`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings) and [`MediaTrackSupportedConstraints`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSupportedConstraints). Accessed 2026-09-13.
4. W3C. [Device Orientation and Motion](https://www.w3.org/TR/orientation-event/) and [Generic Sensor API](https://www.w3.org/TR/generic-sensor/); MDN Web Docs, [`Accelerometer`](https://developer.mozilla.org/en-US/docs/Web/API/Accelerometer). Accessed 2026-09-13.
5. W3C. [Web Audio API Recommendation](https://www.w3.org/TR/webaudio-1.0/). Accessed 2026-09-13.
