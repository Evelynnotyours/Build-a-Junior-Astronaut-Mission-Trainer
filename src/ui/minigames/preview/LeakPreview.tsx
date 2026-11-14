import { useState } from 'react';
import { PatchLeak } from '../PatchLeak';

/**
 * Standalone Patch Leak harness (Member 2).
 * Open /minigames-c2-preview.html?game=leak
 */
export function LeakPreview() {
  const [result, setResult] = useState<'done' | 'skipped' | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [round, setRound] = useState(0);

  return (
    <div className="ui-preview mg-preview">
      <details className="ui-preview__dev">
        <summary>Patch Leak preview controls</summary>
        <div className="ui-preview__modes">
          <label>
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
            />
            Reduce Motion
          </label>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setRound((n) => n + 1);
            }}
          >
            reset
          </button>
          <a href="/minigames-c2-preview.html?game=wires">Repair Wires</a>
        </div>
        <p>
          Result: <code>{result ?? 'in progress'}</code> — UI only; no Power bonus here.
        </p>
      </details>

      <PatchLeak
        key={`${round}-${reduceMotion}`}
        id="patch_leak"
        instructionKey="minigame.patch_leak.hint"
        instruction="Tap each marked leak to place a patch. Patch all three, or choose Skip."
        reduceMotion={reduceMotion}
        sol={8}
        onResult={(value) => setResult(value)}
      />
    </div>
  );
}