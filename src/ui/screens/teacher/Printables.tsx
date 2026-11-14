import { getMediaCatalog } from '../../../content/media-catalog';
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
        <button
          type="button"
          className="ui-btn ui-btn--cta"
          onClick={() => window.print()}
        >
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
          Setup: open the mission in a browser and prepare a shared screen or
          projector. Enable classroom discussion pauses for bigger text, sound
          off and reduced motion. Print a Mission Log for each learner.
        </p>
        <h4>Extension</h4>
        <p>
          Use the vocabulary list to explain cargo and launch weight. Compare
          two cargo plans and explain which tradeoffs each plan makes.
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
        <button
          type="button"
          className="ui-btn ui-btn--cta"
          onClick={() => window.print()}
        >
          Print
        </button>
      </header>
      <article className="teacher-print__sheet">
        <h3>Event-matched discussion questions</h3>
        <p>
          No quiz scoring. Use one main question per pause; follow-ups are
          optional.
        </p>
        <ol>
          {DISCUSSION_SAMPLES.map((item) => (
            <li key={item.sol}>
              <strong>
                Sol {item.sol} · {item.event}
              </strong>
              <p>{item.question}</p>
              <p className="teacher-print__follow">
                Follow-up: {item.followUp}
              </p>
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
        <button
          type="button"
          className="ui-btn ui-btn--cta"
          onClick={() => window.print()}
        >
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
        <button
          type="button"
          className="ui-btn ui-btn--cta"
          onClick={() => window.print()}
        >
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
          Full 10-sol mission. Reflect on Life Support, Power, and Shielding
          after each choice.
        </p>
      </article>
    </section>
  );
}

export function AlbumPrint({
  albumIds = [],
}: {
  albumIds?: readonly string[];
}) {
  const catalog = getMediaCatalog();
  const cards = [...new Set(albumIds)].flatMap((id) => {
    const moment = catalog.realMoments[id];
    return moment
      ? [{ id, moment, photo: catalog.photos[moment.photoId] }]
      : [];
  });
  return (
    <section className="teacher-print" id="print-album">
      <header className="teacher-print__toolbar no-print">
        <h2>Collected NASA photo cards</h2>
        <button
          type="button"
          className="ui-btn ui-btn--cta"
          disabled={!cards.length}
          onClick={() => window.print()}
        >
          Print photo cards
        </button>
      </header>
      <article className="teacher-print__sheet">
        <h3>Mission Album</h3>
        {!cards.length && (
          <p>
            No cards collected yet. Explore the Real Mars cards during the
            mission, then return here to print them.
          </p>
        )}
        <div className="teacher-album-grid">
          {cards.map(({ id, moment, photo }) => (
            <figure key={id} className="teacher-album-card">
              <img
                src={photo.src}
                alt={photo.altText}
                className="teacher-album-card__photo"
                loading="lazy"
              />
              <figcaption>
                <h4>{moment.title}</h4>
                <p>
                  {photo.savedLabel}
                  {photo.captureDate
                    ? ` · Captured ${photo.captureDate}`
                    : photo.publishedDate
                      ? ` · Published ${photo.publishedDate}`
                      : ''}
                </p>
                <p>{photo.caption}</p>
                {moment.contextNote && <p>{moment.contextNote}</p>}
                {photo.contextNote &&
                  photo.contextNote !== moment.contextNote && (
                    <p>{photo.contextNote}</p>
                  )}
                <p>Credit: {photo.credit}</p>
                <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
                  NASA source
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </article>
    </section>
  );
}
