# RESONANT Current Phase

## Current active phase

**Phase 1 → Phase 2 gate — Foundation convergence and real microphone spike readiness**

## Objective

Validate and commit the research/product foundation, complete the Spec Kit artifact chain
for `001-real-sensor-spike`, select one instrument design direction, and begin only the
test-first real microphone vertical slice.

## Completed evidence

- Repository bootstrap committed and remotely verified on `bootstrap/repository-foundation`.
- Spec Kit 1.0.6 with Codex integration installed and integration status passed.
- RESONANT constitution 1.0.0 and first spike specification/checklist committed.
- Feature plan, research, data model, sensor-session contract, and quickstart drafted.
- PRD, architecture, DSP, baseline, condition, benchmark, UX, competition, security,
  test strategy, roadmap, and major decisions drafted.

## Active tasks

- Validate Phase 1 documents for boundaries, sources, contradictions, placeholders, and Markdown.
- Generate exactly three Product Design concepts for the mobile live sensing instrument.
- Obtain the user's concept selection and record the chosen visual target.
- Run `speckit-tasks` and `speckit-analyze`; resolve critical findings before code.
- Scaffold only the approved spike stack and implement via red-green-refactor.
- Deploy over HTTPS and execute the physical-device evidence protocol.

## Spike acceptance criteria

- Explicit permission flow reaches active or a specific failure state.
- Live waveform responds to real physical sound.
- Live spectrum and strongest observed bin change with physically different sounds.
- Actual sampling/analysis context is displayed and recorded.
- Stop/navigation/interruption releases the microphone and invalidates stale output.
- No production/demo fake telemetry, raw-audio persistence/upload, or condition claim exists.
- Format, lint, typecheck, automated tests, browser checks, and production build pass.
- Physical HTTPS evidence is recorded as pass, fail, or `UNKNOWN / NEEDS VERIFICATION`.

## Current gates and blockers

- **Design gate:** One of the three generated concepts must be selected before UI scaffolding/build.
- **Physical evidence:** Target phone/browser, machine or physical sound source, and mounting/test
  context are `UNKNOWN / NEEDS VERIFICATION` until supplied and exercised.
- **Deployment:** Host and account access are `UNKNOWN / NEEDS VERIFICATION`; local code/tests can
  proceed, but HTTPS phone acceptance cannot complete without a reachable deployment.
- **Competition:** Official eligibility wording conflicts and requires organizer verification.

## Explicitly deferred

Baseline/scoring, persistence/history, IMU, benchmark execution, Featherless, Sentry,
decorative landing work, authentication, and P1/P2 features remain outside the first spike.
