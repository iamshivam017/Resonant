# RESONANT Agent Operating Contract

## Product truth

- Project: **RESONANT**.
- Tagline: **“Listen before it breaks.”**
- RESONANT is a smartphone-powered machine condition-change monitoring system.
- The system learns a machine-specific, known-normal acoustic and vibration baseline and detects subsequent deviation from that baseline.
- Describe baseline results as similarity to, or deviation from, the learned baseline. Never describe baseline similarity as percentage machine health.
- Do not claim universal machine-health diagnosis.
- Do not invent universal Hz or frequency thresholds. Thresholds must be supported by verified evidence and calibrated for the specific context.

## Evidence and data integrity

- Never fabricate sensor readings, anomaly results, benchmark results, accuracy, industrial thresholds, API responses, sponsor requirements, or machine condition.
- Use real sensor data in real and demo paths. Never add random or fake IoT telemetry.
- Search authoritative technical documentation before assuming APIs, browser capabilities, datasets, standards, or external contracts.
- Keep unknown values explicitly marked as unknown until they are verified.
- Fail explicitly when a required operation or fact is unavailable; never present fake success.

## Engineering practice

- Preserve useful existing code and avoid unnecessary rewrites.
- Prefer simple, reliable engineering over unnecessary complexity.
- Prioritize P0 functionality before P1 or P2 features.
- Reliability and demo correctness take priority over decorative polish.
- The application must feel like a professional engineering instrument, not a generic AI-generated SaaS dashboard.
- Do not silently change product definitions or technical contracts.
- Document every major architecture decision in `docs/execution/DECISIONS.md`.

## Security and repository hygiene

- Never expose or commit secrets.
- Maintain `.env.example` with documented variable names and safe placeholder values only.
- Maintain `.gitignore` so secrets, local state, generated files, and build artifacts are not committed.

## Documentation and validation

- Read the relevant specification under `docs/` before modifying a subsystem.
- Keep documentation synchronized with the implementation.
- Run the relevant lint, typecheck, tests, and production build before meaningful commits when those commands exist.
- Never claim validation passed unless the corresponding command actually ran successfully.

## Scope of instructions

This root file applies to the entire repository. More specific nested `AGENTS.md` files may be introduced later only where genuinely useful; they must refine, not silently contradict, this contract.
