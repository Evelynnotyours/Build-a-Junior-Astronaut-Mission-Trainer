import type { SpeakerPortrait } from '../../engine/scene-types';
import { Portrait } from './Portrait';

type DialogueBoxProps = SpeakerPortrait & {
  speakerName: string;
  text: string;
  onContinue: () => void;
  continueLabel?: string;
};

/** Character speech bubble. Parent passes resolved story text, never hard-coded keys here. */
export function DialogueBox({
  speakerName,
  text,
  onContinue,
  continueLabel = 'Continue',
  ...portrait
}: DialogueBoxProps) {
  return (
    <section className="ui-dialogue" aria-label={`${speakerName} says`}>
      <Portrait {...portrait} alt="" />
      <div className="ui-dialogue__bubble">
        <header className="ui-dialogue__name">{speakerName}</header>
        <p className="ui-dialogue__text">{text}</p>
        <button type="button" className="ui-btn ui-btn--cta" onClick={onContinue}>
          {continueLabel}
          <span aria-hidden="true"> ›</span>
        </button>
      </div>
    </section>
  );
}
