import { Portrait } from './Portrait';

type NarrationCardProps = {
  text: string;
  onContinue: () => void;
  continueLabel?: string;
  reduceMotion?: boolean;
  showPortrait?: boolean;
};

/** Bottom narration / Robo hint card. Parent supplies already-resolved story text. */
export function NarrationCard({
  text,
  onContinue,
  continueLabel = 'Continue',
  reduceMotion = false,
  showPortrait = true,
}: NarrationCardProps) {
  return (
    <section className="ui-narration ui-speech" aria-live="polite">
      {showPortrait ? (
        <Portrait speaker="robo" expression="explaining" size="md" alt="" />
      ) : null}
      <div className="ui-speech__body">
        <p
          className={
            reduceMotion ? 'ui-narration__text' : 'ui-narration__text ui-narration__text--type'
          }
        >
          {text}
        </p>
        <button type="button" className="ui-btn ui-btn--cta" onClick={onContinue}>
          {continueLabel}
          <span aria-hidden="true"> ›</span>
        </button>
      </div>
    </section>
  );
}
