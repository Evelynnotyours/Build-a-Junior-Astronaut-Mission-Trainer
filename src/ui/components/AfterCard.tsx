type AfterCardProps = {
  text: string;
  onContinue: () => void;
  continueLabel?: string;
};

/** After-choice explanation — same dialogue panel style. */
export function AfterCard({
  text,
  onContinue,
  continueLabel = 'Continue',
}: AfterCardProps) {
  return (
    <section className="ui-dialogue ui-dialogue--solo" aria-live="polite" aria-label="Mission update">
      <div className="ui-dialogue__bubble">
        <header className="ui-dialogue__name">Update</header>
        <p className="ui-dialogue__text">{text}</p>
        <button type="button" className="ui-dialogue__continue" onClick={onContinue}>
          {continueLabel}
          <span aria-hidden="true"> ››</span>
        </button>
      </div>
    </section>
  );
}
