import type { SpeakerPortrait } from '../../engine/scene-types';
import { Portrait } from './Portrait';

type DialogueBoxProps = SpeakerPortrait & {
  speakerName: string;
  text: string;
  onContinue: () => void;
  continueLabel?: string;
};

/** Character dialogue — dark translucent panel + gold double border (reference). */
export function DialogueBox({
  speakerName,
  text,
  onContinue,
  continueLabel = 'Continue',
  ...portrait
}: DialogueBoxProps) {
  return (
    <section className="ui-dialogue" aria-label={`${speakerName} says`}>
      <div className="ui-dialogue__speaker" aria-hidden="true">
        <Portrait {...portrait} size="hero" alt="" />
      </div>
      <div className="ui-dialogue__bubble">
        <header className="ui-dialogue__name">{speakerName}</header>
        <p className="ui-dialogue__text">{text}</p>
        <button type="button" className="ui-dialogue__continue" onClick={onContinue}>
          {continueLabel}
          <span aria-hidden="true"> ››</span>
        </button>
      </div>
    </section>
  );
}
