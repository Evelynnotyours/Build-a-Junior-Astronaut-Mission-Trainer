import { useState } from 'react';
import { RepairWires } from '../RepairWires';

/**
 * Standalone Repair Wires harness (Member 2).
 * Open /minigames-c2-preview.html?game=wires
 */
export function WiresPreview() {
  const [result, setResult] = useState<'done' | 'skipped' | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [round, setRound] = useState(0);

  return (
    <div className="ui-preview mg-preview">
      <details className="ui-preview__dev">
        <summary>Repair Wires preview controls</summary>
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
          <a href="/minigames-c2-preview.html?game=leak">Patch Leak</a>
        </div>
        <p>
          Result: <code>{result ?? 'in progress'}</code> — UI only; no Power bonus here.
        </p>
      </details>

      <RepairWires
        key={`${round}-${reduceMotion}`}
        id="repair_wires"
        instructionKey="minigame.repair_wires.hint"
        instruction="Choose a wire end, then its matching symbol. Connect all three pairs."
        reduceMotion={reduceMotion}
        sol={7}
        onResult={(value) => setResult(value)}
      />
    </div>
  );
}