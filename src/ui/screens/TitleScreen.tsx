import { SkyBadge } from '../components/SkyBadge';
import type { SkyLevel, SkySource } from '../../engine/types';

export type TitleAction =
  'start' | 'continue' | 'teachers' | 'sources' | 'settings';

type TitleScreenProps = {
  canContinue?: boolean;
  sky?: {
    level?: SkyLevel;
    status: SkySource | 'Unavailable';
    observationDate?: string;
  };
  onAction: (action: TitleAction) => void;
};

/**
 * Title menu shell. Member 1 wires Start/Continue to sky fetch + save restore.
 */
export function TitleScreen({
  canContinue = false,
  sky,
  onAction,
}: TitleScreenProps) {
  return (
    <div className="title-shell">
      <div className="title-hero" aria-hidden="true">
        <img src="/assets/bg/mars_vista.jpg" alt="" draggable={false} />
        <div className="title-hero__shade" />
      </div>

      <div className="title-panel">
        <img
          className="title-logo"
          src="/assets/branding/tiny_habitat_transparent.png"
          alt="Tiny Habitat logo"
          draggable={false}
        />
        <h1 className="title-brand">Mars Mission Survival</h1>
        <p className="title-subtitle">Tiny Habitat</p>

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
            <svg
              className="title-btn__sparkle title-btn__sparkle--tl"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
            <span className="title-btn__label">Start New</span>
            <svg
              className="title-btn__sparkle title-btn__sparkle--br"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
          </button>
          <button
            type="button"
            className="title-btn"
            disabled={!canContinue}
            onClick={() => onAction('continue')}
          >
            <svg
              className="title-btn__sparkle title-btn__sparkle--tl"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
            <span className="title-btn__label">Continue</span>
            <svg
              className="title-btn__sparkle title-btn__sparkle--br"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
          </button>
          <button
            type="button"
            className="title-btn"
            onClick={() => onAction('teachers')}
          >
            <svg
              className="title-btn__sparkle title-btn__sparkle--tl"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
            <span className="title-btn__label">Learn</span>
            <svg
              className="title-btn__sparkle title-btn__sparkle--br"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
          </button>
          <button
            type="button"
            className="title-btn"
            onClick={() => onAction('sources')}
          >
            <svg
              className="title-btn__sparkle title-btn__sparkle--tl"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
            <span className="title-btn__label">Sources & Credits</span>
            <svg
              className="title-btn__sparkle title-btn__sparkle--br"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
          </button>
          <button
            type="button"
            className="title-btn"
            onClick={() => onAction('settings')}
          >
            <svg
              className="title-btn__sparkle title-btn__sparkle--tl"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
            <span className="title-btn__label">Settings</span>
            <svg
              className="title-btn__sparkle title-btn__sparkle--br"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
