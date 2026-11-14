import { useState } from 'react';
import story from './content/story.json';
import { createMission } from './engine/state';
import { launchMission } from './engine/resources';
import { getCargoCatalog, validateLoadout } from './engine/loadout';
import { createSol01Scene } from './engine/scenes/sol01-touchdown';
import {
  resumeScene,
  sceneView,
  sendSceneInput,
  stampSceneInput,
  startScene,
} from './engine/scene-player';
import type { SceneTransition } from './engine/scene-player';
import type { SceneInput } from './engine/scene-types';
import type { CargoId, GameState } from './engine/types';
import { createMissionStorage, createSaveEnvelope } from './services/storage';
import type { DurableTransition } from './engine/contracts';

import { registerBundledDonkiArchive } from './content/donkiArchive';
import {
  clearMissionSkyFreeze,
  fetchSkyForMission,
  freezeMissionSkySnapshot,
} from './services/sky';

const VERSION = 'sol1-v1';
const text = (key: string) =>
  (story as Record<string, string>)[key] ?? 'Content is not ready yet.';
const cargoNames: Record<CargoId, string> = {
  solar_extra: 'Extra solar panels',
  batteries: 'Batteries',
  shield_plating: 'Shield plating',
  greenhouse_kit: 'Greenhouse kit',
  water_recycler: 'Water recycler',
  spare_parts: 'Spare parts',
  rover_fuel: 'Rover supplies',
  radio_booster: 'Radio booster',
};

