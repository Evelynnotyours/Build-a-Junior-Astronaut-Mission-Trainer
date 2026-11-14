import type { SpotId, SpotLayout } from './types';
/**
 * Percent layout for outpost sprites on the 16:9 stage.
 * Reference: greenhouse left · dual solar mid-left · air mid · habitat center-right · rover right.
 */
export type BuildingSlot = {
  id: string;
  left: number;
  top: number;
  width: number;
  z: number;
};

export const OUTPOST_BUILDINGS = {
  greenhouse: { id: 'greenhouse', left: 5, top: 28, width: 25, z: 3 },
  shelter: { id: 'shelter', left: 1, top: 60, width: 7, z: 2 },
  solar: { id: 'solar', left: 28, top: 54, width: 13, z: 4 },
  solarB: { id: 'solarB', left: 20, top: 58, width: 10, z: 3 },
  extraPanels: { id: 'extraPanels', left: 36, top: 60, width: 9, z: 3 },
  batteryBox: { id: 'batteryBox', left: 33, top: 66, width: 6, z: 5 },
  air: { id: 'air', left: 38, top: 46, width: 11, z: 5 },
  habitat: { id: 'habitat', left: 50, top: 24, width: 28, z: 5 },
  dish: { id: 'dish', left: 72, top: 20, width: 8, z: 4 },
  shieldPlating: { id: 'shieldPlating', left: 58, top: 48, width: 8, z: 5 },
  garage: { id: 'garage', left: 82, top: 40, width: 11, z: 4 },
  rover: { id: 'rover', left: 77, top: 52, width: 15, z: 6 },
} as const satisfies Record<string, BuildingSlot>;

export const MISSION_SPOTS: Record<SpotId, SpotLayout> = {
  greenhouse: {
    x: 7,
    y: 34,
    w: 18,
    h: 22,
    stand: [15, 62],
    label: 'Greenhouse',
  },
  solar: { x: 30, y: 56, w: 12, h: 14, stand: [34, 72], label: 'Solar panels' },
  air: { x: 38, y: 48, w: 10, h: 14, stand: [42, 68], label: 'Air module' },
  habitat: { x: 54, y: 28, w: 18, h: 24, stand: [62, 64], label: 'Habitat' },
  dish: { x: 72, y: 22, w: 8, h: 12, stand: [74, 48], label: 'Comms dish' },
  rover: { x: 80, y: 52, w: 12, h: 16, stand: [86, 72], label: 'Rover garage' },
};
