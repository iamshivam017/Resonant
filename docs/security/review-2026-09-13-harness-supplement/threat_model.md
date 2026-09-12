The supplemental change runs only in the local test harness. Relevant risks are shell
injection, exposing the development server beyond loopback, allowing test-only
configuration into production behavior, leaving child processes alive, and masking a
failing browser suite. The orchestrator invokes the pinned local Playwright CLI with
spawn argument arrays, binds Vite to 127.0.0.1, propagates the child exit code, closes
the Vite server in a finally block, and is referenced only by the development test
script.
