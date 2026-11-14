import type { ChoiceOption, SceneLayerFlags, SpotLayout } from '../components/types';
import type { Meters, SpotId } from '../../engine/types';
import { OUTPOST_BUILDINGS, OUTPOST_PATH_START } from '../components/outpostLayout';

/** Hotspots aligned to bottom-center building anchors. */
export const PREVIEW_SPOTS: Record<SpotId, SpotLayout> = {
  greenhouse: {
    x: OUTPOST_BUILDINGS.greenhouse.x - 5,
    y: 100 - OUTPOST_BUILDINGS.greenhouse.bottom - 14,
    w: 10,
    h: 14,
    stand: [OUTPOST_BUILDINGS.greenhouse.x + 8, 100 - OUTPOST_BUILDINGS.greenhouse.bottom + 4],
    label: 'Greenhouse',
  },
  solar: {
    x: OUTPOST_BUILDINGS.solar.x - 4,
    y: 100 - OUTPOST_BUILDINGS.solar.bottom - 10,
    w: 9,
    h: 10,
    stand: [50, 72],
    label: 'Solar panels',
  },
  air: {
    x: OUTPOST_BUILDINGS.air.x - 5,
    y: 100 - OUTPOST_BUILDINGS.air.bottom - 12,
    w: 10,
    h: 12,
    stand: [OUTPOST_BUILDINGS.air.x + 7, 100 - OUTPOST_BUILDINGS.air.bottom + 4],
    label: 'Air module',
  },
  habitat: {
    x: OUTPOST_BUILDINGS.habitat.x - 7,
    y: 100 - OUTPOST_BUILDINGS.habitat.bottom - 16,
    w: 14,
    h: 16,
    // Stand on the path, not on the solar row
    stand: [52, 70],
    label: 'Habitat',
  },
  dish: {
    x: OUTPOST_BUILDINGS.dish.x - 3,
    y: 100 - OUTPOST_BUILDINGS.dish.bottom - 10,
    w: 6,
    h: 10,
    stand: [OUTPOST_BUILDINGS.dish.x - 6, 100 - OUTPOST_BUILDINGS.dish.bottom + 4],
    label: 'Comms dish',
  },
  rover: {
    x: OUTPOST_BUILDINGS.rover.x - 5,
    y: 100 - OUTPOST_BUILDINGS.rover.bottom - 10,
    w: 10,
    h: 10,
    stand: [OUTPOST_PATH_START.x, OUTPOST_PATH_START.y],
    label: 'Rover garage',
  },
};

export const PREVIEW_METERS: Meters = {
  life: 80,
  power: 70,
  shield: 60,
};

export const PREVIEW_LAYERS: SceneLayerFlags = {
  sky: 'day',
  solar: 'clean',
  garageOpen: false,
  shelterOpen: false,
  extraPanels: false,
  batteryBox: false,
  shieldPlating: false,
  frost: false,
};

export const PREVIEW_CHOICES: ChoiceOption[] = [
  { id: 'A', label: 'Check the habitat systems', costs: ['Power 0'] },
  { id: 'B', label: 'Send a status ping to Earth', costs: ['Power −5'] },
  { id: 'C', label: 'Rush the power test', costs: ['Power −10'], caution: true },
];

export const PREVIEW_NOTES = [
  'Bottom-center anchors + depth scale; rover smaller; astronaut on the path.',
  'Decorative rocks are collision-resolved away from props (~20px / 2% clearance).',
  'No NASA logo in UI — team branding only.',
] as const;
