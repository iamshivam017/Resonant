# Security Review: RESONANT Phase 4 working-tree changes

## Scope

Parent-agent review of the Phase 4 working-tree changes against base commit
`4884418c8ba43fbdc962e86d383a220bc9d3a774`. The review covered every changed or new
application source file and followed current microphone observations through collection,
comparison, validation, IndexedDB migration/write/read, and result rendering. Tests,
configuration, specification, and owning documentation were checked for contradictory
security or privacy claims.

The Codex Security workbench was invoked but could not resolve this Windows checkout's
`HEAD` because its internal Git process rejected the directory ownership. No workbench scan
or sealed manifest is claimed. The plugin preflight returned `ready` with the documented
parent-review fallback because delegated workers are disabled for this task. Daybreak
access was `not_granted`; this did not gate the fallback review.

### Scan summary

| Field | Value |
|---|---|
| Reportable findings | 0 |
| Coverage | Complete for the Phase 4 working-tree diff and directly supporting boundaries |
| Validation mode | Source tracing plus deterministic unit/component/browser/build checks |
| Production dependency audit | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities |

## Threat model

The complete Phase 4 threat model is recorded in [threat_model.md](threat_model.md).

## Findings

### No findings

No plausible vulnerability survived review. The changed path has no remote input or network
sink, introduces no secret or executable-content handling, reuses explicit browser microphone
permission, and persists only validated scalar evidence. Exact baseline relationship checks
and fail-closed quality/numeric validation prevent ordinary UI flows from attributing a scan
to an incompatible reference. React renders operator text without an HTML injection sink.

## Reviewed surfaces

| Surface | Risk area | Outcome | Notes |
|---|---|---|---|
| Capture → comparison | invalid sensor evidence | No issue found | Existing rejection states and advancing-observation requirement are reused |
| Comparison math | non-finite or fabricated result | No issue found | Four native-unit deviations only; consistency validation; composite remains null |
| Scan repository | provenance/integrity | No issue found | Exact active reference is checked immediately before write; orphaned loads fail closed |
| IndexedDB v2 | destructive migration/data retention | No issue found | Additive `scans` store; browser test preserved a seeded schema-v1 machine |
| Persistence boundary | raw microphone data disclosure | No issue found | Allowlisted reconstruction excludes audio and time/frequency arrays |
| Result UI | XSS/unsupported safety claims | No issue found | React text rendering; no HTML sink; explicit non-diagnostic language |
| Application integration | unintended external transmission | No issue found | No fetch, XHR, WebSocket, credential, telemetry, or external integration added |
| Changed repository content | secrets/junk/dependencies | No issue found | Pattern inspection and production audit found no secret or vulnerable production package |

## Residual limitations

- Anyone with access to the same browser profile can access local machine metadata and
  feature summaries; user-facing deletion/export and shared-device policy are not implemented.
- A same-origin script compromise would inherit IndexedDB access; CSP/hosting controls remain
  part of broader deployment hardening.
- Physical microphone, browser API, storage quota/eviction, and interruption behavior remain
  `MANUAL DEVICE VERIFICATION REQUIRED` across real devices.
- Scientific reference adequacy and every similarity/condition threshold remain
  `UNKNOWN / NEEDS CALIBRATION`; Phase 4 deliberately does not enforce or present them.
