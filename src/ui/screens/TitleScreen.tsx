import { SkyBadge } from '../components/SkyBadge';
import type { SkyLevel, SkySource } from '../../engine/types';

export type TitleAction =
  | 'start'
  | 'continue'
  | 'learn'
  | 'teachers'
  | 'sources'
  | 'settings';

type TitleScreenProps = {
  canContinue?: boolean;
  replaceWarning?: boolean;
  sky?: { level?: SkyLevel; status: SkySource | 'Unavailable'; observationDate?: string };
  onAction: (action: TitleAction) => void;
  onConfirmStart?: () => void;
  onCancelStart?: () => void;
};

/**
 * Title menu shell. Member 1 wires Start/Continue to sky fetch + save restore.
 */
export function TitleScreen({
  canContinue = false,
  replaceWarning = false,
  sky,
  onAction,
  onConfirmStart,
  onCancelStart,
}: TitleScreenProps) {
  return (
    <div className="title-shell">
      <div className="title-hero" aria-hidden="true">
        <img src="/assets/bg/mars_vista.jpg" alt="" draggable={false} />
        <div className="title-hero__shade" />
      </div>

      <div className="title-panel">
        <p className="title-eyebrow">NASA Space Apps · Junior Astronaut Mission Trainer</p>
        <h1 className="title-brand">Mars Mission Survival</h1>
        <p className="title-tag">Keep the outpost alive for 10 sols.</p>

        {sky ? (
          <div className="title-sky">
            <SkyBadge
              level={sky.level}
              status={sky.status}
              observationDate={sky.observationDate}
            />
          </div>
        ) : null}

        <div className="title-actions">
          <button
            type="button"
            className="title-btn title-btn--primary"
            onClick={() => onAction('start')}
          >
            Start Mission
          </button>
          <button
            type="button"
            className="title-btn"
            disabled={!canContinue}
            onClick={() => onAction('continue')}
          >
            Continue Mission
          </button>
          <button type="button" className="title-btn" onClick={() => onAction('learn')}>
            Learn
          </button>
          <button type="button" className="title-btn" onClick={() => onAction('teachers')}>
            Teachers
          </button>
          <button type="button" className="title-btn" onClick={() => onAction('sources')}>
            Sources & Credits
          </button>
          <button type="button" className="title-btn" onClick={() => onAction('settings')}>
            Settings
          </button>
        </div>

        {!canContinue ? (
          <p className="title-hint">Continue appears when a valid unfinished save is found.</p>
        ) : null}
      </div>

      {replaceWarning ? (
        <div className="title-modal" role="alertdialog" aria-labelledby="replace-title">
          <div className="title-modal__card">
            <h2 id="replace-title">Start a new mission?</h2>
            <p>This will replace your unfinished progress on this device.</p>
            <div className="title-modal__actions">
              <button type="button" className="title-btn" onClick={onCancelStart}>
                Keep current mission
              </button>
              <button type="button" className="title-btn title-btn--primary" onClick={onConfirmStart}>
                Replace and start
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
