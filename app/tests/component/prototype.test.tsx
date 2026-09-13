import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/App";

describe("Prototype", () => {
  it("opens baseline setup without requesting microphone access", async () => {
    const getUserMedia = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia, getSupportedConstraints: () => ({}) },
    });

    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Local evidence storage is unavailable in this browser",
      ),
    );

    expect(screen.getByRole("heading", { name: "Identify the machine" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open live sensor" }).closest(".baseline-header"),
    ).not.toBeNull();
    expect(getUserMedia).not.toHaveBeenCalled();
  });
});
