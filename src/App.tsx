import { useMemo, useState } from 'react';
import story from './content/story.json';
import { createMission } from './engine/state';
import { launchMission } from './engine/resources';
import { validateLoadout } from './engine/loadout';
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
import type { CargoId, GameState, SkySource } from './engine/types';
import { createMissionStorage, createSaveEnvelope } from './services/storage';
import type { DurableTransition } from './engine/contracts';

import { registerBundledDonkiArchive } from './content/donkiArchive';
import {
  clearMissionSkyFreeze,
  fetchSkyForMission,
  freezeMissionSkySnapshot,
} from './services/sky';

import { ScenePresenter } from './ui/components/ScenePresenter';
import type { ResolvedSceneContent } from './ui/components/ScenePresenter';
import { PREVIEW_SPOTS } from './ui/preview/fixtures';
import { LearnScreen } from './ui/screens/LearnScreen';
import { PlanScreen } from './ui/screens/PlanScreen';
import { PrologueScreen } from './ui/screens/PrologueScreen';
import { SceneScreen } from './ui/screens/SceneScreen';
import { SettingsScreen, type SettingsValues } from './ui/screens/SettingsScreen';
import { SourcesScreen } from './ui/screens/SourcesScreen';
import { TeachersScreen } from './ui/screens/TeachersScreen';
import { TitleScreen, type TitleAction } from './ui/screens/TitleScreen';

const VERSION = 'sol1-v1';
const text = (key: string) =>
  (story as Record<string, string>)[key] ?? 'Content is not ready yet.';

type AppPhase = 'title' | 'plan' | 'prologue' | 'scene';
type MenuOverlay = 'learn' | 'teachers' | 'sources' | 'settings' | null;

