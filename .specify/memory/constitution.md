# RESONANT Constitution

## Core Principles

### I. Evidence Before Claims (NON-NEGOTIABLE)

Every product, technical, benchmark, and competition claim MUST be traceable to
observed behavior, a reproducible experiment, or a cited authoritative source.
Unknown facts MUST be labeled `UNKNOWN / NEEDS VERIFICATION`; planned work MUST be
labeled `TODO`. The project MUST NOT invent sensor readings, datasets, thresholds,
accuracy values, benchmark results, integrations, or capabilities. A command being
attempted is not evidence that it succeeded.

### II. Real Sensor Data and Fail-Closed Measurement

Production measurement paths MUST use real device sensor input. Synthetic fixtures
MAY be used only inside tests and MUST be unmistakably identified as test data.
Unsupported sensors, denied permissions, interrupted streams, insufficient samples,
and invalid measurements MUST produce an explicit unavailable or degraded state.
They MUST NOT silently fall back to fabricated data or a credible-looking score.

### III. Machine- and State-Specific Interpretation

Baselines, comparisons, and condition results MUST be scoped to a defined machine,
sensor configuration, and operating state. The system MUST surface incompatibility
instead of comparing observations gathered under materially different conditions.
Condition outputs MUST include the evidence and data-quality context needed to
understand them, and MUST NOT be presented as a diagnosis without validated support.

### IV. Test-First, Reproducible Engineering

Behavioral production changes MUST follow red-green-refactor: write a focused test,
confirm that it fails for the intended reason, implement the smallest passing change,
then refactor while keeping the suite green. Research and DSP experiments MUST record
inputs, parameters, environment, outputs, and limitations sufficiently for another
contributor to reproduce them. Validation depth MUST be proportional to risk, with
targeted checks mandatory for contracts, shared types, data integrity, security,
configuration, dependencies, build tooling, CI/CD, and deployment behavior.

### V. Privacy and Security by Default

Raw sensor data MUST remain local by default and MUST NOT leave the device without an
explicit, documented user action and purpose. The project MUST minimize collection,
retention, permissions, and exposed metadata. Secrets MUST remain server-side or in
approved secret storage; they MUST never enter source control, client bundles, logs,
examples, screenshots, or fixtures. Security-sensitive failures MUST be explicit and
fail closed. Threat boundaries and mitigations MUST be updated when architecture or
external integrations change.

### VI. P0 Reliability and Instrument-Grade UX

The first usable release MUST prioritize a trustworthy sensing loop over feature
breadth: clear permission and compatibility states, visible capture quality, honest
confidence, recoverable errors, and a dependable demonstration path. The interface
MUST communicate what is measured, what is inferred, and what remains unknown. P1+
features MUST NOT delay or destabilize the P0 critical path unless a documented
decision shows that the tradeoff is necessary.

## Product and Engineering Constraints

- Spec Kit artifacts are authoritative for each implementation unit and MUST progress
  through constitution, specification, clarification when needed, plan, tasks,
  analysis, implementation, and convergence.
- `AGENTS.md` contains permanent repository rules and MUST be read before work begins.
  More specific instructions MAY add constraints but MUST NOT weaken this constitution.
- Technology choices MUST be justified in the relevant implementation plan; no stack
  is selected solely by convention or convenience.
- The repository MUST preserve user work, use dedicated branches, keep meaningful
  commits, and never rewrite shared history or merge the default branch without
  explicit authorization.
- Generated output, credentials, local environment files, large datasets, and machine-
  specific artifacts MUST NOT be committed unless an explicit, reviewed requirement
  says otherwise.
- Documentation MUST change with the behavior, contract, architecture, security model,
  setup, or operational workflow it describes.

## Development Workflow and Quality Gates

1. Inspect current repository state and existing diffs before changing files.
2. Express user value and measurable acceptance criteria in a feature specification
   before choosing implementation details.
3. Record architecture, data contracts, security boundaries, failure behavior, test
   strategy, and deployment implications in the plan before implementation.
4. Derive dependency-ordered tasks from the approved specification and plan; resolve
   critical inconsistencies before coding.
5. Apply test-first development to production behavior and run the smallest relevant
   validation at routine checkpoints.
6. Before a feature checkpoint, run its affected tests, type checks, linting, builds,
   schema or contract checks, and critical-path smoke checks as applicable.
7. Before final submission, review the complete diff and commit history; run every
   applicable local validation; inspect for secrets, junk, generated files, and
   unrelated changes; then verify the exact remote commit after pushing.

A feature MUST NOT be described as complete when required acceptance evidence is
missing, a current-work failure remains, or the remote/CI/deployment state was not
actually verified. Unavailable validation MUST be reported as `UNVERIFIED` with the
reason. Pre-existing failures MUST be distinguished from failures introduced by the
current work.

## Governance

This constitution is the highest project-level engineering policy. Specifications,
plans, tasks, reviews, and implementation decisions MUST include a constitution check.
When another project document conflicts with it, this constitution prevails until an
amendment is approved.

Amendments require: a written rationale; identification of affected artifacts and
adoption work; an entry in `docs/execution/DECISIONS.md`; and explicit project-owner
approval. Versioning follows semantic versioning: MAJOR for incompatible governance
changes or removed principles, MINOR for new principles or materially expanded
obligations, and PATCH for clarifications that do not change requirements.

Every review MUST verify that evidence is current, unknowns remain explicit, privacy
and security boundaries are honored, tests demonstrate changed behavior, and any
complexity is justified by the approved scope. Compliance exceptions MUST be narrow,
time-bounded, documented with risk and remediation, and explicitly approved.

**Version**: 1.0.0 | **Ratified**: 2026-09-13 | **Last Amended**: 2026-09-13
