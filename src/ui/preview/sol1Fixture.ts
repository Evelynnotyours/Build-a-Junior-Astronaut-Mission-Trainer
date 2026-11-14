import type { SceneStep } from '../../engine/scene-types';
import type { ResolvedSceneContent } from '../components/ScenePresenter';
import { PREVIEW_CHOICES } from './fixtures';

/** Tiny Sol 1-shaped timeline for the harness — not the real engine scene file. */
export const SOL1_PREVIEW_STEPS: SceneStep[] = [
  {
    id: 's1-mood',
    type: 'scene',
    mood: 'calm_day',
    next: 's1-narration',
  },
  {
    id: 's1-narration',
    type: 'narration',
    speaker: 'robo',
    expression: 'explaining',
    textKey: 'touchdown.narration',
    next: 's1-walk',
  },
  {
    id: 's1-walk',
    type: 'walk',
    target: 'habitat',
    next: 's1-dialogue',
  },
  {
    id: 's1-dialogue',
    type: 'dialogue',
    speaker: 'kai',
    expression: 'happy',
    textKey: 'touchdown.dialogue.1',
    next: 's1-choice',
  },
  {
    id: 's1-choice',
    type: 'choice',
    eventId: 'touchdown',
    nextByChoice: { A: 's1-after', B: 's1-after', C: 's1-after' },
  },
  {
    id: 's1-after',
    type: 'after',
    eventId: 'touchdown',
    choiceId: 'A',
    speaker: 'robo',
    expression: 'explaining',
    next: 's1-real',
  },
  {
    id: 's1-real',
    type: 'real_card',
    realMomentId: 'rm_touchdown',
    next: 's1-night',
  },
  {
    id: 's1-night',
    type: 'night',
  },
];

export function contentForStep(
  step: SceneStep,
  choiceId?: 'A' | 'B' | 'C',
): ResolvedSceneContent {
  switch (step.type) {
    case 'narration':
      return {
        text: 'Welcome, Commander! Manage your resources wisely and keep our crew alive on Mars! Let’s start our mission!',
      };
    case 'dialogue':
      return {
        speakerName: 'Kai',
        text: 'Habitat systems look ready, Commander. What should we do first?',
      };
    case 'choice':
      return { choices: PREVIEW_CHOICES };
    case 'after':
      return {
        text:
          choiceId === 'C'
            ? 'Rushing the test used more power. Robo will keep an eye on the batteries.'
            : choiceId === 'B'
              ? 'The ping reached Earth. A little power was used for the radio.'
              : 'Systems check complete. The outpost is awake and ready.',
      };
    case 'real_card':
      return {
        realCard: {
          title: 'Gale Crater',
          fact: 'Gale Crater is a giant bowl on Mars with a mountain in the middle.',
          sourceLabel: 'Fixture only — Member 3 verifies before release.',
        },
      };
    default:
      return {};
  }
}

export function nextStepId(
  steps: readonly SceneStep[],
  current: SceneStep,
  choiceId?: 'A' | 'B' | 'C',
): string | null {
  if (current.type === 'choice') {
    return current.nextByChoice[choiceId ?? 'A'] ?? null;
  }
  if ('next' in current && current.next) return current.next;
  const index = steps.findIndex((s) => s.id === current.id);
  return steps[index + 1]?.id ?? null;
}
