import { FIXTURE_ALBUM } from '../album/fixtureCopy';
import {
  DISCUSSION_SAMPLES,
  LESSON_GOALS,
  LESSON_PLAN_STEPS,
  VOCABULARY,
} from './fixtureCopy';

export function LessonPlanPrint() {
  return (
    <section className="teacher-print" id="print-lesson-plan">
      <header className="teacher-print__toolbar no-print">
        <h2>Lesson plan</h2>
        <button type="button" className="ui-btn ui-btn--cta" onClick={() => window.print()}>
          Print
        </button>
      </header>
      <article className="teacher-print__sheet">
        <h3>Mars Mission Survival — 20–30 minute lesson</h3>
        <h4>Learning goals</h4>
        <ul>
          {LESSON_GOALS.map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
        <h4>Plan</h4>
        <ol>
          {LESSON_PLAN_STEPS.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong> — {step.body}
            </li>
          ))}
        </ol>
        <p className="teacher-print__note">
          Setup: browser with sound off for Classroom mode; projector-friendly text size recommended.
        </p>
      </article>
    </section>
  );
}

export function DiscussionPrint() {
  return (
    <section className="teacher-print" id="print-discussion">
      <header className="teacher-print__toolbar no-print">
        <h2>Discussion questions</h2>
        <button type="button" className="ui-btn ui-btn--cta" onClick={() => window.print()}>
          Print
        </button>
      </header>
      <article className="teacher-print__sheet">
        <h3>Event-matched discussion questions</h3>
        <p>No quiz scoring. Use one main question per pause; follow-ups are optional.</p>
        <ol>
          {DISCUSSION_SAMPLES.map((item) => (
            <li key={item.sol}>
              <strong>
                Sol {item.sol} · {item.event}
              </strong>
              <p>{item.question}</p>
              <p className="teacher-print__follow">Follow-up: {item.followUp}</p>
            </li>
          ))}
        </ol>
      </article>
    </section>
  );
}

export function VocabularyPrint() {
  return (
    <section className="teacher-print" id="print-vocabulary">
      <header className="teacher-print__toolbar no-print">
        <h2>Vocabulary</h2>
        <button type="button" className="ui-btn ui-btn--cta" onClick={() => window.print()}>
          Print
        </button>
      </header>
      <article className="teacher-print__sheet">
        <h3>Kid-friendly vocabulary</h3>
        <dl className="teacher-vocab">
          {VOCABULARY.map((entry) => (
            <div key={entry.term} className="teacher-vocab__row">
              <dt>{entry.term}</dt>
              <dd>{entry.meaning}</dd>
            </div>
          ))}
        </dl>
      </article>
    </section>
  );
}

export function MissionLogPrint() {
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <section className="teacher-print" id="print-mission-log">
      <header className="teacher-print__toolbar no-print">
        <h2>Mission log worksheet</h2>
        <button type="button" className="ui-btn ui-btn--cta" onClick={() => window.print()}>
          Print
        </button>
      </header>
      <article className="teacher-print__sheet">
        <h3>Prediction → Choice → Result</h3>
        <p>Name: ______________________ &nbsp; Date: __________</p>
        <table className="teacher-log">
          <thead>
            <tr>
              <th>Sol</th>
              <th>Prediction</th>
              <th>Choice</th>
              <th>Meters before → after</th>
              <th>Why?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((sol) => (
              <tr key={sol}>
                <td>{sol}</td>
                <td />
                <td />
                <td />
                <td />
              </tr>
            ))}
          </tbody>
        </table>
        <p className="teacher-print__note">
          Full 10-sol mission. Reflect on Life Support, Power, and Shielding after each choice.
        </p>
      </article>
    </section>
  );
}

export function AlbumPrintStub() {
  return (
    <section className="teacher-print" id="print-album">
      <header className="teacher-print__toolbar no-print">
        <h2>Mission Album print</h2>
        <button type="button" className="ui-btn ui-btn--cta" onClick={() => window.print()}>
          Print
        </button>
      </header>
      <article className="teacher-print__sheet">
        <h3>Mission Album</h3>
        <p>
          Fixture cards for print layout. Member 2/3 replace photos via realMoments; engine supplies
          album IDs. Full viewer: MissionAlbumScreen.
        </p>
        <div className="teacher-album-grid">
          {FIXTURE_ALBUM.map((card) => (
            <figure key={card.id} className="teacher-album-card">
              {card.photoSrc ? (
                <img src={card.photoSrc} alt={card.photoAlt} className="teacher-album-card__photo" />
              ) : (
                <div className="teacher-album-card__photo">No photo</div>
              )}
              <figcaption>
                Saved photo · {card.title}
                <br />
                {card.fact}
              </figcaption>
            </figure>
          ))}
        </div>
      </article>
    </section>
  );
}
