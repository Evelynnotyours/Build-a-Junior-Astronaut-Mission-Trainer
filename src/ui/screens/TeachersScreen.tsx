import { useState } from 'react';
import { ClassroomPause } from './teacher/ClassroomPause';
import { CertificatePrint } from './teacher/CertificatePrint';
import {
  AlbumPrintStub,
  DiscussionPrint,
  LessonPlanPrint,
  MissionLogPrint,
  VocabularyPrint,
} from './teacher/Printables';
import { DISCUSSION_SAMPLES, LESSON_GOALS, LESSON_PLAN_STEPS } from './teacher/fixtureCopy';

type TeacherTab =
  | 'hub'
  | 'lesson'
  | 'discussion'
  | 'vocabulary'
  | 'worksheet'
  | 'album'
  | 'certificate'
  | 'pause-demo';

type TeachersScreenProps = {
  classroomMode?: boolean;
  onClassroomModeChange?: (enabled: boolean) => void;
  onClose?: () => void;
};

const NAV: { id: TeacherTab; label: string; icon: string }[] = [
  { id: 'hub', label: 'Overview', icon: '📘' },
  { id: 'lesson', label: 'Lesson Plan', icon: '💡' },
  { id: 'discussion', label: 'Discussion', icon: '💬' },
  { id: 'vocabulary', label: 'Vocabulary', icon: '✨' },
  { id: 'worksheet', label: 'Mission Log', icon: '📋' },
  { id: 'album', label: 'Album', icon: '🖼' },
  { id: 'certificate', label: 'Certificate', icon: '⭐' },
  { id: 'pause-demo', label: 'Pause Demo', icon: '⏯' },
];

/**
 * Teachers hub inspired by the Teacher Notes reference frame.
 * Member 1 wires from Title; Member 3 replaces fixture copy.
 */
export function TeachersScreen({
  classroomMode = false,
  onClassroomModeChange,
  onClose,
}: TeachersScreenProps) {
  const [tab, setTab] = useState<TeacherTab>('hub');
  const [localClassroom, setLocalClassroom] = useState(classroomMode);
  const classroom = onClassroomModeChange ? classroomMode : localClassroom;
  const sample = DISCUSSION_SAMPLES[2];

  function setClassroom(enabled: boolean) {
    if (onClassroomModeChange) onClassroomModeChange(enabled);
    else setLocalClassroom(enabled);
  }

  function goPrintable(next: TeacherTab) {
    setTab(next);
  }

  return (
    <div className={classroom ? 'tn-shell tn-shell--classroom' : 'tn-shell'}>
      <div className="tn-frame" role="dialog" aria-labelledby="tn-title">
        <div className="tn-frame__glow" aria-hidden="true" />
        <span className="tn-frame__corner tn-frame__corner--tl" aria-hidden="true" />
        <span className="tn-frame__corner tn-frame__corner--tr" aria-hidden="true" />
        <span className="tn-frame__corner tn-frame__corner--bl" aria-hidden="true" />
        <span className="tn-frame__corner tn-frame__corner--br" aria-hidden="true" />

        <header className="tn-top no-print">
          <div className="tn-brand">
            <span className="tn-brand__icon" aria-hidden="true" />
            <div>
              <p className="tn-brand__name">Mars Mission Survival</p>
              <p className="tn-brand__sub">Junior Astronaut Mission Trainer</p>
            </div>
          </div>

          <div className="tn-title-pill" id="tn-title">
            Teacher Notes
          </div>

          <button
            type="button"
            className="tn-close"
            aria-label="Close teacher notes"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="tn-body">
          <nav className="tn-side no-print" aria-label="Teacher materials">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  tab === item.id ? 'tn-side__btn tn-side__btn--active' : 'tn-side__btn'
                }
                onClick={() => setTab(item.id)}
              >
                <span className="tn-side__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="tn-main">
            {tab === 'hub' ? (
              <section className="tn-panel no-print">
                <div className="tn-banner">
                  <img src="/assets/bg/mars_vista.jpg" alt="" draggable={false} />
                  <div className="tn-banner__copy">
                    <h2>About This Game</h2>
                    <p>
                      A 10-sol Mars outpost mission for ages 7–12. Students balance Life Support,
                      Power, and Shielding while exploring real NASA-inspired science.
                    </p>
                  </div>
                </div>

                <div className="tn-grid">
                  <article className="tn-card">
                    <header>Learning Goals</header>
                    <ul className="tn-list">
                      {LESSON_GOALS.map((goal) => (
                        <li key={goal}>{goal}</li>
                      ))}
                    </ul>
                  </article>

                  <article className="tn-card">
                    <header>Suggested Activities</header>
                    <ul className="tn-list">
                      {LESSON_PLAN_STEPS.slice(0, 3).map((step) => (
                        <li key={step.title}>
                          <strong>{step.title}</strong> — {step.body}
                        </li>
                      ))}
                    </ul>
                  </article>

                  <article className="tn-card tn-card--wide">
                    <header>Quick Facts</header>
                    <ul className="tn-list tn-list--checks">
                      <li>One shared mission — Classroom is a setting, not a new mode</li>
                      <li>No student accounts, quizzes, or voting boards</li>
                      <li>Printables: lesson plan, discussion, vocabulary, worksheet, certificate</li>
                    </ul>
                    <div className="tn-fun">
                      <span aria-hidden="true">💡</span>
                      <p>
                        Fun fact: a sol is a Martian day — a little longer than a day on Earth.
                      </p>
                    </div>
                  </article>
                </div>

                <label className="tn-toggle">
                  <input
                    type="checkbox"
                    checked={classroom}
                    onChange={(e) => setClassroom(e.target.checked)}
                  />
                  Classroom mode (bigger text · discussion pauses)
                </label>
              </section>
            ) : null}

            {tab === 'lesson' ? <LessonPlanPrint /> : null}
            {tab === 'discussion' ? <DiscussionPrint /> : null}
            {tab === 'vocabulary' ? <VocabularyPrint /> : null}
            {tab === 'worksheet' ? <MissionLogPrint /> : null}
            {tab === 'album' ? <AlbumPrintStub /> : null}
            {tab === 'certificate' ? <CertificatePrint /> : null}
            {tab === 'pause-demo' ? (
              <div className="no-print">
                <ClassroomPause
                  sol={sample.sol}
                  question={sample.question}
                  teacherNote={sample.followUp}
                  showTeacherNotes
                  onContinue={() => setTab('hub')}
                />
              </div>
            ) : null}
          </div>
        </div>

        <footer className="tn-foot no-print">
          <div className="tn-mascot">
            <img
              src="/assets/characters/commander_idle.png"
              alt=""
              className="tn-mascot__sprite"
              draggable={false}
            />
            <div className="tn-bubble">
              Tip: print the Mission Log before class so students can predict, choose, and reflect!
            </div>
          </div>

          <div className="tn-actions">
            <button type="button" className="tn-action" onClick={() => goPrintable('lesson')}>
              📄 Lesson Plan
            </button>
            <button type="button" className="tn-action" onClick={() => goPrintable('worksheet')}>
              📋 Mission Log
            </button>
            <button
              type="button"
              className="tn-action tn-action--gold"
              onClick={() => goPrintable('certificate')}
            >
              ⭐ Certificate
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
