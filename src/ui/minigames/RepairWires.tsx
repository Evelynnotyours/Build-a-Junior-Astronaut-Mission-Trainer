import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { MiniGameResult, TextKey } from '../../engine/types';

export type RepairWiresProps = {
  id: 'repair_wires';
  reduceMotion: boolean;
  instructionKey: TextKey;
  /** Parent resolves instructionKey from story.json */
  instruction: string;
  onResult: (result: MiniGameResult) => void;
  sol?: number;
};

const PAIR_COUNT = 3;

const WIRE_PAIRS = [
  { id: 'alpha', symbol: 'α', name: 'Alpha', color: '#5ad4ff' },
  { id: 'beta', symbol: 'β', name: 'Beta', color: '#ffd76a' },
  { id: 'gamma', symbol: 'γ', name: 'Gamma', color: '#b8f070' },
] as const;

const ROW_Y = [22, 50, 78] as const;
const LEFT_X = 14;
const RIGHT_X = 86;

type WireTerminal = {
  id: string;
  pairId: string;
  side: 'left' | 'right';
  row: number;
  x: number;
  y: number;
  symbol: string;
  name: string;
  color: string;
};

function buildTerminals(): WireTerminal[] {
  return WIRE_PAIRS.flatMap((pair, row) => [
    {
      id: `${pair.id}-L`,
      pairId: pair.id,
      side: 'left' as const,
      row,
      x: LEFT_X,
      y: ROW_Y[row],
      symbol: pair.symbol,
      name: pair.name,
      color: pair.color,
    },
    {
      id: `${pair.id}-R`,
      pairId: pair.id,
      side: 'right' as const,
      row,
      x: RIGHT_X,
      y: ROW_Y[row],
      symbol: pair.symbol,
      name: pair.name,
      color: pair.color,
    },
  ]);
}

const TERMINALS = buildTerminals();

const ROBO_HINT =
  'Choose a wire end, then its matching symbol. Connect all three pairs.';

/**
 * Repair Wires — match three wire pairs by symbol and color.
 * Reports done|skipped once. Engine owns +2 Power on completion.
 */
export function RepairWires(props: RepairWiresProps) {
  return (
    <RepairWiresErrorBoundary onResult={props.onResult}>
      <RepairWiresInner {...props} />
    </RepairWiresErrorBoundary>
  );
}

class RepairWiresErrorBoundary extends Component<
  { onResult: (result: MiniGameResult) => void; children: ReactNode },
  { crashed: boolean }
> {
  private reported = false;

  constructor(props: {
    onResult: (result: MiniGameResult) => void;
    children: ReactNode;
  }) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError(): { crashed: boolean } {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('RepairWires error', error, info.componentStack);
    if (!this.reported) {
      this.reported = true;
      this.props.onResult('skipped');
    }
  }

  render() {
    if (this.state.crashed) {
      return (
        <p className="mg-wires__fallback" role="status">
          Something went wrong with the wiring panel. You can continue — Skip
          was applied.
        </p>
      );
    }
    return this.props.children;
  }
}

