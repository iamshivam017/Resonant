import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/App";

describe("Prototype", () => {
  it("renders the sensing surface without requesting microphone access", () => {
    const getUserMedia = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia, getSupportedConstraints: () => ({}) },
    });

    render(<App />);

    expect(screen.getByRole("button", { name: "Start sensing" })).toBeInTheDocument();
    expect(getUserMedia).not.toHaveBeenCalled();
  });
});
