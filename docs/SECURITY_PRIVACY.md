# RESONANT Security and Privacy

## Purpose

Define sensor permissions, data classification, collection, storage, retention, transport, secrets, user controls, and privacy requirements.

## Currently known project facts

- RESONANT will process microphone and vibration-related sensor data.
- Secrets must never be exposed or committed.
- Sensor or API behavior must not be assumed without authoritative verification.

## TODO

- Define permission rationale and failure behavior, data-flow inventory, threat boundaries, retention, deletion, access control, and incident-safe logging.
- Maintain `.env.example` and `.gitignore` as integrations are introduced.

## UNKNOWN / NEEDS VERIFICATION

- Processing location, persistence, identity model, applicable privacy obligations, third parties, encryption requirements, and retention periods.
