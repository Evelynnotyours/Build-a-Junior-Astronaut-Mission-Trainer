import { useState } from 'react';

type CertificatePrintProps = {
  defaultName?: string;
  missionCompleted?: boolean;
};

/** Name is typed for printing only — never persisted. */
export function CertificatePrint({
  defaultName = '',
  missionCompleted = false,
}: CertificatePrintProps) {
  const [name, setName] = useState(defaultName);

  if (!missionCompleted)
    return (
      <section className="teacher-print">
        <h2>Junior Commander certificate</h2>
        <p>Complete the 10-sol mission to unlock your printable certificate.</p>
      </section>
    );

  return (
    <section className="teacher-print teacher-cert" id="print-certificate">
      <header className="teacher-print__toolbar no-print">
        <h2>Junior Commander certificate</h2>
        <button
          type="button"
          className="ui-btn ui-btn--cta"
          onClick={() => window.print()}
        >
          Print certificate
        </button>
      </header>

      <label className="teacher-cert__name-field no-print">
        Commander name (not saved)
        <input
          type="text"
          value={name}
          maxLength={40}
          placeholder="Type a name for printing"
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <article
        className="teacher-cert__sheet"
        aria-label="Printable certificate"
      >
        <p className="teacher-cert__eyebrow">Mars Mission Survival</p>
        <h3>Junior Commander Certificate</h3>
        <p className="teacher-cert__line">This certifies that</p>
        <p className="teacher-cert__commander">
          {name.trim() || '________________'}
        </p>
        <p className="teacher-cert__line">
          completed a training mission balancing Life Support, Power, and
          Shielding on Mars.
        </p>
        <p className="teacher-cert__footer">
          Gale Crater Outpost · Junior Astronaut Mission Trainer
        </p>
      </article>
    </section>
  );
}