/** Temporary app-entry adapter. Member 4's presentation components replace this markup. */
export default function App() {
  const [storage] = useState(() =>
    createMissionStorage({ contentVersion: VERSION }),
  );
  const [saved, setSaved] = useState(() => storage.loadActive());
  const [plan, setPlan] = useState<GameState>();
  const [cargo, setCargo] = useState<CargoId[]>([]);
  const [transition, setTransition] = useState<SceneTransition>();
  const [runId, setRunId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [allowReplace, setAllowReplace] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [reducedMotion] = useState(
    () =>
      globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
      false,
  );

  async function start() {
    if (saved.kind === 'ready' && !confirmNew) {
      setConfirmNew(true);
      return;
    }
    setLoading(true);
    setStatus('Reading NASA observations…');
    try {
      const date = new Date().toISOString().slice(0, 10);
      registerBundledDonkiArchive();
      clearMissionSkyFreeze();
      const result = await fetchSkyForMission({ queryDate: date });
      if (!result.ok) throw new Error('Sky unavailable');
      const mission = createMission({
        missionDate: date,
        contentVersion: VERSION,
        sky: result.snapshot,
      });
      freezeMissionSkySnapshot(mission.sky!);
      setPlan(mission);
      setRunId(crypto.randomUUID());
      setCargo([]);
      setAllowReplace(confirmNew);
      setConfirmNew(false);
      setStatus('');
    } catch {
      setStatus(
        'NASA observations and saved fallback are unavailable. Please try again. Your saved mission is unchanged.',
      );
    } finally {
      setLoading(false);
    }
  }

  function persist(next: SceneTransition, id: string, replace = false) {
    const phase = next.playback.game.phase;
    const checkpoint: DurableTransition =
      phase === 'ENDED'
        ? 'ending'
        : phase === 'NIGHT'
          ? 'night'
          : phase === 'RESULT' || phase === 'REAL_CARD'
            ? 'choice_result'
            : 'sol_start';
    const result = storage.save(
      createSaveEnvelope({
        runId: id,
        state: next.playback.game,
        cursor: next.playback.cursor,
        checkpoint,
        savedAt: new Date().toISOString(),
      }),
      { replaceUnfinished: replace },
    );
    if (result.kind !== 'saved') {
      setStatus('This progress could not be saved. Keep this page open.');
      return false;
    }
    setStatus(
      result.mode === 'memory'
        ? 'Progress is kept in this tab only because browser storage is unavailable.'
        : '',
    );
    setSaved(storage.loadActive());
    return true;
  }

  function launch() {
    if (!plan || !validateLoadout(cargo).valid) return;
    const next = startScene(
      createSol01Scene(cargo),
      launchMission(plan, cargo),
    );
    if (!persist(next, runId, allowReplace)) return;
    setTransition(next);
    setPlan(undefined);
    setAllowReplace(false);
  }
  function restore() {
    if (saved.kind !== 'ready') return;
    try {
      const next = resumeScene(
        createSol01Scene(saved.save.state.cargo),
        saved.save,
        { reduceMotion: reducedMotion },
      );
      if (next.playback.game.sky)
        freezeMissionSkySnapshot(next.playback.game.sky);
      setRunId(saved.save.runId);
      setTransition(next);
      setStatus('');
    } catch {
      setStatus('This save cannot be opened with the current Sol 1 content.');
    }
  }
  function input(value: SceneInput) {
    if (!transition) return;
    const next = sendSceneInput(
      createSol01Scene(transition.playback.game.cargo),
      transition.playback,
      stampSceneInput(transition.playback, value),
      { reduceMotion: reducedMotion },
    );
    if (next.feedback) {
      setStatus('Try the habitat. Robo will help you find it!');
      return;
    }
    persist(next, runId);
    setTransition(next);
    setShowCard(false);
  }

  const playback = transition?.playback;
  const view = playback
    ? sceneView(createSol01Scene(playback.game.cargo), playback)
    : undefined;
  const state = playback?.game ?? plan;
  const step = view?.step;
  const send = (type: 'advance' | 'cancel_choice' | 'walk_finished') => {
    if (step) input({ type, stepId: step.id });
  };
  return (
    <main className="mission-shell [&_button]:m-1 [&_button]:min-h-11 [&_button]:rounded-lg [&_button]:border [&_button]:border-slate-500 [&_button]:px-4 [&_button]:py-2 [&_button]:disabled:opacity-40 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-4 [&_section]:max-w-2xl [&_p]:leading-relaxed">
      <p className="mission-label">Mars Mission Survival</p>
      <p>
        Development integration — Sol 1. Final outpost visuals, audio and photo
        cards are not connected yet.
      </p>
      <h1>
        {playback
          ? 'Sol 1: Touchdown at Gale Crater'
          : plan
            ? 'Pack your cargo'
            : 'Mission control'}
      </h1>
      {state && (
        <section aria-label="Mission resources">
          <p>
            Life Support: {state.meters.life} · Power: {state.meters.power} ·
            Shielding: {state.meters.shield}
          </p>
          <p>
            NASA input:{' '}
            {state.sky?.source === 'live'
              ? 'Live'
              : state.sky?.source === 'cache'
                ? 'Cached'
                : 'Saved'}{' '}
            · {state.sky?.level} · fetched {state.sky?.fetchedAt}
            {state.sky?.observedAt ? ` · observed ${state.sky.observedAt}` : ''}
          </p>
        </section>
      )}
      {!plan && !playback && (
        <section aria-label="Mission menu">
          {saved.kind === 'ready' && (
            <button onClick={restore}>Continue mission</button>
          )}
          <button disabled={loading} onClick={() => void start()}>
            {loading
              ? 'Reading observations…'
              : confirmNew
                ? 'Replace saved mission and start'
                : 'Start Mission'}
          </button>
          {confirmNew && (
            <>
              <p>
                Your current mission will be replaced only when the new cargo
                launches.
              </p>
              <button onClick={() => setConfirmNew(false)}>
                Keep saved mission
              </button>
            </>
          )}
          {saved.kind !== 'ready' && saved.kind !== 'empty' && (
            <p>
              Your saved mission is incompatible or damaged. You can start a new
              mission.
            </p>
          )}
        </section>
      )}
      {plan && (
        <section aria-label="Cargo planning">
          <p>
            Every rocket has a carrying limit. Choose the supplies you want to
            bring!
          </p>
          <p>
            Launch weight:{' '}
            {getCargoCatalog()
              .filter((c) => cargo.includes(c.id))
              .reduce((sum, c) => sum + c.weight, 0)}{' '}
            / 10
          </p>
          {getCargoCatalog().map((c) => (
            <label key={c.id} style={{ display: 'block', padding: 6 }}>
              <input
                type="checkbox"
                checked={cargo.includes(c.id)}
                onChange={() =>
                  setCargo((old) =>
                    old.includes(c.id)
                      ? old.filter((id) => id !== c.id)
                      : [...old, c.id],
                  )
                }
              />{' '}
              {cargoNames[c.id]} ({c.weight})
            </label>
          ))}
          {!validateLoadout(cargo).valid && (
            <p>
              That pack is too heavy. Remove something before adding this
              supply.
            </p>
          )}
          <button onClick={launch} disabled={!validateLoadout(cargo).valid}>
            Launch mission
          </button>
        </section>
      )}
      {view && step && (
        <section aria-label="Current scene" key={step.id}>
          {view.textKey && (
            <>
              <p>
                {'speaker' in step
                  ? step.speaker === 'robo'
                    ? 'Robo'
                    : step.speaker === 'kai'
                      ? 'Kai'
                      : 'Mei'
                  : ''}
              </p>
              <p>{text(view.textKey)}</p>
            </>
          )}
          {step.type === 'walk' && (
            <>
              <p>
                {view.walking
                  ? 'The Commander is walking to the habitat.'
                  : 'Tap the habitat to walk there.'}
              </p>
              <button
                onClick={() =>
                  input({
                    type: 'select_spot',
                    stepId: step.id,
                    spotId: 'habitat',
                  })
                }
                disabled={view.walking}
              >
                Habitat
              </button>
              {view.walking && (
                <button onClick={() => send('walk_finished')}>
                  Finish walk
                </button>
              )}
            </>
          )}
          {view.choices?.map((c) => (
            <button
              key={c.id}
              onClick={() =>
                input({ type: 'choose', stepId: step.id, choiceId: c.id })
              }
            >
              {text(c.labelKey)}
            </button>
          ))}
          {view.caution && (
            <div role="alertdialog" aria-label="Confirm resource use">
              <p>
                That would use all our{' '}
                {view.caution.failedMeter === 'life'
                  ? 'Life Support'
                  : view.caution.failedMeter === 'power'
                    ? 'Power'
                    : 'Shielding'}
                . Are you sure?
              </p>
              <button
                onClick={() =>
                  input({
                    type: 'confirm_choice',
                    stepId: step.id,
                    choiceId: view.caution!.choiceId,
                  })
                }
              >
                Choose this
              </button>
              <button onClick={() => send('cancel_choice')}>Go back</button>
            </div>
          )}
          {step.type === 'real_card' && (
            <>
              <p>Real Mars, tap to explore</p>
              <button onClick={() => setShowCard(!showCard)}>
                Explore Real Mars
              </button>
              {showCard && (
                <p>
                  The Gale card is collected. Verified fact and photo content
                  still needs to be connected.
                </p>
              )}
            </>
          )}
          {step.type === 'classroom_pause' && <p>{text(step.questionKey)}</p>}
          {[
            'narration',
            'dialogue',
            'after',
            'real_card',
            'classroom_pause',
          ].includes(step.type) && (
            <button onClick={() => send('advance')}>Continue</button>
          )}
        </section>
      )}
      {playback?.status === 'complete' && (
        <p>Sol 1 is complete and saved. Sol 2 is not connected yet.</p>
      )}
      {playback?.status === 'ended' && (
        <p>
          The crew is safe in the shelter. The ending screen is not connected
          yet.
        </p>
      )}
      {status && <p role="status">{status}</p>}
    </main>
  );
}
