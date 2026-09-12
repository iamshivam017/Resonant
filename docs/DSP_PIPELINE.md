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

## Candidate acoustic features

| Feature | Why it may help | Selection status |
|---|---|---|
| Time RMS | Overall signal energy change | P0 spike; device-relative, not calibrated SPL |
| Peak absolute amplitude | Clipping/impulse context | P0 quality evidence |
| Crest factor | Change in impulsiveness relative to RMS | P0 candidate after low-signal guard |
| Dominant spectral bins | Visible tonal/state shifts | P0 spike; report bin resolution |
| Spectral centroid | Distribution shift toward higher/lower frequencies | P0 candidate |
| Spectral bandwidth | Spread around centroid | P0 candidate |
| Spectral rolloff | Upper distribution movement | P1 after percentile choice is documented |
| Band-energy ratios | Coarse shape robust to absolute level changes | P0/P1 after bands derive from actual resolution/context |
| Spectral flux | Change between adjacent spectra | P1; sensitive to timing and state transitions |
| Harmonic ratios | Rotating-machine periodic structure | P1 only when RPM/fundamental evidence exists |
| MFCCs | Compact spectral-envelope representation | Benchmark experiment only until interpretability/value is shown |

Do not include a feature unless ablation/repeatability evidence shows value. RMS here is normalized digital amplitude, not physical sound pressure without microphone calibration.

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
- Digital clipping evidence from samples approaching full-scale; the exact consecutive-sample policy must be tested.
- Measured duration and interruption.
- Audio context state and actual sample rate.

### Checks requiring calibration

- Minimum usable signal relative to device noise floor.
- Excessive environmental noise or transient interference.
- Placement movement.
- Sampling/jitter stability for motion.
- Minimum measurement duration and acceptable repeatability.

Until calibrated, these checks report observations and **do not silently gate or score**. When a required check fails, the output is `Measurement quality insufficient — reposition device and retry.` with a specific reason and no condition score.

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
