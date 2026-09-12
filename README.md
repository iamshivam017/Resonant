# RESONANT

**Listen before it breaks.**

RESONANT is a smartphone-powered machine condition-change monitoring project. It is
designed to learn a machine-specific known-normal acoustic/vibration baseline and
compare later real sensor observations with that baseline. It reports similarity,
deviation, evidence, and uncertainty—not percentage machine health or universal diagnosis.

## Current status

The repository is in the Phase 1 physical-evidence gate. The first Spec Kit feature and
its browser implementation are present on `bootstrap/repository-foundation`. Local
automated checks and the production build pass; physical-device and deployed HTTPS
acceptance remain `UNKNOWN / NEEDS VERIFICATION`. The implemented slice is deliberately
narrow:

```text
real phone microphone
→ explicit permission
→ live waveform
→ live spectrum
→ strongest observed frequency bin
→ honest quality/error state
```

No sensor, benchmark, condition, or accuracy result is claimed until it has actually
been measured and recorded.

## Repository map

| Path | Purpose |
|---|---|
| `AGENTS.md` | Permanent engineering and evidence rules |
| `.specify/memory/constitution.md` | Versioned Spec Kit governance |
| `specs/001-real-sensor-spike/` | Requirements, plan, contracts, tasks, and validation guide for the first slice |
| `app/` | Selected Product Design mobile React/Vite runtime and real microphone spike |
| `docs/PRD.md` | Product scope, users, priorities, and safety boundaries |
| `docs/ARCHITECTURE.md` | Components, trust boundaries, data model, deployment, and risks |
| `docs/DSP_PIPELINE.md` | Capture, signal processing, features, quality, and parity |
| `docs/BASELINE_ENGINE.md` | Known-normal commissioning and compatibility |
| `docs/CONDITION_SCORING.md` | Transparent distance/calibration methodology |
| `docs/BENCHMARK_STRATEGY.md` | Labelled dataset evaluation and reproducibility |
| `docs/UX_SPEC.md` | Information architecture, flows, states, and visual direction |
| `docs/SECURITY_PRIVACY.md` | Data handling, threat model, permissions, and controls |
| `docs/TEST_STRATEGY.md` | Test layers, evidence boundaries, and validation cadence |
| `docs/execution/` | Roadmap, active phase, and major decisions |

## Spec Kit workflow

Spec Kit 1.0.6 is initialized with the Codex integration. Feature development follows:

```text
constitution → specification → clarification when needed → plan → tasks
→ analysis → implementation → convergence
```

The active local feature pointer is machine-local and intentionally ignored by Git.

## Development prerequisites

The selected Product Design mobile runtime requires Node.js 24 or newer and npm 10.
Application commands run from `app/`; use `npm install`, `npm run dev`, and the validation
commands in `specs/001-real-sensor-spike/quickstart.md`.

Phone sensor verification requires an HTTPS deployment. `localhost` is useful for
desktop development but is not evidence that the deployed smartphone path works.

## Environment configuration

The microphone spike needs no environment variables. Copying `.env.example` is not
required yet. Future optional integrations must document safe variable names there
only when their owning feature is implemented; real values belong in ignored local or
deployment secret storage.

## Privacy and data policy

The first spike processes microphone frames locally and ephemerally. It does not store
or transmit raw audio. Permission must follow an explicit user action, microphone use
must remain visible, and stop/navigation/failure must release capture resources.

## Benchmark policy

The proposed benchmark uses the DCASE 2020 Task 2 methodology with MIMII/ToyADMOS data.
Large archives stay outside Git. Metrics may be published only from a successful,
manifest-bound, reproducible run and must not be represented as smartphone performance.

## Contributing

Read `AGENTS.md`, the relevant owning document, the current feature specification, and
the constitution before editing a subsystem. Preserve user work, use the dedicated
branch, follow test-first development for production behavior, and never claim a
validation or external action passed without direct evidence.

## Known limitations

- Target device/browser microphone compatibility is `UNKNOWN / NEEDS VERIFICATION`.
- No physical sensor acceptance run, calibrated baseline, condition score, benchmark
  result, verified HTTPS deployment, Featherless integration, or Sentry runtime exists yet.
- Browser IMU support is fragmented and remains a progressive enhancement.
- VoltHacks eligibility wording conflicts across official pages and requires organizer confirmation.
