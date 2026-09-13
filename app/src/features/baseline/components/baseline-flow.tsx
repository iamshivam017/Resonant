import { CheckIcon, ChevronLeftIcon, PlusIcon } from "@radix-ui/react-icons";
import {
  createContext,
  type FormEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { SensorInstrument } from "../../sensor/components/sensor-instrument";
import type { CaptureSessionController } from "../../sensor/capture-session";
import {
  FlowStack,
  KeyboardInput,
  KeyboardTextarea,
  MobileScroll,
  type FlowControls,
  type FlowScreen,
} from "../../../mobile";
import { aggregateBaseline } from "../aggregation";
import { captureRejectionMessage, createBaselineCaptureCollector } from "../capture-collector";
import type { Baseline, BaselineCapture, BaselineData, Machine, OperatingState } from "../types";
import type { BaselineRepository } from "../repository";

interface BaselineFlowProps {
  controller: CaptureSessionController;
  repository: BaselineRepository;
  makeId?: () => string;
  now?: () => number;
  onOpenSensor?: () => void;
  onRunComparison?: (machine: Machine, state: OperatingState, baseline: Baseline) => void;
}

interface WorkflowState {
  controller: CaptureSessionController;
  repository: BaselineRepository;
  makeId: () => string;
  now: () => number;
  machine?: Machine;
  operatingState?: OperatingState;
  knownNormalConfirmedAt?: number;
  captures: BaselineCapture[];
  baseline?: Baseline;
  setMachine: (value: Machine) => void;
  setOperatingState: (value: OperatingState) => void;
  setKnownNormalConfirmedAt: (value: number) => void;
  addCapture: (value: BaselineCapture) => void;
  setBaseline: (value: Baseline) => void;
  beginRecalibration: (machine: Machine, state: OperatingState) => void;
  onOpenSensor?: () => void;
  onRunComparison?: (machine: Machine, state: OperatingState, baseline: Baseline) => void;
}

const WorkflowContext = createContext<WorkflowState | null>(null);
const useWorkflow = () => {
  const value = useContext(WorkflowContext);
  if (!value) throw new Error("Baseline workflow context is unavailable");
  return value;
};

function Header({ flow, title }: { flow: FlowControls; title: string }) {
  const { onOpenSensor } = useWorkflow();
  return (
    <div className="baseline-header">
      {flow.canGoBack ? (
        <button type="button" className="icon-button" aria-label="Go back" onClick={flow.pop}>
          <ChevronLeftIcon />
        </button>
      ) : (
        <span className="header-spacer" />
      )}
      <strong>{title}</strong>
      {onOpenSensor ? (
        <button type="button" className="header-action" onClick={onOpenSensor}>
          Open live sensor
        </button>
      ) : (
        <span className="header-spacer" />
      )}
    </div>
  );
}

const wrap = (
  id: string,
  title: string,
  content: (flow: FlowControls) => React.ReactNode,
): FlowScreen => ({
  id,
  title,
  header: (flow) => <Header flow={flow} title={title} />,
  headerHeight: 52,
  render: (flow) => <MobileScroll className="baseline-screen">{content(flow)}</MobileScroll>,
});

function Intro({ step, title, copy }: { step: string; title: string; copy: string }) {
  return (
    <header className="baseline-intro">
      <p>{step}</p>
      <h1>{title}</h1>
      <span>{copy}</span>
    </header>
  );
}

function MachineSetup({ flow }: { flow: FlowControls }) {
  const workflow = useWorkflow();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState<BaselineData>();
  useEffect(() => {
    void workflow.repository
      .loadAll()
      .then(setSaved)
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Local evidence could not be loaded"),
      );
  }, [workflow.repository]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    try {
      const machine = await workflow.repository.saveMachine({
        id: workflow.makeId(),
        name,
        category,
        manufacturer,
        model,
        notes,
        createdAt: workflow.now(),
      });
      workflow.setMachine(machine);
      flow.push(stateScreen);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Machine could not be saved");
    }
  };
  const activeBaselines = saved?.baselines.filter(({ status }) => status === "active") ?? [];
  return (
    <>
      <Intro
        step="01 / Machine setup"
        title="Identify the machine"
        copy="Baseline evidence stays bound to this machine and its selected operating state."
      />
      {activeBaselines.length > 0 ? (
        <section className="stored-baselines">
          <h2>Stored baselines</h2>
          {activeBaselines.map((baseline) => {
            const storedMachine = saved?.machines.find(({ id }) => id === baseline.machineId);
            const state = saved?.operatingStates.find(({ id }) => id === baseline.operatingStateId);
            if (!storedMachine || !state) return null;
            return (
              <article key={baseline.id}>
                <div className="stored-baseline-identity">
                  <strong className="stored-baseline-name">{storedMachine.name}</strong>
                  <span className="stored-baseline-version">
                    {state.name} · Version {baseline.version}
                  </span>
                </div>
                <div className="stored-baseline-actions">
                  {workflow.onRunComparison ? (
                    <button
                      type="button"
                      aria-label={`Compare ${storedMachine.name} · ${state.name}`}
                      onClick={() => workflow.onRunComparison?.(storedMachine, state, baseline)}
                    >
                      Compare
                    </button>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Recalibrate ${storedMachine.name} · ${state.name}`}
                    onClick={() => {
                      workflow.beginRecalibration(storedMachine, state);
                      flow.push(confirmScreen);
                    }}
                  >
                    Recalibrate
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
      <form className="baseline-form" onSubmit={submit}>
        <label htmlFor="machine-name">
          Machine name
          <KeyboardInput
            id="machine-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label htmlFor="machine-category">
          Machine category
          <KeyboardInput
            id="machine-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </label>
        <div className="form-pair">
          <label htmlFor="machine-manufacturer">
            Manufacturer <small className="baseline-optional">optional</small>
            <KeyboardInput
              id="machine-manufacturer"
              value={manufacturer}
              onChange={(event) => setManufacturer(event.target.value)}
            />
          </label>
          <label htmlFor="machine-model">
            Model <small className="baseline-optional">optional</small>
            <KeyboardInput
              id="machine-model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
            />
          </label>
        </div>
        <label htmlFor="machine-notes">
          Placement notes <small className="baseline-optional">optional</small>
          <KeyboardTextarea
            id="machine-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        {error ? (
          <p className="baseline-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="baseline-primary" type="submit">
          Save machine
        </button>
      </form>
    </>
  );
}

function StateSetup({ flow }: { flow: FlowControls }) {
  const workflow = useWorkflow();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string>();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!workflow.machine) return;
    try {
      const state = await workflow.repository.saveOperatingState({
        id: workflow.makeId(),
        machineId: workflow.machine.id,
        name,
        notes,
        createdAt: workflow.now(),
      });
      workflow.setOperatingState(state);
      flow.push(confirmScreen);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Operating state could not be saved");
    }
  };
  return (
    <>
      <Intro
        step="02 / Operating state"
        title="Name the normal state"
        copy={`Machine: ${workflow.machine?.name ?? "Unavailable"}`}
      />
      <form className="baseline-form" onSubmit={submit}>
        <label htmlFor="operating-state-name">
          Operating state name
          <KeyboardInput
            id="operating-state-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label htmlFor="operating-state-notes">
          State and placement notes <small className="baseline-optional">optional</small>
          <KeyboardTextarea
            id="operating-state-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        {error ? (
          <p className="baseline-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="baseline-primary" type="submit">
          Save operating state
        </button>
      </form>
    </>
  );
}

function Confirmation({ flow }: { flow: FlowControls }) {
  const workflow = useWorkflow();
  const [confirmed, setConfirmed] = useState(false);
  return (
    <>
      <Intro
        step="03 / Operator confirmation"
        title="Confirm known-normal operation"
        copy={`${workflow.machine?.name} · ${workflow.operatingState?.name}`}
      />
      <section className="truth-panel">
        <strong>Operator evidence only</strong>
        <p>
          This confirmation records your observation. It is not a certified health assessment or
          diagnosis.
        </p>
      </section>
      <label className="confirmation-row">
        <input
          type="checkbox"
          checked={confirmed}
          aria-label="Machine is operating in the selected known-normal state"
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        <span className={confirmed ? "check is-checked" : "check"}>
          {confirmed ? <CheckIcon /> : null}
        </span>
        <span>I confirm the machine is operating in the selected known-normal state.</span>
      </label>
      <button
        className="baseline-primary"
        type="button"
        disabled={!confirmed}
        onClick={() => {
          workflow.setKnownNormalConfirmedAt(workflow.now());
          flow.push(sensorScreen);
        }}
      >
        Confirm and check sensor
      </button>
    </>
  );
}

function SensorCheck({ flow }: { flow: FlowControls }) {
  const { controller } = useWorkflow();
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  const valid =
    snapshot.state === "active" &&
    snapshot.frame?.quality === "valid" &&
    snapshot.observation?.freshness === "valid";
  return (
    <>
      <Intro
        step="04 / Sensor check"
        title="Verify live input"
        copy="Values below come only from the current microphone stream and remain on this device."
      />
      <SensorInstrument controller={controller} stopOnUnmount={false} />
      <button
        className="baseline-primary"
        type="button"
        disabled={!valid}
        onClick={() => flow.push(captureScreen)}
      >
        Continue to baseline captures
      </button>
    </>
  );
}

function CaptureScreen({ flow }: { flow: FlowControls }) {
  const workflow = useWorkflow();
  const [collecting, setCollecting] = useState(false);
  const [message, setMessage] = useState<string>();
  const collector = useMemo(
    () => createBaselineCaptureCollector({ makeId: workflow.makeId, now: workflow.now }),
    [workflow.makeId, workflow.now],
  );
  const unsubscribe = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => unsubscribe.current?.(), []);
  const begin = () => {
    if (!workflow.machine || !workflow.operatingState) return;
    setMessage(undefined);
    collector.start(workflow.machine.id, workflow.operatingState.id);
    unsubscribe.current = workflow.controller.subscribe((snapshot) => collector.observe(snapshot));
    setCollecting(true);
  };
  const finish = async () => {
    unsubscribe.current?.();
    unsubscribe.current = undefined;
    const result = collector.finish();
    setCollecting(false);
    if (result.status === "rejected") {
      setMessage(captureRejectionMessage(result.reason));
      return;
    }
    await workflow.repository.saveCapture(result.capture);
    workflow.addCapture(result.capture);
    setMessage(`Accepted capture ${workflow.captures.length + 1}`);
  };
  return (
    <>
      <Intro
        step="05 / Baseline capture"
        title="Collect repeat observations"
        copy="Keep placement and machine state controlled. Add more than two captures when practical."
      />
      <SensorInstrument controller={workflow.controller} stopOnUnmount={false} />
      <section className="capture-ledger">
        <div>
          <span>Accepted captures</span>
          <strong>{workflow.captures.length}</strong>
        </div>
        <p>
          Two captures are only the minimum literal multiple; they are not proof of a scientifically
          reliable baseline.
        </p>
      </section>
      {message ? (
        <p className="baseline-message" role="status">
          {message}
        </p>
      ) : null}
      <button
        className="baseline-primary"
        type="button"
        onClick={collecting ? () => void finish() : begin}
      >
        {collecting ? "Finish baseline capture" : "Begin baseline capture"}
      </button>
      <button
        className="baseline-secondary"
        type="button"
        disabled={collecting || workflow.captures.length < 2}
        onClick={() => {
          void workflow.controller.stop();
          flow.push(reviewScreen);
        }}
      >
        Review baseline
      </button>
    </>
  );
}

const value = (number: number, suffix = "") => `${number.toFixed(3)}${suffix}`;
function RangeReadout({
  title,
  range,
  suffix = "",
}: {
  title: string;
  range: { median: number; min: number; max: number };
  suffix?: string;
}) {
  return (
    <section className="range-table">
      <h2>{title}</h2>
      <dl>
        <div>
          <dt>Median</dt>
          <dd>{value(range.median, suffix)}</dd>
        </div>
        <div>
          <dt>Observed min</dt>
          <dd>{value(range.min, suffix)}</dd>
        </div>
        <div>
          <dt>Observed max</dt>
          <dd>{value(range.max, suffix)}</dd>
        </div>
      </dl>
    </section>
  );
}

function Review({ flow }: { flow: FlowControls }) {
  const workflow = useWorkflow();
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string>();
  const aggregate = useMemo(() => aggregateBaseline(workflow.captures), [workflow.captures]);
  const activate = async () => {
    if (!workflow.knownNormalConfirmedAt) return;
    try {
      const baseline = await workflow.repository.activateBaseline(
        aggregate,
        workflow.knownNormalConfirmedAt,
        workflow.now(),
      );
      workflow.setBaseline(baseline);
      flow.push(createdScreen);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Baseline could not be stored");
    }
  };
  return (
    <>
      <Intro
        step="06 / Manual review"
        title="Review observed spread"
        copy="No automatic consistency threshold is calibrated. Compare every source before activation."
      />
      <RangeReadout title="RMS amplitude range" range={aggregate.features.rms} />
      <RangeReadout title="Peak amplitude range" range={aggregate.features.peak} />
      <RangeReadout
        title="Dominant spectral peak movement"
        range={aggregate.features.dominantFrequencyHz}
        suffix=" Hz"
      />
      <RangeReadout title="Dominant bin range" range={aggregate.features.dominantBin} />
      <section className="capture-sources" aria-label="Source capture summaries">
        {aggregate.sourceCaptures.map((capture, index) => (
          <article key={capture.id}>
            <strong className="capture-source-title">Capture {index + 1}</strong>
            <span>{value(capture.features.rms)} RMS</span>
            <span>{value(capture.features.peak)} peak</span>
            <span>{value(capture.features.dominantFrequencyHz, " Hz")}</span>
            <span>FFT bin {value(capture.features.dominantBin)}</span>
            <small className="capture-source-meta">
              {capture.observationCount} observations · {value(capture.durationMs / 1_000, " s")}
            </small>
          </article>
        ))}
      </section>
      <label className="confirmation-row">
        <input
          type="checkbox"
          checked={confirmed}
          aria-label="I manually reviewed capture consistency"
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        <span className={confirmed ? "check is-checked" : "check"}>
          {confirmed ? <CheckIcon /> : null}
        </span>
        <span>
          I manually reviewed capture consistency and accept the observed variation for this
          operator-defined baseline.
        </span>
      </label>
      {error ? (
        <p className="baseline-error" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="baseline-primary"
        type="button"
        disabled={!confirmed}
        onClick={() => void activate()}
      >
        Activate versioned baseline
      </button>
      <button className="baseline-secondary" type="button" onClick={() => flow.pop()}>
        <PlusIcon /> Add another capture
      </button>
    </>
  );
}

function Created() {
  const { baseline, machine, operatingState } = useWorkflow();
  return (
    <>
      <Intro
        step="07 / Baseline created"
        title="Baseline created"
        copy={`${machine?.name} · ${operatingState?.name}`}
      />
      <section className="baseline-success">
        <CheckIcon />
        <strong>Version {baseline?.version}</strong>
        <p>
          Stored locally with {baseline?.sourceCaptures.length} source captures. Raw audio was not
          retained.
        </p>
      </section>
      <section className="truth-panel">
        <strong>Interpretation boundary</strong>
        <p>
          This baseline records operator-confirmed known-normal evidence. It is not a health score,
          anomaly result, or diagnosis.
        </p>
      </section>
    </>
  );
}

const machineScreen = wrap("machine", "Machine setup", (flow) => <MachineSetup flow={flow} />);
const stateScreen = wrap("state", "Operating state", (flow) => <StateSetup flow={flow} />);
const confirmScreen = wrap("confirmation", "Known-normal", (flow) => <Confirmation flow={flow} />);
const sensorScreen = wrap("sensor", "Sensor check", (flow) => <SensorCheck flow={flow} />);
const captureScreen = wrap("capture", "Capture", (flow) => <CaptureScreen flow={flow} />);
const reviewScreen = wrap("review", "Review", (flow) => <Review flow={flow} />);
const createdScreen = wrap("created", "Created", () => <Created />);

export function BaselineFlow({
  controller,
  repository,
  makeId = () => crypto.randomUUID(),
  now = () => Date.now(),
  onOpenSensor,
  onRunComparison,
}: BaselineFlowProps) {
  const [machine, setMachine] = useState<Machine>();
  const [operatingState, setOperatingState] = useState<OperatingState>();
  const [knownNormalConfirmedAt, setKnownNormalConfirmedAt] = useState<number>();
  const [captures, setCaptures] = useState<BaselineCapture[]>([]);
  const [baseline, setBaseline] = useState<Baseline>();
  const value = useMemo<WorkflowState>(
    () => ({
      controller,
      repository,
      makeId,
      now,
      machine,
      operatingState,
      knownNormalConfirmedAt,
      captures,
      baseline,
      setMachine,
      setOperatingState,
      setKnownNormalConfirmedAt,
      addCapture: (capture) => setCaptures((current) => [...current, capture]),
      setBaseline,
      beginRecalibration: (nextMachine, nextState) => {
        setMachine(nextMachine);
        setOperatingState(nextState);
        setKnownNormalConfirmedAt(undefined);
        setCaptures([]);
        setBaseline(undefined);
      },
      onOpenSensor,
      onRunComparison,
    }),
    [
      controller,
      repository,
      makeId,
      now,
      machine,
      operatingState,
      knownNormalConfirmedAt,
      captures,
      baseline,
      onOpenSensor,
      onRunComparison,
    ],
  );
  return (
    <WorkflowContext.Provider value={value}>
      <FlowStack initial={machineScreen} />
    </WorkflowContext.Provider>
  );
}
