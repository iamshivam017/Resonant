import type { Baseline, BaselineCapture, Machine, OperatingState } from "./types";

function required(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0)
    throw new Error(`${label} is required`);
  return value.trim();
}

function timestamp(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number`);
  }
  return value;
}

function optional(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function validateMachine(value: Machine): Machine {
  return {
    id: required(value.id, "Machine id"),
    name: required(value.name, "Machine name"),
    category: required(value.category, "Machine category"),
    manufacturer: optional(value.manufacturer),
    model: optional(value.model),
    notes: optional(value.notes),
    createdAt: timestamp(value.createdAt, "Machine creation time"),
  };
}

export function validateOperatingState(value: OperatingState): OperatingState {
  return {
    id: required(value.id, "Operating state id"),
    machineId: required(value.machineId, "Machine id"),
    name: required(value.name, "Operating state name"),
    notes: optional(value.notes),
    createdAt: timestamp(value.createdAt, "Operating state creation time"),
  };
}

export function validateCapture(value: BaselineCapture): BaselineCapture {
  required(value.id, "Capture id");
  required(value.machineId, "Machine id");
  required(value.operatingStateId, "Operating state id");
  if (value.observationCount < 2 || value.durationMs <= 0)
    throw new Error("Capture is structurally insufficient");
  for (const number of Object.values(value.features)) {
    if (!Number.isFinite(number)) throw new Error("Capture features must be finite");
  }
  return structuredClone(value);
}

export function validateBaseline(value: Baseline): Baseline {
  required(value.id, "Baseline id");
  required(value.machineId, "Machine id");
  required(value.operatingStateId, "Operating state id");
  if (!Number.isInteger(value.version) || value.version < 1)
    throw new Error("Baseline version is invalid");
  if (value.sourceCaptures.length < 2) throw new Error("Baseline requires multiple captures");
  return structuredClone(value);
}