function RepairWiresInner({
  instruction,
  reduceMotion,
  onResult,
  sol = 7,
}: RepairWiresProps) {
  const titleId = useId();
  const finished = useRef(false);
  const reported = useRef(false);
  const selectedRef = useRef<string | null>(null);
  const connectedRef = useRef<string[]>([]);
  const [ended, setEnded] = useState(false);
  const [connected, setConnected] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [toast, setToast] = useState(ROBO_HINT);
  const [celebrating, setCelebrating] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [spark, setSpark] = useState(false);

  const connectedSet = useMemo(() => new Set(connected), [connected]);
  const linkedCount = connected.length;

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  function emitResult(result: MiniGameResult) {
    if (reported.current) return;
    reported.current = true;
    onResult(result);
  }

  function finish(result: 'done' | 'skipped') {
    if (finished.current) return;
    finished.current = true;
    setEnded(true);
    if (result === 'done') {
      setCelebrating(true);
      setToast('All three pairs connected — nice work!');
      if (reduceMotion) emitResult('done');
      else window.setTimeout(() => emitResult('done'), 240);
      return;
    }
    emitResult('skipped');
  }

  function completeAllPairs() {
    if (finished.current) return;
    finished.current = true;
    setEnded(true);
    setCelebrating(true);
    setToast('All three pairs connected — nice work!');
    if (reduceMotion) emitResult('done');
    else window.setTimeout(() => emitResult('done'), 240);
  }

  function terminalById(id: string) {
    return TERMINALS.find((t) => t.id === id);
  }

  function isPortLinked(terminal: WireTerminal) {
    return connectedSet.has(terminal.pairId);
  }

  function activateTerminal(terminal: WireTerminal) {
    const liveConnected = new Set(connectedRef.current);
    if (finished.current || liveConnected.has(terminal.pairId)) return;

    const activeSelection = selectedRef.current;

    if (!activeSelection) {
      selectedRef.current = terminal.id;
      setSelectedId(terminal.id);
      setToast(
        `Selected ${terminal.name} (${terminal.symbol}). Now pick its matching end.`,
      );
      return;
    }

    if (activeSelection === terminal.id) {
      selectedRef.current = null;
      setSelectedId(null);
      setToast(ROBO_HINT);
      return;
    }

    const first = terminalById(activeSelection);
    if (!first) {
      selectedRef.current = terminal.id;
      setSelectedId(terminal.id);
      return;
    }

    if (first.pairId === terminal.pairId && first.id !== terminal.id) {
      const nextConnected = liveConnected.has(terminal.pairId)
        ? connectedRef.current
        : [...connectedRef.current, terminal.pairId];
      connectedRef.current = nextConnected;
      setConnected(nextConnected);
      selectedRef.current = null;
      setSelectedId(null);
      setToast(
        nextConnected.length >= PAIR_COUNT
          ? 'All three pairs connected — nice work!'
          : `Connected ${terminal.name} line. ${nextConnected.length} of ${PAIR_COUNT} done.`,
      );
      if (nextConnected.length >= PAIR_COUNT) {
        completeAllPairs();
      }
      return;
    }

    selectedRef.current = null;
    setSelectedId(null);
    setToast(
      'Those ends do not match. Try again — match the symbol and label.',
    );
    if (!reduceMotion) {
      setNudge(true);
      setSpark(true);
      window.setTimeout(() => setNudge(false), 420);
      window.setTimeout(() => setSpark(false), 380);
    }
  }

  function activeFocusIndex() {
    const open = TERMINALS.filter((t) => !connectedSet.has(t.pairId));
    if (open.length === 0) return 0;
    const idx = Math.min(focusIndex, open.length - 1);
    const globalIndex = TERMINALS.findIndex((t) => t.id === open[idx].id);
    return globalIndex >= 0 ? globalIndex : 0;
  }

  useLayoutEffect(() => {
    function openPorts() {
      const live = new Set(connectedRef.current);
      return TERMINALS.filter((t) => !live.has(t.pairId));
    }

    function bypassTarget(target: EventTarget | null) {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest(
          'input, textarea, select, .mg-skip, .ui-preview__dev, [role="checkbox"]',
        ),
      );
    }

    function onKey(event: KeyboardEvent) {
      if (finished.current) return;

      const open = openPorts();
      if (open.length === 0) return;

      if (bypassTarget(event.target)) return;

      if (event.key >= '1' && event.key <= '6') {
        const digit = Number(event.key) - 1;
        const row = digit % 3;
        const side: 'left' | 'right' = digit < 3 ? 'left' : 'right';
        const terminal = TERMINALS.find(
          (t) => t.row === row && t.side === side,
        );
        const live = new Set(connectedRef.current);
        if (!terminal || live.has(terminal.pairId)) return;
        event.preventDefault();
        setFocusIndex(open.findIndex((t) => t.id === terminal.id));
        activateTerminal(terminal);
        return;
      }

      let localFocus = Math.min(focusIndex, Math.max(0, open.length - 1));
      const openCol = (term: WireTerminal) =>
        open.findIndex((t) => t.id === term.id);

      const current = open[localFocus] ?? open[0];

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (current.side === 'left') {
          const twin = open.find(
            (t) => t.pairId === current.pairId && t.side === 'right',
          );
          if (twin) localFocus = openCol(twin);
        }
        setFocusIndex(localFocus);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (current.side === 'right') {
          const twin = open.find(
            (t) => t.pairId === current.pairId && t.side === 'left',
          );
          if (twin) localFocus = openCol(twin);
        }
        setFocusIndex(localFocus);
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const sameSide = open.filter((t) => t.side === current.side);
        const pos = sameSide.findIndex((t) => t.id === current.id);
        const next = sameSide[(pos + 1) % sameSide.length];
        localFocus = openCol(next);
        setFocusIndex(localFocus);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const sameSide = open.filter((t) => t.side === current.side);
        const pos = sameSide.findIndex((t) => t.id === current.id);
        const next = sameSide[(pos - 1 + sameSide.length) % sameSide.length];
        localFocus = openCol(next);
        setFocusIndex(localFocus);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        selectedRef.current = null;
        setSelectedId(null);
        setToast(ROBO_HINT);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        const fromBoard =
          event.target instanceof Element &&
          Boolean(event.target.closest('.mg-wires__board-wrap'));
        if (!fromBoard) return;
        event.preventDefault();
        const term = open[localFocus];
        if (term) activateTerminal(term);
      }
    }
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }); // layout effect keeps keyboard shortcuts available in tests and on first paint

  const focusGlobal = activeFocusIndex();

  return (
    <section
      className={[
        'mg-wires',
        celebrating ? 'mg-wires--won' : '',
        nudge && !reduceMotion ? 'mg-wires--nudge' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={titleId}
    >
      <div className="mg-wires__hud">
        <div className="mg-wires__chip">Sol {sol}</div>
        <div className="mg-wires__title-card">
          <span className="mg-wires__title-icon" aria-hidden="true" />
          <div>
            <h2 id={titleId}>Repair Wires</h2>
            <p>Match each wire pair. Take your time.</p>
          </div>
        </div>
        <div
          className="mg-wires__chip"
          aria-label={`Connected ${linkedCount} of ${PAIR_COUNT} pairs`}
        >
          {linkedCount} / {PAIR_COUNT}
        </div>
      </div>

      <div className="mg-wires__stage">
        <div
          className="mg-wires__board-wrap"
          role="group"
          aria-label="Wire board. Pick an end, then its matching symbol. Keys 1–6, arrows, Enter."
        >
          <img
            className="mg-wires__board"
            src="/assets/minigames/wire_board.png"
            alt=""
            width={320}
            height={180}
            draggable={false}
          />

          <svg
            className="mg-wires__lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {WIRE_PAIRS.map((pair) => {
              if (!connectedSet.has(pair.id)) return null;
              const row = WIRE_PAIRS.findIndex((p) => p.id === pair.id);
              const y = ROW_Y[row];
              return (
                <line
                  key={pair.id}
                  x1={LEFT_X}
                  y1={y}
                  x2={RIGHT_X}
                  y2={y}
                  stroke={pair.color}
                  strokeWidth={2.8}
                  strokeLinecap="round"
                  className={
                    reduceMotion
                      ? 'mg-wires__line'
                      : 'mg-wires__line mg-wires__line--pulse'
                  }
                />
              );
            })}
          </svg>

          {TERMINALS.map((terminal, index) => {
            const linked = isPortLinked(terminal);
            const picked = selectedId === terminal.id;
            const keyboardFocus = focusGlobal === index && !linked;
            return (
              <button
                key={terminal.id}
                type="button"
                className={[
                  'mg-wires__port',
                  linked ? 'mg-wires__port--linked' : '',
                  picked ? 'mg-wires__port--selected' : '',
                  keyboardFocus ? 'mg-wires__port--focus' : '',
                  !linked && !reduceMotion && !picked
                    ? 'mg-wires__port--idle'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  left: `${terminal.x}%`,
                  top: `${terminal.y}%`,
                  ['--mg-wire-color' as string]: terminal.color,
                }}
                aria-label={
                  linked
                    ? `${terminal.name} wire ${terminal.side}, connected`
                    : picked
                      ? `${terminal.name} wire ${terminal.side}, selected, symbol ${terminal.symbol}`
                      : `${terminal.name} wire ${terminal.side}, symbol ${terminal.symbol}, color accent for sighted players`
                }
                aria-pressed={picked || linked}
                disabled={ended || linked}
                onClick={() => {
                  setFocusIndex(
                    TERMINALS.filter(
                      (t) => !connectedSet.has(t.pairId),
                    ).findIndex((t) => t.id === terminal.id),
                  );
                  activateTerminal(terminal);
                }}
                onFocus={() => {
                  const openIdx = TERMINALS.filter(
                    (t) => !connectedSet.has(t.pairId),
                  ).findIndex((t) => t.id === terminal.id);
                  if (openIdx >= 0) setFocusIndex(openIdx);
                }}
              >
                <span className="mg-wires__port-symbol" aria-hidden="true">
                  {terminal.symbol}
                </span>
                <span className="mg-wires__port-label" aria-hidden="true">
                  {terminal.name}
                </span>
              </button>
            );
          })}

          {spark && !reduceMotion ? (
            <img
              className="mg-wires__spark"
              src="/assets/overlays/spark.png"
              alt=""
              draggable={false}
            />
          ) : null}
        </div>

        <p className="mg-wires__toast" role="status">
          {toast}
        </p>

        {celebrating ? (
          <div className="mg-wires__celebrate" role="status">
            <p>Power line restored!</p>
            <span>Wiring is steady again.</span>
          </div>
        ) : null}
      </div>

      <div className="mg-wires__footer">
        <p className="mg-wires__instruction">{instruction}</p>
        <button
          type="button"
          className="mg-skip"
          disabled={ended}
          onClick={() => finish('skipped')}
        >
          Skip
        </button>
      </div>
    </section>
  );
}
