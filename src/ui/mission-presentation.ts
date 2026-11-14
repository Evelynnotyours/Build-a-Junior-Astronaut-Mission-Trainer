import type { SceneDefinition, SceneStep } from '../engine/scene-types';
import type { ScenePlayback } from '../engine/scene-player';
import type { MoodId } from '../engine/types';
import type { SceneLayerFlags } from './components/types';
import { MISSION_SPOTS } from './components/outpostLayout';

/** Rebuild presentation from the actual authored route; refreshing never replays resource effects. */
export function scenePresentation(
  scene: SceneDefinition,
  playback: ScenePlayback,
) {
  const visited: SceneStep[] = [];
  let id: string | undefined = scene.entryStepId;
  for (let i = 0; id && i < scene.steps.length; i++) {
    const step = scene.steps.find((s) => s.id === id);
    if (!step) break;
    visited.push(step);
    if (step.id === playback.cursor.stepId) break;
    id =
      step.type === 'choice'
        ? playback.cursor.selectedChoiceId
          ? step.nextByChoice[playback.cursor.selectedChoiceId]
          : undefined
        : step.next;
  }
  const mood =
    [...visited]
      .reverse()
      .find(
        (s): s is Extract<SceneStep, { type: 'scene' }> => s.type === 'scene',
      )?.mood ?? 'calm_day';
  const lastWalk = [...visited]
    .reverse()
    .find((s): s is Extract<SceneStep, { type: 'walk' }> => s.type === 'walk');
  const walked =
    lastWalk &&
    (lastWalk.id !== playback.cursor.stepId ||
      playback.game.phase === 'WALKING');
  const stand = walked ? MISSION_SPOTS[lastWalk.target].stand : [46, 70];
  const sky: SceneLayerFlags['sky'] = [
    'dusk_night',
    'cold_night',
    'meteors',
  ].includes(mood)
    ? 'night'
    : ['dust_storm', 'finale_storm'].includes(mood)
      ? 'dust'
      : ['golden_dawn', 'finale_dawn'].includes(mood)
        ? 'dawn'
        : 'day';
  const layers: SceneLayerFlags = {
    sky,
    solar: playback.game.solarPenalty ? 'damaged' : 'clean',
    frost: mood === 'cold_night',
    garageOpen: scene.eventId === 'ice_hunt',
    shelterOpen: playback.game.ending === 'gentle',
  };
  if (
    scene.eventId === 'dust_storm' &&
    playback.cursor.selectedChoiceId === 'A'
  )
    layers.solar = 'covered';
  return {
    mood: mood as MoodId,
    layers,
    commander: { x: stand[0], y: stand[1] },
    cues: visited
      .filter((s) => s.type === 'camera' || s.type === 'effect')
      .map((s) => s.cueKey),
  };
}
