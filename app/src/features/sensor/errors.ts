import type { CaptureError, CaptureErrorCode } from "./types";

const messages: Record<CaptureErrorCode, Omit<CaptureError, "code" | "causeName">> = {
  "permission-denied": {
    summary: "Microphone access was not granted.",
    recovery: "Allow microphone access in browser settings, then try again.",
  },
  unsupported: {
    summary: "Live microphone capture is unavailable here.",
    recovery: "Open this page over HTTPS in a browser that supports microphone capture.",
  },
  "device-unavailable": {
    summary: "No available microphone was found.",
    recovery: "Connect or enable a microphone, then try again.",
  },
  "constraint-failed": {
    summary: "The microphone could not satisfy the requested capture settings.",
    recovery: "Choose another input device or review its operating-system settings.",
  },
  interrupted: {
    summary: "The live microphone session ended unexpectedly.",
    recovery: "Check the input device connection, then start sensing again.",
  },
  "processing-failed": {
    summary: "Live sound processing could not start.",
    recovery: "Stop other audio applications, reload the page, and try again.",
  },
};

export function mapCaptureError(cause: unknown): CaptureError {
  const name =
    typeof cause === "object" && cause && "name" in cause ? String(cause.name) : undefined;
  const code: CaptureErrorCode =
    name === "NotAllowedError" || name === "SecurityError"
      ? "permission-denied"
      : name === "NotFoundError" || name === "NotReadableError"
        ? "device-unavailable"
        : name === "OverconstrainedError"
          ? "constraint-failed"
          : name === "NotSupportedError"
            ? "unsupported"
            : name === "AbortError"
              ? "interrupted"
              : "processing-failed";
  return { code, causeName: name, ...messages[code] };
}

export function interruptedCaptureError(): CaptureError {
  return { code: "interrupted", ...messages.interrupted };
}
