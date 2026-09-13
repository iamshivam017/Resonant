import type {
  Baseline,
  BaselineAggregate,
  BaselineCapture,
  BaselineData,
  Machine,
  OperatingState,
} from "./types";
import {
  validateBaseline,
  validateCapture,
  validateMachine,
  validateOperatingState,
} from "./validation";

export interface BaselineStorage {
  readAll(): Promise<BaselineData>;
  put(
    store: keyof Omit<BaselineData, "baselines">,
    value: Machine | OperatingState | BaselineCapture,
  ): Promise<void>;
  commitBaselineVersion(next: Baseline, supersedeIds: string[]): Promise<void>;
}

const emptyData = (): BaselineData => ({
  machines: [],
  operatingStates: [],
  captures: [],
  baselines: [],
});

export class InMemoryBaselineStorage implements BaselineStorage {
  private data = emptyData();
  async readAll() {
    return structuredClone(this.data);
  }
  async put(
    store: keyof Omit<BaselineData, "baselines">,
    value: Machine | OperatingState | BaselineCapture,
  ) {
    const records = this.data[store] as (Machine | OperatingState | BaselineCapture)[];
    const index = records.findIndex(({ id }) => id === value.id);
    if (index >= 0) records[index] = structuredClone(value);
    else records.push(structuredClone(value));
  }
  async commitBaselineVersion(next: Baseline, supersedeIds: string[]) {
    this.data.baselines = this.data.baselines.map((item) =>
      supersedeIds.includes(item.id) ? { ...item, status: "superseded" } : item,
    );
    this.data.baselines.push(structuredClone(next));
  }
}

export class BaselineRepository {
  constructor(
    private storage: BaselineStorage,
    private now: () => number,
    private makeId: () => string,
  ) {}

  async loadAll(): Promise<BaselineData> {
    const data = await this.storage.readAll();
    const validated = {
      machines: data.machines.map(validateMachine),
      operatingStates: data.operatingStates.map(validateOperatingState),
      captures: data.captures.map(validateCapture),
      baselines: data.baselines.map(validateBaseline),
    };
    const machineIds = new Set(validated.machines.map(({ id }) => id));
    if (validated.operatingStates.some(({ machineId }) => !machineIds.has(machineId))) {
      throw new Error("Persisted operating state does not match a machine");
    }
    const states = new Map(validated.operatingStates.map((state) => [state.id, state.machineId]));
    if (
      validated.captures.some(
        ({ machineId, operatingStateId }) => states.get(operatingStateId) !== machineId,
      )
    ) {
      throw new Error("Persisted capture does not match its machine and operating state");
    }
    if (
      validated.baselines.some(
        ({ machineId, operatingStateId }) => states.get(operatingStateId) !== machineId,
      )
    ) {
      throw new Error("Persisted baseline does not match its machine and operating state");
    }
    return validated;
  }

  async saveMachine(machine: Machine) {
    const value = validateMachine(machine);
    await this.storage.put("machines", value);
    return value;
  }

  async saveOperatingState(state: OperatingState) {
    const value = validateOperatingState(state);
    const data = await this.loadAll();
    if (!data.machines.some(({ id }) => id === value.machineId))
      throw new Error("Machine does not exist");
    await this.storage.put("operatingStates", value);
    return value;
  }

  async saveCapture(capture: BaselineCapture) {
    const value = validateCapture(capture);
    const data = await this.loadAll();
    if (
      !data.operatingStates.some(
        ({ id, machineId }) => id === value.operatingStateId && machineId === value.machineId,
      )
    ) {
      throw new Error("Capture does not match a saved machine and operating state");
    }
    await this.storage.put("captures", value);
    return value;
  }

  async activateBaseline(
    aggregate: BaselineAggregate,
    knownNormalConfirmedAt: number,
    manualConsistencyConfirmedAt: number,
  ) {
    const data = await this.loadAll();
    const savedCaptureIds = new Set(data.captures.map(({ id }) => id));
    if (aggregate.sourceCaptures.some(({ id }) => !savedCaptureIds.has(id))) {
      throw new Error("Source captures are not persisted");
    }
    if (
      !Number.isFinite(knownNormalConfirmedAt) ||
      !Number.isFinite(manualConsistencyConfirmedAt)
    ) {
      throw new Error("Baseline confirmations are required");
    }
    const matching = data.baselines.filter(
      ({ machineId, operatingStateId }) =>
        machineId === aggregate.machineId && operatingStateId === aggregate.operatingStateId,
    );
    const next = validateBaseline({
      ...structuredClone(aggregate),
      id: this.makeId(),
      version: Math.max(0, ...matching.map(({ version }) => version)) + 1,
      status: "active",
      createdAt: this.now(),
      knownNormalConfirmedAt,
      manualConsistencyConfirmedAt,
    });
    await this.storage.commitBaselineVersion(
      next,
      matching.filter(({ status }) => status === "active").map(({ id }) => id),
    );
    return next;
  }
}
