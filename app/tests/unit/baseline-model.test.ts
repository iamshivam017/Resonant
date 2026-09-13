import { describe, expect, it } from "vitest";
import { validateMachine, validateOperatingState } from "../../src/features/baseline/validation";

describe("baseline entity validation", () => {
  it("normalizes a machine and preserves optional identity details", () => {
    expect(
      validateMachine({
        id: "machine-1",
        name: "  Exhaust Fan  ",
        category: " fan ",
        manufacturer: " Acme ",
        model: " F-10 ",
        notes: " north bay ",
        createdAt: 100,
      }),
    ).toEqual({
      id: "machine-1",
      name: "Exhaust Fan",
      category: "fan",
      manufacturer: "Acme",
      model: "F-10",
      notes: "north bay",
      createdAt: 100,
    });
  });

  it("rejects missing required machine and state fields", () => {
    expect(() => validateMachine({ id: "", name: "", category: "fan", createdAt: 1 })).toThrow(
      "Machine id is required",
    );
    expect(() =>
      validateOperatingState({ id: "state-1", machineId: "", name: "Normal", createdAt: 1 }),
    ).toThrow("Machine id is required");
  });
});
