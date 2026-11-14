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
 * Two equal-spaced rows on the flat sand, packed side-by-side with light overlap.
 * Back row (farther): greenhouse · air · habitat · dish · garage
 * Front row (nearer): solar · solarB · shelter · rover
 * Cargo props (extra panels / battery / shield) only appear when packed — tucked
 * near related buildings, not in the main grid.
 */
const ROW_BACK = 40;
const ROW_FRONT = 26;
/** 5 equal slots across the sand for the back row. */
const BACK_XS = [16, 32, 48, 64, 78] as const;
/** 4 equal slots for the front row (slightly inset so feet stay on sand). */
const FRONT_XS = [20, 38, 56, 74] as const;

export const OUTPOST_BUILDINGS = {
  // —— Back row (farther / smaller) ——
  greenhouse: { id: 'greenhouse', x: BACK_XS[0], bottom: ROW_BACK, baseWidth: 10, z: 3 },
  air: { id: 'air', x: BACK_XS[1], bottom: ROW_BACK, baseWidth: 10, z: 3 },
  habitat: { id: 'habitat', x: BACK_XS[2], bottom: ROW_BACK, baseWidth: 12, z: 3 },
  dish: { id: 'dish', x: BACK_XS[3], bottom: ROW_BACK, baseWidth: 5, z: 3 },
  garage: { id: 'garage', x: BACK_XS[4], bottom: ROW_BACK, baseWidth: 8, z: 3 },
  // —— Front row (nearer / larger) ——
  solar: { id: 'solar', x: FRONT_XS[0], bottom: ROW_FRONT, baseWidth: 8, z: 5 },
  solarB: { id: 'solarB', x: FRONT_XS[1], bottom: ROW_FRONT, baseWidth: 8, z: 5 },
  shelter: { id: 'shelter', x: FRONT_XS[2], bottom: ROW_FRONT, baseWidth: 5.5, z: 5 },
  rover: { id: 'rover', x: FRONT_XS[3], bottom: ROW_FRONT, baseWidth: 7.5, z: 6 },
  // —— Cargo accents (only when layer flags are on) ——
  extraPanels: { id: 'extraPanels', x: 31, bottom: 20, baseWidth: 7, z: 5 },
  batteryBox: { id: 'batteryBox', x: 52, bottom: 20, baseWidth: 4.5, z: 5 },
  shieldPlating: { id: 'shieldPlating', x: 58, bottom: 36, baseWidth: 7, z: 3 },
} as const satisfies Record<string, BuildingSlot>;

/** Commander stands in the open sand ahead of the front row. */
export const OUTPOST_PATH_START = { x: 50, y: 88 } as const;

/** Walk hotspots aligned to the two-row building anchors. */
export const MISSION_SPOTS: Record<SpotId, SpotLayout> = {
  greenhouse: {
    x: OUTPOST_BUILDINGS.greenhouse.x - 5,
    y: 100 - OUTPOST_BUILDINGS.greenhouse.bottom - 14,
    w: 10,
    h: 14,
    stand: [
      OUTPOST_BUILDINGS.greenhouse.x,
      100 - OUTPOST_BUILDINGS.greenhouse.bottom + 6,
    ],
    label: 'Greenhouse',
  },
  solar: {
    x: OUTPOST_BUILDINGS.solar.x - 5,
    y: 100 - OUTPOST_BUILDINGS.solar.bottom - 10,
    w: 14,
    h: 10,
    stand: [
      (OUTPOST_BUILDINGS.solar.x + OUTPOST_BUILDINGS.solarB.x) / 2,
      100 - OUTPOST_BUILDINGS.solar.bottom + 6,
    ],
    label: 'Solar panels',
  },
  air: {
    x: OUTPOST_BUILDINGS.air.x - 5,
    y: 100 - OUTPOST_BUILDINGS.air.bottom - 12,
    w: 10,
    h: 12,
    stand: [
      OUTPOST_BUILDINGS.air.x,
      100 - OUTPOST_BUILDINGS.air.bottom + 6,
    ],
    label: 'Air module',
  },
  habitat: {
    x: OUTPOST_BUILDINGS.habitat.x - 6,
    y: 100 - OUTPOST_BUILDINGS.habitat.bottom - 14,
    w: 12,
    h: 14,
    stand: [
      OUTPOST_BUILDINGS.habitat.x,
      100 - OUTPOST_BUILDINGS.habitat.bottom + 6,
    ],
    label: 'Habitat',
  },
  dish: {
    x: OUTPOST_BUILDINGS.dish.x - 4,
    y: 100 - OUTPOST_BUILDINGS.dish.bottom - 12,
    w: 8,
    h: 12,
    stand: [
      OUTPOST_BUILDINGS.dish.x,
      100 - OUTPOST_BUILDINGS.dish.bottom + 6,
    ],
    label: 'Comms dish',
  },
  rover: {
    x: OUTPOST_BUILDINGS.garage.x - 5,
    y: 100 - OUTPOST_BUILDINGS.garage.bottom - 12,
    w: 10,
    h: 12,
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

/** Always-visible outpost props (excludes cargo accents). */
export const OUTPOST_MAIN_BUILDINGS: Record<string, BuildingSlot> = {
  greenhouse: OUTPOST_BUILDINGS.greenhouse,
  air: OUTPOST_BUILDINGS.air,
  habitat: OUTPOST_BUILDINGS.habitat,
  dish: OUTPOST_BUILDINGS.dish,
  garage: OUTPOST_BUILDINGS.garage,
  solar: OUTPOST_BUILDINGS.solar,
  solarB: OUTPOST_BUILDINGS.solarB,
  shelter: OUTPOST_BUILDINGS.shelter,
  rover: OUTPOST_BUILDINGS.rover,
};

/** Decorative rocks in clear edge gaps only (never overlapping props/commander). */
export function placeOutpostRocks(
  buildings: Record<string, BuildingSlot> = OUTPOST_MAIN_BUILDINGS,
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
