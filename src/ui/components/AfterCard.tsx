type AfterCardProps = {
  text: string;
  onContinue: () => void;
  continueLabel?: string;
};

/** Robo's After explanation. Parent animates meters separately from engine values. */
export function AfterCard({
  text,
  onContinue,
  continueLabel = 'Continue',
}: AfterCardProps) {
  return (
    <section className="ui-after" aria-live="polite">
      <p className="ui-after__text">{text}</p>
      <button type="button" className="ui-btn ui-btn--cta" onClick={onContinue}>
        {continueLabel}
        <span aria-hidden="true"> ›</span>
      </button>
    </section>
  );
}
