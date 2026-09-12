# RESONANT Decision Record

## Purpose

Record major technical and product decisions, their context, alternatives, rationale, consequences, and status.

## Decision format

Each future record should include an identifier, date, status, context, decision, rationale, alternatives considered, and consequences.

## Bootstrap decisions

### ADR-0001: Establish repository governance before feature work

- **Date:** 2026-09-13
- **Status:** Accepted
- **Context:** RESONANT is a new project and needs stable engineering rules and clear documentation ownership before technical choices or application work begin.
- **Decision:** Use a root `AGENTS.md`, the defined `docs/` responsibility map, conservative repository hygiene files, and a dedicated `bootstrap/repository-foundation` branch. Defer application stack and architecture selection to Phase 1.
- **Rationale:** This makes evidence, terminology, scope, and unresolved questions explicit while avoiding premature technical commitments.
- **Consequences:** Feature work does not begin during Phase 0. Technical unknowns remain marked for verification.

## TODO

- Add records only when a genuine major decision is made.

## UNKNOWN / NEEDS VERIFICATION

- No application architecture decisions have been made.
