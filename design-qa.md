# RESONANT Design QA

## Comparison target

- Source visual truth: `docs/design/scientific-strip-chart-reference.png`
- Implementation screenshot: `docs/design/implementation-active-qa.png`
- Supporting states: `docs/design/implementation-idle-screen.png` and `docs/design/implementation-error-screen.png`
- Combined comparison: `docs/design/qa-comparison.png`
- CSS viewport: 393 × 852 pixels, device scale factor 1
- Source pixels: 853 × 1844; normalized to 393 × 852 for comparison
- Implementation pixels: 393 × 852
- State: active microphone layout. The implementation capture uses a deterministic test-only browser adapter solely to render the state; it is not physical sensor evidence.

## Full-view comparison evidence

The normalized side-by-side comparison preserves the selected scientific strip-chart hierarchy: graphite instrument surface, tracked RESONANT wordmark, explicit yellow active state, waveform then spectrum, dominant-spectral-peak emphasis, compact capture context, fine divider/grid treatment, and a full-width yellow stop action. The protected mobile runtime owns the status bar, rounded screen crop, and home indicator.

## Required fidelity surfaces

- Fonts and typography: condensed/system fallbacks, optical weights, tracking, uppercase hierarchy, numeric emphasis, wrapping, and line height remain consistent with the source. The implementation uses freely available Roboto plus a narrow system fallback rather than reproducing lettering as artwork.
- Spacing and layout rhythm: section order, plot proportions, rules, two-column measurement band, margins, tap target, and vertical rhythm match the normalized source without horizontal overflow.
- Colors and visual tokens: graphite, near-white, steel-gray rules, electric-blue traces, yellow active/action state, and orange-red error rule map directly to documented tokens and preserve contrast.
- Image quality and assets: the target contains no app-owned raster imagery. Functional plots remain Canvas renderers; interface icons come from Radix. No placeholder imagery or custom SVG artwork is used.
- Copy and content: lifecycle, privacy, uncalibrated amplitude, dominant-spectral-peak, sample-rate, transform-size, and bin-resolution labels are truthful. The concept-preview disclaimer is intentionally absent from the running product.
- Accessibility and behavior: semantic headings, live lifecycle text, alert announcements, Canvas labels/captions, visible focus, 48-pixel primary control, reduced motion, and non-color state copy are present.

## Focused region comparison

The header/status, waveform/quality rail, spectrum, measurement band, and primary control are all legible in the full-resolution 393 × 852 comparison, so separate enlarged crops were not required. Idle and denial captures verify that unavailable evidence is visibly empty rather than replaced with simulated traces.

## Findings

- No actionable P0, P1, or P2 differences remain.
- P3: the implementation condenses plot-axis context into accessible captions because it renders a current analysis frame, not the reference's illustrative two-second history. Adding a time history or fixed tick scale without measured semantics would overstate the current spike.
- P3: the quality label is vertical to retain plot width at 393 pixels; its full state remains available through the accessible label.

## Comparison history

1. Initial comparison found a P2 omission of the reference's signal-quality rail. The implementation added a frame-quality rail driven by `valid`, `insufficient`, `stale`, or awaiting state; component coverage verifies the valid and insufficient states.
2. The first active/error captures contained the protected runtime's simulated pointer over the primary control. The captures were repeated at the same viewport with the pointer moved outside the device screen.
3. The normalized post-fix comparison shows no remaining P0/P1/P2 issue.

## Implementation checklist

- [x] Preserve the protected mobile runtime.
- [x] Match the selected hierarchy, palette, typography, plots, measurement band, and action state.
- [x] Render honest idle, active, insufficient, stopped, unsupported, and denied states.
- [x] Verify 393 × 852 content at 1:1 scale with no horizontal overflow.
- [x] Compare source and final active implementation in one normalized image.

final result: passed
