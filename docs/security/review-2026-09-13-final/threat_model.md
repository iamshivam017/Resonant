The browser receives raw microphone frames only after an explicit user action, processes
them in memory, and must stop every owned resource on stop, interruption, failure, or
teardown. Security-critical assets are microphone permission, raw audio frames, observed
signal evidence, and capture lifecycle integrity. The principal risks are hidden capture,
late permission races, stale evidence, raw-frame persistence or transmission, unsafe
browser error disclosure, production test-fixture inclusion, and insecure hosting.

Trust boundaries are the operator to browser permission UI, MediaDevices to the in-memory
Web Audio graph, and the static application to its future deployment host. A local source
review cannot validate a provider's HTTPS headers or physical-browser suspension behavior.
