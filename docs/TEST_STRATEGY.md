# RESONANT Test Strategy

## Purpose

Define testing layers, representative scenarios, data provenance, acceptance strategy, tooling, environments, and evidence required for release claims.

## Currently known project facts

- Relevant lint, typecheck, tests, and production build must run successfully before meaningful commits when those commands exist.
- Validation must never be claimed unless it actually ran successfully.
- Real sensor data is required in real and demo paths; fabricated telemetry is prohibited.

## TODO

- Define unit, integration, device, signal-processing, end-to-end, security, accessibility, and demo acceptance coverage after architecture selection.
- Define approved test fixtures and provenance requirements without presenting fixtures as live sensor readings.

## UNKNOWN / NEEDS VERIFICATION

- Toolchain, supported devices, CI environment, coverage targets, performance budgets, test datasets, and release gates.
