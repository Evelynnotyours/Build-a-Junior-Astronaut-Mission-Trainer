import type { SpotId, SpotLayout } from './types';
/**
 * Outpost layout — bottom-center anchors, depth scaling, rock clearance.
 * Coordinates are scene-relative % so the layout stays responsive.
 */

export type BuildingSlot = {
  id: string;
  /** Bottom-center X (% from left). */
  x: number;
  /** Feet Y (% from stage bottom). Higher = farther up the vista. */
  bottom: number;
  /** Nominal width at scale 1 before depth scaling. */
  baseWidth: number;
  z: number;
};

export type RockSize = 'small' | 'medium' | 'large';

export type RockSlot = {
  id: string;
  x: number;
  bottom: number;
  baseWidth: number;
  size: RockSize;
  z: number;
};

export type LayoutRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/** ~20px on a ~1180px stage → ~1.7%; use 2% for safety. */
export const LAYOUT_CLEARANCE_PCT = 2;
export const LAYOUT_MARGIN_PCT = 5;

const ROCK_SRC: Record<RockSize, string> = {
  small: '/assets/minigames/rock_small.png',
  medium: '/assets/minigames/rock_medium.png',
  large: '/assets/minigames/rock_large.png',
};

export function rockSrc(size: RockSize): string {
  return ROCK_SRC[size];
}

/**
 * Depth scale from vertical position.
 * Higher on screen (farther) → smaller. Lower (nearer) → larger.
 * Matches: scale = 0.55 + (yFromTop / 100) * 0.65
 */
export function depthScale(bottomPct: number): number {
  const yFromTop = Math.max(0, Math.min(100, 100 - bottomPct));
  return 0.55 + (yFromTop / 100) * 0.65;
}

export function scaledWidth(baseWidth: number, bottomPct: number): number {
  return baseWidth * depthScale(bottomPct);
}

export function slotRect(
  x: number,
  bottom: number,
  baseWidth: number,
  heightRatio = 0.9,
): LayoutRect {
  const w = scaledWidth(baseWidth, bottom);
  const h = w * heightRatio;
  return {
    x: x - w / 2,
    y: 100 - bottom - h,
    w,
    h,
  };
}

export function rectsOverlap(a: LayoutRect, b: LayoutRect, pad = LAYOUT_CLEARANCE_PCT): boolean {
  return !(
    a.x + a.w + pad <= b.x ||
    b.x + b.w + pad <= a.x ||
    a.y + a.h + pad <= b.y ||
    b.y + b.h + pad <= a.y
  );
}

/**
 * Reference layout:
 * dome far-left small · air center · habitat center-right · dish far-right small
 * solar neat row + crate near habitat · smaller rover beside path · commander on path
 */
export const OUTPOST_BUILDINGS = {
  // Far left, farther → smaller
  greenhouse: { id: 'greenhouse', x: 11, bottom: 42, baseWidth: 8.5, z: 3 },
  // Center small module
  air: { id: 'air', x: 36, bottom: 32, baseWidth: 9.5, z: 4 },
  // Center-right main base
  habitat: { id: 'habitat', x: 60, bottom: 27, baseWidth: 14, z: 5 },
  // Far right antenna, small
  dish: { id: 'dish', x: 86, bottom: 40, baseWidth: 3.6, z: 3 },
  // Neat solar row on habitat apron (right of path, left of habitat)
  solar: { id: 'solar', x: 51, bottom: 19, baseWidth: 5.4, z: 4 },
  solarB: { id: 'solarB', x: 54.8, bottom: 19, baseWidth: 5.4, z: 4 },
  extraPanels: { id: 'extraPanels', x: 58.6, bottom: 19, baseWidth: 5.2, z: 3 },
  // Crate beside solar row (not screen edge)
  shelter: { id: 'shelter', x: 47.5, bottom: 18.5, baseWidth: 3, z: 3 },
  batteryBox: { id: 'batteryBox', x: 49.2, bottom: 17.5, baseWidth: 2.4, z: 5 },
  shieldPlating: { id: 'shieldPlating', x: 65, bottom: 21, baseWidth: 6, z: 4 },
  garage: { id: 'garage', x: 70, bottom: 20, baseWidth: 5.5, z: 3 },
  // Rover ~60% prior size, clear sand beside path (left of corner rocks)
  rover: { id: 'rover', x: 66, bottom: 16, baseWidth: 5.2, z: 6 },
} as const satisfies Record<string, BuildingSlot>;

/** Commander feet in the middle of the winding path. */
export const OUTPOST_PATH_START = { x: 48, y: 78 } as const;

