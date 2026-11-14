import { useMemo, useState } from 'react';
import type { CargoId, SkyLevel, SkySource } from '../../engine/types';
import { BudgetBar } from '../components/BudgetBar';
import { CargoCard } from '../components/CargoCard';
import { SkyBadge } from '../components/SkyBadge';
import {
  BALANCED_PACK,
  CARGO_BUDGET,
  PLAN_CARGO,
  PLAN_COPY,
  SKY_BRIEFING,
  cargoWeight,
} from './plan/fixtureCopy';

export type PlanScreenProps = {
  skyLevel?: SkyLevel;
  skyStatus?: SkySource | 'Unavailable';
  observationDate?: string;
  initialCargo?: CargoId[];
  solarGainPreview?: number;
  onLaunch: (cargo: CargoId[]) => void;
  onBack?: () => void;
};

/**
 * Plan-phase cargo bay. Selection + budget only — engine owns modifiers after Launch.
 */
export function PlanScreen({
  skyLevel = 'calm',
  skyStatus = 'saved',
  observationDate,
  initialCargo = [],
  solarGainPreview = 12,
  onLaunch,
  onBack,
}: PlanScreenProps) {
  const [selected, setSelected] = useState<CargoId[]>(initialCargo);
  const [roboLine, setRoboLine] = useState<string>(PLAN_COPY.welcome);
  const used = useMemo(() => cargoWeight(selected), [selected]);
  const briefing = SKY_BRIEFING[skyLevel];
  const canLaunch = used <= CARGO_BUDGET;
  const gain =
    selected.includes('solar_extra') && solarGainPreview === 12
      ? 15
      : solarGainPreview;

  function toggle(id: string) {
    const cargoId = id as CargoId;
    const item = PLAN_CARGO.find((c) => c.id === cargoId);
    if (!item) return;

    if (selected.includes(cargoId)) {
      setSelected((prev) => prev.filter((x) => x !== cargoId));
      setRoboLine(item.hint);
      return;
    }

    if (used + item.weight > CARGO_BUDGET) {
      setRoboLine(PLAN_COPY.overBudget);
      return;
    }

    setSelected((prev) => [...prev, cargoId]);
    setRoboLine(item.hint);
  }

  function applyBalanced() {
    setSelected([...BALANCED_PACK]);
    setRoboLine(PLAN_COPY.balanced);
  }

  function launch() {
    if (!canLaunch) return;
    setRoboLine(PLAN_COPY.launch);
    onLaunch(selected);
  }

  return (
    <div className="plan-shell">
      <div className="plan-frame">
        <header className="plan-top">
          <div>
            <p className="plan-eyebrow">Plan phase</p>
            <h1>Pack your cargo</h1>
            <p className="plan-sub">{PLAN_COPY.alwaysIncluded}</p>
          </div>
          <div className="plan-sky">
            <SkyBadge
              level={skyLevel}
              status={skyStatus}
              observationDate={observationDate}
            />
            <p className="plan-sky__detail">
              NASA input:{' '}
              {skyStatus === 'live'
                ? 'Live'
                : skyStatus === 'cache'
                  ? 'Cached'
                  : skyStatus === 'saved'
                    ? 'Saved'
                    : 'Unavailable'}{' '}
              · {skyLevel}
              {observationDate ? ` · observed ${observationDate}` : ''}
            </p>
          </div>
        </header>

        <div className="plan-robo">
          <img src="/assets/characters/robo_explaining.png" alt="" draggable={false} />
          <div className="plan-bubble">
            <p>{roboLine}</p>
            <p className="plan-bubble__advice">{briefing.briefing}</p>
            <p className="plan-bubble__advice">{briefing.advice}</p>
          </div>
        </div>

        <BudgetBar used={used} max={CARGO_BUDGET} label="Launch weight" />

        <p className="plan-gen">
          Starting Power stays 65 · Solar generation: +{gain} per sol
          {selected.includes('solar_extra') ? ' (extra panels packed)' : ''}
        </p>

        <div className="plan-grid" role="list">
          {PLAN_CARGO.map((item) => {
            const isOn = selected.includes(item.id);
            const wouldOver = !isOn && used + item.weight > CARGO_BUDGET;
            return (
              <div key={item.id} role="listitem">
                <CargoCard
                  id={item.id}
                  name={item.name}
                  description={item.hint}
                  iconSrc={item.iconSrc}
                  mass={item.weight}
                  selected={isOn}
                  disabled={wouldOver}
                  onToggle={toggle}
                />
              </div>
            );
          })}
        </div>

        <footer className="plan-foot">
          {onBack ? (
            <button type="button" className="plan-btn" onClick={onBack}>
              Back
            </button>
          ) : null}
          <button type="button" className="plan-btn" onClick={applyBalanced}>
            Balanced pack
          </button>
          <button
            type="button"
            className="plan-btn plan-btn--launch"
            disabled={!canLaunch}
            onClick={launch}
          >
            Launch mission
          </button>
        </footer>
      </div>
    </div>
  );
}
