import { useEffect, useRef } from 'react';
import type { ChoiceId } from '../../engine/types';
import type { ChoiceOption } from './types';

type ChoicePanelProps = {
  options: ChoiceOption[];
  /** Parent can bump this when a new choice set opens */
  roundId?: string | number;
  /** Fired once per choice selection; parent/engine must ignore duplicates */
  onChoose: (choiceId: ChoiceId) => void;
  disabled?: boolean;
};

export function ChoicePanel({
  options,
  roundId,
  onChoose,
  disabled = false,
}: ChoicePanelProps) {
  const locked = useRef(false);

  useEffect(() => {
    locked.current = false;
  }, [roundId, options]);

  function handleChoose(id: ChoiceId) {
    if (disabled || locked.current) return;
    locked.current = true;
    onChoose(id);
  }

  return (
    <div className="ui-choices" role="group" aria-label="Mission choices">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={
            option.caution ? 'ui-choice ui-choice--caution' : 'ui-choice'
          }
          disabled={disabled || option.disabled}
          onClick={() => handleChoose(option.id)}
        >
          <span className="ui-choice__label">{option.label}</span>
          {option.costs && option.costs.length > 0 ? (
            <span className="ui-choice__costs">{option.costs.join(' · ')}</span>
          ) : null}
          {option.caution ? (
            <span className="ui-choice__caution" aria-label="Caution">
              !
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
