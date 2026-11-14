import type { ChoiceOption, SceneLayerFlags, SpotLayout } from '../components/types';
import type { Meters, SpotId } from '../../engine/types';

/**
 * Hotspots aligned to outpostLayout building slots (reference composition).
 * stand = Commander feet percent [x, y].
 */
export const PREVIEW_SPOTS: Record<SpotId, SpotLayout> = {
  greenhouse: { x: 7, y: 34, w: 18, h: 22, stand: [15, 62], label: 'Greenhouse' },
  solar: { x: 30, y: 56, w: 12, h: 14, stand: [34, 72], label: 'Solar panels' },
  air: { x: 38, y: 48, w: 10, h: 14, stand: [42, 68], label: 'Air module' },
  habitat: { x: 54, y: 28, w: 18, h: 24, stand: [62, 64], label: 'Habitat' },
  dish: { x: 72, y: 22, w: 8, h: 12, stand: [74, 48], label: 'Comms dish' },
  rover: { x: 80, y: 52, w: 12, h: 16, stand: [86, 72], label: 'Rover garage' },
};

export const PREVIEW_METERS: Meters = {
  life: 80,
  power: 70,
  shield: 60,
};

export const PREVIEW_LAYERS: SceneLayerFlags = {
  sky: 'dawn',
  solar: 'clean',
  garageOpen: false,
  shelterOpen: false,
  extraPanels: false,
  batteryBox: false,
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