/** App shell: Title → Plan → Prologue → Sol 1 scene (Member 4 UI + Member 1 engine). */
export default function App() {
  const [storage] = useState(() =>
    createMissionStorage({ contentVersion: VERSION }),
  );
  const [saved, setSaved] = useState(() => storage.loadActive());
  const [phase, setPhase] = useState<AppPhase>('title');
  const [overlay, setOverlay] = useState<MenuOverlay>(null);
  const [plan, setPlan] = useState<GameState>();
  const [pendingLaunch, setPendingLaunch] = useState<{
    game: GameState;
    cargo: CargoId[];
  }>();
  const [transition, setTransition] = useState<SceneTransition>();
  const [runId, setRunId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [allowReplace, setAllowReplace] = useState(false);
  const [settings, setSettings] = useState<SettingsValues>(() => ({
    soundEnabled: true,
    reduceMotion:
      globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ??
      false,
    textSize: 'md',
    classroomMode: false,
  }));

  const reducedMotion = settings.reduceMotion;

  async function start(replace = false) {
    if (saved.kind === 'ready' && !replace && !confirmNew) {
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
      setAllowReplace(replace || confirmNew);
      setConfirmNew(false);
      setPhase('plan');
      setOverlay(null);
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
    const phaseName = next.playback.game.phase;
    const checkpoint: DurableTransition =
      phaseName === 'ENDED'
        ? 'ending'
        : phaseName === 'NIGHT'
          ? 'night'
          : phaseName === 'RESULT' || phaseName === 'REAL_CARD'
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

  function beginPrologue(cargo: CargoId[]) {
    if (!plan || !validateLoadout(cargo).valid) return;
    setPendingLaunch({ game: plan, cargo });
    setPlan(undefined);
    setPhase('prologue');
  }

  function enterScene(from: { game: GameState; cargo: CargoId[] }) {
    const next = startScene(
      createSol01Scene(from.cargo),
      launchMission(from.game, from.cargo),
    );
    if (!persist(next, runId, allowReplace)) return;
    setTransition(next);
    setPendingLaunch(undefined);
    setAllowReplace(false);
    setPhase('scene');
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
      setPhase('scene');
      setOverlay(null);
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
  }

  function onTitleAction(action: TitleAction) {
    if (action === 'start') {
      void start(false);
      return;
    }
    if (action === 'continue') {
      restore();
      return;
    }
    if (action === 'learn') setOverlay('learn');
    if (action === 'teachers') setOverlay('teachers');
    if (action === 'sources') setOverlay('sources');
    if (action === 'settings') setOverlay('settings');
  }

  const playback = transition?.playback;
  const view = playback
    ? sceneView(createSol01Scene(playback.game.cargo), playback)
    : undefined;
  const state = playback?.game ?? plan ?? pendingLaunch?.game;
  const step = view?.step;

  const content: ResolvedSceneContent = useMemo(() => {
    if (!view || !step) return {};
    const speaker =
      'speaker' in step
        ? step.speaker === 'robo'
          ? 'Robo'
          : step.speaker === 'kai'
            ? 'Kai'
            : step.speaker === 'mei'
              ? 'Mei'
              : 'Dr. Thiri'
        : undefined;
    return {
      text: view.textKey ? text(view.textKey) : undefined,
      speakerName: speaker,
      choices: view.choices?.map((c) => ({
        id: c.id,
        label: text(c.labelKey),
        caution: view.caution?.choiceId === c.id,
      })),
      realCard: {
        title: 'Gale Crater',
        fact: 'Gale Crater is a giant bowl on Mars about 154 km (96 miles) wide!',
        sourceLabel: 'NASA Mars Exploration · Gale Crater',
        photoSrc: '/assets/bg/mars_vista.jpg',
        photoAlt: 'Mars landscape for Gale Crater',
      },
    };
  }, [view, step]);

  const layers = useMemo(() => {
    const cargo = playback?.game.cargo ?? pendingLaunch?.cargo ?? [];
    return {
      sky: 'dawn' as const,
      solar: 'clean' as const,
      extraPanels: cargo.includes('solar_extra'),
      batteryBox: cargo.includes('batteries'),
      shieldPlating: cargo.includes('shield_plating'),
      frost: false,
      garageOpen: false,
      shelterOpen: playback?.status === 'ended',
    };
  }, [playback, pendingLaunch]);

  const commanderStart = { x: 46, y: 70 };

  if (overlay === 'learn') return <LearnScreen onClose={() => setOverlay(null)} />;
  if (overlay === 'teachers')
    return (
      <TeachersScreen
        classroomMode={settings.classroomMode}
        onClassroomModeChange={(enabled) =>
          setSettings((s) => ({
            ...s,
            classroomMode: enabled,
            ...(enabled ? { soundEnabled: false, reduceMotion: true } : {}),
          }))
        }
        onClose={() => setOverlay(null)}
      />
    );
  if (overlay === 'sources')
    return <SourcesScreen onClose={() => setOverlay(null)} />;
  if (overlay === 'settings')
    return (
      <SettingsScreen
        values={settings}
        onChange={setSettings}
        onClose={() => setOverlay(null)}
      />
    );

  if (phase === 'plan' && plan) {
    const skyStatus = (plan.sky?.source ?? 'saved') as SkySource;
    return (
      <>
        <PlanScreen
          skyLevel={plan.sky?.level ?? 'calm'}
          skyStatus={skyStatus}
          observationDate={plan.sky?.observedAt?.slice(0, 10) ?? plan.missionDate}
          solarGainPreview={12}
          onBack={() => {
            setPlan(undefined);
            setPhase('title');
            setConfirmNew(false);
          }}
          onLaunch={beginPrologue}
        />
        {status ? <p role="status">{status}</p> : null}
        {loading ? <p role="status">Reading observations…</p> : null}
      </>
    );
  }

  if (phase === 'prologue' && pendingLaunch) {
    return (
      <PrologueScreen
        reduceMotion={reducedMotion}
        onComplete={() => enterScene(pendingLaunch)}
        onSkip={() => enterScene(pendingLaunch)}
      />
    );
  }

  if (phase === 'scene' && playback && state) {
    return (
      <div className="app-scene">
        <SceneScreen
          meters={state.meters}
          sol={state.sol}
          phaseLabel={state.phase === 'NIGHT' ? 'Night' : 'Day'}
          reduceMotion={reducedMotion}
        >
          {view && step ? (
            <ScenePresenter
              step={step}
              reduceMotion={reducedMotion}
              onInput={input}
              content={content}
              spots={PREVIEW_SPOTS}
              layers={layers}
              settings={{
                reduceMotion: reducedMotion,
                soundEnabled: settings.soundEnabled,
              }}
              backdropSrc="/assets/bg/mars_vista.jpg"
              showBuildings
              commanderStart={commanderStart}
            />
          ) : null}
        </SceneScreen>

        {view?.caution ? (
          <div className="app-caution" role="alertdialog" aria-label="Confirm resource use">
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
              type="button"
              onClick={() =>
                step &&
                input({
                  type: 'confirm_choice',
                  stepId: step.id,
                  choiceId: view.caution!.choiceId,
                })
              }
            >
              Choose this
            </button>
            <button
              type="button"
              onClick={() =>
                step && input({ type: 'cancel_choice', stepId: step.id })
              }
            >
              Go back
            </button>
          </div>
        ) : null}

        <p className="app-meter-readout" aria-live="polite">
          Life Support: {state.meters.life} · Power: {state.meters.power} ·
          Shielding: {state.meters.shield}
        </p>

        {playback.status === 'complete' && (
          <p role="status">Sol 1 is complete and saved. Sol 2 is not connected yet.</p>
        )}
        {playback.status === 'ended' && (
          <p role="status">
            The crew is safe in the shelter. The ending screen is not connected
            yet.
          </p>
        )}
        {status ? <p role="status">{status}</p> : null}
      </div>
    );
  }

  return (
    <>
      <TitleScreen
        canContinue={saved.kind === 'ready'}
        replaceWarning={confirmNew}
        sky={
          saved.kind === 'ready' && saved.save.state.sky
            ? {
                level: saved.save.state.sky.level,
                status: saved.save.state.sky.source,
                observationDate: saved.save.state.sky.observedAt?.slice(0, 10),
              }
            : undefined
        }
        onAction={onTitleAction}
        onConfirmStart={() => void start(true)}
        onCancelStart={() => setConfirmNew(false)}
      />
      {loading ? <p role="status">Reading observations…</p> : null}
      {status ? <p role="status">{status}</p> : null}
      {saved.kind !== 'ready' && saved.kind !== 'empty' ? (
        <p role="status">
          Your saved mission is incompatible or damaged. You can start a new
          mission.
        </p>
      ) : null}
    </>
  );
}