/** Walk hotspots aligned to the bottom-center building anchors. */
export const MISSION_SPOTS: Record<SpotId, SpotLayout> = {
  greenhouse: {
    x: OUTPOST_BUILDINGS.greenhouse.x - 5,
    y: 100 - OUTPOST_BUILDINGS.greenhouse.bottom - 14,
    w: 10,
    h: 14,
    stand: [
      OUTPOST_BUILDINGS.greenhouse.x + 8,
      100 - OUTPOST_BUILDINGS.greenhouse.bottom + 4,
    ],
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
    stand: [
      OUTPOST_BUILDINGS.air.x + 7,
      100 - OUTPOST_BUILDINGS.air.bottom + 4,
    ],
    label: 'Air module',
  },
  habitat: {
    x: OUTPOST_BUILDINGS.habitat.x - 7,
    y: 100 - OUTPOST_BUILDINGS.habitat.bottom - 16,
    w: 14,
    h: 16,
    stand: [52, 70],
    label: 'Habitat',
  },
  dish: {
    x: OUTPOST_BUILDINGS.dish.x - 3,
    y: 100 - OUTPOST_BUILDINGS.dish.bottom - 10,
    w: 6,
    h: 10,
    stand: [
      OUTPOST_BUILDINGS.dish.x - 6,
      100 - OUTPOST_BUILDINGS.dish.bottom + 4,
    ],
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

/** Edge rock seeds only — kept away from path/props by collision resolve. */
const ROCK_SEEDS: readonly RockSlot[] = [
  { id: 'rock-bl', x: 5, bottom: 7, baseWidth: 4.5, size: 'large', z: 1 },
  { id: 'rock-br', x: 95, bottom: 6, baseWidth: 4.5, size: 'large', z: 1 },
  { id: 'rock-ml', x: 3.5, bottom: 32, baseWidth: 3, size: 'medium', z: 1 },
  { id: 'rock-mr', x: 96.5, bottom: 31, baseWidth: 3, size: 'medium', z: 1 },
];

function clampRock(rock: RockSlot): RockSlot {
  const half = scaledWidth(rock.baseWidth, rock.bottom) / 2;
  return {
    ...rock,
    x: Math.min(100 - LAYOUT_MARGIN_PCT - half, Math.max(LAYOUT_MARGIN_PCT + half, rock.x)),
    bottom: Math.min(46, Math.max(6, rock.bottom)),
  };
}

function buildingObstacleRects(
  buildings: Record<string, BuildingSlot>,
  commander?: { x: number; y: number },
): LayoutRect[] {
  const rects = Object.values(buildings).map((b) =>
    slotRect(b.x, b.bottom, b.baseWidth, b.id === 'rover' ? 0.55 : 0.9),
  );
  if (commander) {
    rects.push({
      x: commander.x - 1.5,
      y: commander.y - 5,
      w: 3,
      h: 5,
    });
  }
  return rects;
}

function resolveRock(rock: RockSlot, obstacles: LayoutRect[]): RockSlot {
  let next = clampRock(rock);
  for (let i = 0; i < 28; i += 1) {
    const box = slotRect(next.x, next.bottom, next.baseWidth, 0.7);
    const hit = obstacles.find((o) => rectsOverlap(box, o));
    if (!hit) return next;

    const centerX = hit.x + hit.w / 2;
    const away = next.x >= centerX ? 1 : -1;
    next = clampRock({
      ...next,
      x: next.x + away * 4,
      bottom: Math.max(6, next.bottom + (away > 0 ? -1 : 1.5)),
    });
  }
  return clampRock({
    ...next,
    x: next.x < 50 ? LAYOUT_MARGIN_PCT + 3 : 100 - LAYOUT_MARGIN_PCT - 3,
    bottom: 8,
  });
}

/** Decorative rocks in clear edge gaps only (never overlapping props/commander). */
export function placeOutpostRocks(
  buildings: Record<string, BuildingSlot> = OUTPOST_BUILDINGS,
  commander: { x: number; y: number } = OUTPOST_PATH_START,
): RockSlot[] {
  const obstacles = buildingObstacleRects(buildings, commander);
  const placed: RockSlot[] = [];
  for (const seed of ROCK_SEEDS) {
    const resolved = resolveRock(seed, [
      ...obstacles,
      ...placed.map((r) => slotRect(r.x, r.bottom, r.baseWidth, 0.7)),
    ]);
    placed.push(resolved);
  }
  return placed;
}

export const OUTPOST_ROCKS = placeOutpostRocks();
