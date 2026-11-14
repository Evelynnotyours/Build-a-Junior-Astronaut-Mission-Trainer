import type { ChoiceOption, SceneLayerFlags, SpotLayout } from '../components/types';
import type { Meters, SpotId } from '../../engine/types';

/** Tuned for mars_vista.jpg path composition — still placeholders until measured spots.json. */
export const PREVIEW_SPOTS: Record<SpotId, SpotLayout> = {
  habitat: { x: 42, y: 38, w: 18, h: 18, stand: [50, 72], label: 'Habitat control' },
  air: { x: 34, y: 40, w: 10, h: 16, stand: [40, 70], label: 'Air module' },
  greenhouse: { x: 18, y: 36, w: 16, h: 20, stand: [28, 68], label: 'Greenhouse' },
  solar: { x: 8, y: 52, w: 16, h: 18, stand: [22, 74], label: 'Solar panels' },
  dish: { x: 62, y: 28, w: 10, h: 16, stand: [64, 58], label: 'Comms dish' },
  rover: { x: 70, y: 58, w: 16, h: 16, stand: [74, 76], label: 'Rover garage' },
};

export const PREVIEW_METERS: Meters = {
  life: 80,
  power: 70,
  shield: 60,
};

export const PREVIEW_LAYERS: SceneLayerFlags = {
  sky: 'night',
  solar: 'clean',
  garageOpen: false,
  shelterOpen: false,
  extraPanels: true,
  batteryBox: true,
  shieldPlating: false,
  frost: false,
};

export const PREVIEW_BACKDROP = '/assets/bg/mars_vista.jpg';

export const PREVIEW_CHOICES: ChoiceOption[] = [
  { id: 'A', label: 'Check the habitat systems', costs: ['Power 0'] },
  { id: 'B', label: 'Send a status ping to Earth', costs: ['Power −5'] },
  { id: 'C', label: 'Rush the power test', costs: ['Power −10'], caution: true },
];

export const PREVIEW_NOTES = [
  'Layout styled after the team UI reference; confirmed meters stay Life Support / Power / Shielding (no Food bar).',
  'Background uses public/assets/bg/mars_vista.jpg (your landscape photo).',
  'No NASA logo in UI — team branding only.',
] as const;
