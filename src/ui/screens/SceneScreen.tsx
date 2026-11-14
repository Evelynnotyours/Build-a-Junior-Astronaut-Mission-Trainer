import type { ReactNode } from 'react';
import type { Meters } from '../../engine/types';
import { Meters as MetersBar } from '../components/Meters';
import { SolBadge } from '../components/SolBadge';

type SceneScreenProps = {
  meters: Meters;
  sol: number;
  phaseLabel?: string;
  clockLabel?: string;
  reduceMotion?: boolean;
  goalTitle?: string;
  goalBody?: string;
  challenges?: string[];
  /** ScenePresenter output: stage + dock */
  children: ReactNode;
};

/**
 * Scene HUD chrome over the outpost stage.
 * Member 1 wraps ScenePresenter with this screen; do not edit App.tsx from Member 4.
 */
export function SceneScreen({
  meters,
  sol,
  phaseLabel = 'Day',
  clockLabel,
  reduceMotion = false,
  goalTitle = 'Mission Goal',
  goalBody = 'Survive for 10 Sols on Mars!',
  challenges = ['☢ Radiation', '❄ Extreme cold', '💧 Limited water'],
  children,
}: SceneScreenProps) {
  return (
    <div className="ui-game">
      {children}
      <header className="ui-topbar">
        <div className="ui-brand">
          <span className="ui-brand__mark" aria-hidden="true">
            ✦
          </span>
          <div className="ui-brand__text">
            <p className="ui-brand__title">Mars Mission Survival</p>
            <p className="ui-brand__sub">Junior Astronaut Mission Trainer</p>
          </div>
        </div>
        <MetersBar values={meters} reduceMotion={reduceMotion} variant="hud" />
        <div className="ui-topbar__end">
          <SolBadge sol={sol} phaseLabel={phaseLabel} clockLabel={clockLabel} />
          <button type="button" className="ui-icon-btn" aria-label="Settings">
            ⚙
          </button>
        </div>
      </header>

      <aside className="ui-rail ui-rail--left" aria-label="Mission tools">
        <button type="button" className="ui-rail__btn">
          <span aria-hidden="true">📘</span>
          Learn
        </button>
        <button type="button" className="ui-rail__btn">
          <span aria-hidden="true">❓</span>
          Help
        </button>
      </aside>

      <aside className="ui-rail ui-rail--right" aria-label={goalTitle}>
        <h2>{goalTitle}</h2>
        <p>{goalBody}</p>
        <ul>
          {challenges.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
