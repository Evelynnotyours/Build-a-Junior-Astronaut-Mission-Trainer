import { useEffect, useState } from 'react';
import { PROLOGUE_LINES, PROLOGUE_TITLE } from './prologue/fixtureCopy';

type PrologueScreenProps = {
  reduceMotion?: boolean;
  lines?: readonly string[];
  finalLabel?: string;
  onComplete: () => void;
  onSkip?: () => void;
};

/**
 * Code-drawn prologue: stars, Mars approach, landing glow, title, tap narration.
 * No dedicated prologue art asset required.
 */
export function PrologueScreen({
  reduceMotion = false,
  lines = PROLOGUE_LINES,
  finalLabel = 'Begin Sol 1',
  onComplete,
  onSkip,
}: PrologueScreenProps) {
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState({ line: '', text: '' });
  const [showTitle, setShowTitle] = useState(false);
  const line = lines[step] ?? '';
  const typed = reduceMotion ? line : typing.line === line ? typing.text : '';
  const doneTyping = typed.length >= line.length;
  const last = step >= lines.length - 1;

  useEffect(() => {
    const t = window.setTimeout(
      () => setShowTitle(true),
      reduceMotion ? 0 : 900,
    );
    return () => window.clearTimeout(t);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !line) return;

    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyping((previous) => {
        if (previous.line === line && previous.text.length >= line.length)
          return previous;
        return { line, text: line.slice(0, i) };
      });
      if (i >= line.length) window.clearInterval(id);
    }, 22);

    return () => window.clearInterval(id);
  }, [line, reduceMotion, step]);

  function advance() {
    if (!doneTyping) {
      setTyping({ line, text: line });
      return;
    }
    if (last) {
      onComplete();
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div
      className={
        reduceMotion
          ? 'prologue-shell prologue-shell--static'
          : 'prologue-shell'
      }
    >
      <div className="prologue-sky" aria-hidden="true">
        <div className="prologue-stars prologue-stars--a" />
        <div className="prologue-stars prologue-stars--b" />
        <div className="prologue-mars" />
        <div className="prologue-pod" />
        <div className="prologue-glow" />
      </div>

      {showTitle ? (
        <p className="prologue-title" aria-hidden="true">
          {PROLOGUE_TITLE}
        </p>
      ) : null}

      <div className="prologue-stage">
        <div className="prologue-card">
          <img
            src="/assets/characters/robo_explaining.png"
            alt=""
            className="prologue-robo"
            draggable={false}
          />
          <div className="prologue-speech">
            <p aria-live="polite">{typed || '\u00a0'}</p>
            <button
              type="button"
              className="prologue-continue"
              onClick={advance}
            >
              {doneTyping ? (last ? finalLabel : 'Continue') : 'Skip typing'}
            </button>
          </div>
        </div>

        {onSkip ? (
          <button type="button" className="prologue-skip" onClick={onSkip}>
            Skip prologue
          </button>
        ) : null}
      </div>
    </div>
  );
}
