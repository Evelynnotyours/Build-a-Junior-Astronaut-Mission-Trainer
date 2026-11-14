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

export type PatchLeakProps = {
  id: 'patch_leak';
  reduceMotion: boolean;
  instructionKey: TextKey;
  instruction: string;
  onResult: (result: MiniGameResult) => void;
  sol?: number;
};

const LEAK_COUNT = 3;

const LEAKS = [
  { id: 'leak-a', label: 'Leak A', x: 26, y: 34 },
  { id: 'leak-b', label: 'Leak B', x: 54, y: 62 },
  { id: 'leak-c', label: 'Leak C', x: 76, y: 38 },
] as const;

const ROBO_HINT =
  'Tap each marked leak to place a patch. Patch all three, or choose Skip.';

/**
 * Patch Leak — tap three marked leaks to seal them.
 * Reports done|skipped once. Engine owns +2 Power on completion.
 */
export function PatchLeak(props: PatchLeakProps) {
  return (
    <PatchLeakErrorBoundary onResult={props.onResult}>
      <PatchLeakInner {...props} />
    </PatchLeakErrorBoundary>
  );
}

class PatchLeakErrorBoundary extends Component<
  { onResult: (result: MiniGameResult) => void; children: ReactNode },
  { crashed: boolean }
> {
  private reported = false;

  constructor(props: { onResult: (result: MiniGameResult) => void; children: ReactNode }) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError(): { crashed: boolean } {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('PatchLeak error', error, info.componentStack);
    if (!this.reported) {
      this.reported = true;
      this.props.onResult('skipped');
    }
  }

  render() {
    if (this.state.crashed) {
      return (
        <p className="mg-leak__fallback" role="status">
          Something went wrong with the air module. You can continue — Skip was applied.
        </p>
      );
    }
    return this.props.children;
  }
}

function PatchLeakInner({
  instruction,
  reduceMotion,
  onResult,
  sol = 8,
}: PatchLeakProps) {
  const titleId = useId();
  const finished = useRef(false);
  const reported = useRef(false);
  const patchedRef = useRef<string[]>([]);
  const [ended, setEnded] = useState(false);
  const [patched, setPatched] = useState<string[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [toast, setToast] = useState(ROBO_HINT);
  const [celebrating, setCelebrating] = useState(false);
  const [hissId, setHissId] = useState<string | null>(null);

  const patchedSet = useMemo(() => new Set(patched), [patched]);
  const patchedCount = patched.length;

  useEffect(() => {
    patchedRef.current = patched;
  }, [patched]);

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
      setToast('All three patches are fitted — nice work!');
      if (reduceMotion) emitResult('done');
      else window.setTimeout(() => emitResult('done'), 240);
      return;
    }
    emitResult('skipped');
  }

  function completeAllPatches() {
    if (finished.current) return;
    finished.current = true;
    setEnded(true);
    setCelebrating(true);
    setToast('All three patches are fitted — nice work!');
    if (reduceMotion) emitResult('done');
    else window.setTimeout(() => emitResult('done'), 240);
  }

  function patchLeak(leakId: string) {
    if (finished.current) return;

    if (patchedRef.current.includes(leakId)) {
      const label = LEAKS.find((l) => l.id === leakId)?.label ?? 'That leak';
      setToast(`${label} is already sealed. Pick another marked spot.`);
      return;
    }

    const next = [...patchedRef.current, leakId];
    patchedRef.current = next;
    setPatched(next);

    const leak = LEAKS.find((l) => l.id === leakId);
    setToast(
      next.length >= LEAK_COUNT
        ? 'All three patches are fitted — nice work!'
        : `${leak?.label ?? 'Leak'} sealed. ${next.length} of ${LEAK_COUNT} patched.`,
    );

    if (!reduceMotion) {
      setHissId(leakId);
      window.setTimeout(() => setHissId(null), reduceMotion ? 0 : 360);
    }

    if (next.length >= LEAK_COUNT) {
      completeAllPatches();
    }
  }

  function openLeaks() {
    return LEAKS.filter((l) => !patchedRef.current.includes(l.id));
  }

  useLayoutEffect(() => {
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
      const open = openLeaks();
      if (open.length === 0) return;
      if (bypassTarget(event.target)) return;

      if (event.key >= '1' && event.key <= '3') {
        const index = Number(event.key) - 1;
        const leak = LEAKS[index];
        if (!leak || patchedRef.current.includes(leak.id)) return;
        event.preventDefault();
        const openIdx = open.findIndex((l) => l.id === leak.id);
        if (openIdx >= 0) setFocusIndex(openIdx);
        patchLeak(leak.id);
        return;
      }

      let localFocus = Math.min(focusIndex, Math.max(0, open.length - 1));

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        localFocus = (localFocus + 1) % open.length;
        setFocusIndex(localFocus);
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        localFocus = (localFocus - 1 + open.length) % open.length;
        setFocusIndex(localFocus);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        const fromModule =
          event.target instanceof Element &&
          Boolean(event.target.closest('.mg-leak__module-wrap'));
        if (!fromModule) return;
        event.preventDefault();
        const leak = open[localFocus];
        if (leak) patchLeak(leak.id);
      }
    }

    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  });

  const open = LEAKS.filter((l) => !patchedSet.has(l.id));
  const focusLeakId = open[Math.min(focusIndex, Math.max(0, open.length - 1))]?.id;

  return (
    <section
      className={celebrating ? 'mg-leak mg-leak--won' : 'mg-leak'}
      aria-labelledby={titleId}
    >
      <div className="mg-leak__hud">
        <div className="mg-leak__chip">Sol {sol}</div>
        <div className="mg-leak__title-card">
          <span className="mg-leak__title-icon" aria-hidden="true" />
          <div>
            <h2 id={titleId}>Patch Leak</h2>
            <p>Seal the air module before precious oxygen escapes.</p>
          </div>
        </div>
        <div
          className="mg-leak__chip"
          aria-label={`Patched ${patchedCount} of ${LEAK_COUNT} leaks`}
        >
          {patchedCount} / {LEAK_COUNT}
        </div>
      </div>

      <div className="mg-leak__stage">
        <div
          className="mg-leak__module-wrap"
          role="group"
          aria-label="Air module cutaway. Tap each marked leak, or press 1 to 3."
        >
          <img
            className="mg-leak__module"
            src="/assets/minigames/air_module_cutaway.png"
            alt=""
            width={320}
            height={180}
            draggable={false}
          />

          {LEAKS.map((leak) => {
            const isPatched = patchedSet.has(leak.id);
            const isFocus = !isPatched && focusLeakId === leak.id;
            const showHiss = hissId === leak.id && !reduceMotion;
            return (
              <button
                key={leak.id}
                type="button"
                className={[
                  'mg-leak__spot',
                  isPatched ? 'mg-leak__spot--patched' : 'mg-leak__spot--open',
                  isFocus ? 'mg-leak__spot--focus' : '',
                  !isPatched && !reduceMotion ? 'mg-leak__spot--hiss' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ left: `${leak.x}%`, top: `${leak.y}%` }}
                aria-label={
                  isPatched
                    ? `${leak.label}, patched and sealed`
                    : `${leak.label}, marked leak spot ${leak.id.replace('leak-', '').toUpperCase()}, tap to place patch`
                }
                disabled={ended}
                aria-disabled={isPatched || ended}
                onClick={() => {
                  const openIdx = open.findIndex((l) => l.id === leak.id);
                  if (openIdx >= 0) setFocusIndex(openIdx);
                  patchLeak(leak.id);
                }}
                onFocus={() => {
                  const openIdx = open.findIndex((l) => l.id === leak.id);
                  if (openIdx >= 0) setFocusIndex(openIdx);
                }}
              >
                <img
                  className="mg-leak__marker"
                  src={
                    isPatched
                      ? '/assets/minigames/patch_sticker.png'
                      : '/assets/minigames/leak_marker.png'
                  }
                  alt=""
                  width={32}
                  height={32}
                  draggable={false}
                />
                <span className="mg-leak__spot-tag" aria-hidden="true">
                  {isPatched ? 'Sealed' : leak.label}
                </span>
                {showHiss ? (
                  <img
                    className="mg-leak__hiss"
                    src="/assets/overlays/hiss_puff.png"
                    alt=""
                    draggable={false}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <p className="mg-leak__toast" role="status">
          {toast}
        </p>

        {celebrating ? (
          <div className="mg-leak__celebrate" role="status">
            <p>Air module sealed!</p>
            <span>All three patches are holding.</span>
          </div>
        ) : null}
      </div>

      <div className="mg-leak__footer">
        <p className="mg-leak__instruction">{instruction}</p>
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