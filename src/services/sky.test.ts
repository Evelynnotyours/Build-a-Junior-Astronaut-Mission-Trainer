// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FrozenSky } from '../engine/types';
import {
  SKY_CACHE_TTL_MS,
  applyLateSkyResponseIfAllowed,
  clearMissionSkyFreeze,
  fetchSkyForMission,
  freezeMissionSkySnapshot,
  parseSkyResponse,
  pickArchivedResponse,
  readSkyCache,
  registerDonkiArchive,
  resetSkyServiceState,
  skyCacheKey,
  writeSkyCache,
} from './sky';

const memoryStorage = (): Storage => {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
};

const validApiBody = {
  date: '2026-11-14',
  level: 'active',
  event: {
    id: 'flr-1',
    type: 'FLR',
    observedAt: '2026-11-10T12:00:00Z',
    sourceUrl: 'https://api.nasa.gov/DONKI/FLR/1',
    classType: 'M2.0',
  },
  source: 'live',
  fetchedAt: '2026-11-14T08:00:00.000Z',
  windowStart: '2026-11-07',
  windowEnd: '2026-11-14',
} as const;

const archive = {
  events: [
    {
      id: 'archive-1',
      type: 'FLR',
      level: 'stormy' as const,
      observedAt: '2018-09-06T12:00:00Z',
      sourceUrl: 'https://api.nasa.gov/DONKI/FLR/archived',
      classType: 'X1.0',
    },
  ],
};

describe('parseSkyResponse', () => {
  it('accepts a valid SkyResponse', () => {
    expect(parseSkyResponse(validApiBody)?.level).toBe('active');
  });

  it('rejects invalid wire payloads', () => {
    expect(parseSkyResponse({ date: '2026-11-14', level: 'bogus' })).toBeNull();
    expect(parseSkyResponse(null)).toBeNull();
  });
});

describe('fetchSkyForMission', () => {
  let storage: Storage;

  beforeEach(() => {
    resetSkyServiceState();
    registerDonkiArchive(archive);
    storage = memoryStorage();
    vi.stubGlobal('window', { localStorage: storage });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearMissionSkyFreeze();
    vi.unstubAllGlobals();
  });

  it('uses live data when /api/sky succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => validApiBody,
      }),
    );

    const result = await fetchSkyForMission({ queryDate: '2026-11-14' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.resolvedSource).toBe('live');
    expect(result.snapshot.observedAt).toBe('2026-11-10T12:00:00Z');
    expect(result.snapshot.fetchedAt).toBe('2026-11-14T08:00:00.000Z');
    expect(storage.getItem(skyCacheKey('2026-11-14'))).toContain('storedAt');
  });

  it('falls back to cached data when live fetch fails', async () => {
    const now = Date.parse('2026-11-14T09:00:00.000Z');
    writeSkyCache({ ...validApiBody, source: 'live' }, storage, now);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }),
    );

    const result = await fetchSkyForMission({ queryDate: '2026-11-14', now });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.resolvedSource).toBe('cache');
  });

  it('falls back to bundled archive when live and cache are missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }),
    );

    const result = await fetchSkyForMission({ queryDate: '2026-11-14' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.resolvedSource).toBe('saved');
    expect(result.response.event?.id).toBe('archive-1');
  });

  it('returns unavailable without inventing calm on invalid live JSON', async () => {
    registerDonkiArchive({ events: [] });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ date: '2026-11-14', level: 'not-a-level' }),
      }),
    );

    const result = await fetchSkyForMission({ queryDate: '2026-11-14' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('unavailable');
  });

  it('does not refetch when restoring Continue snapshot', async () => {
    const restore: FrozenSky = {
      level: 'stormy',
      source: 'saved',
      fetchedAt: '2026-11-01T00:00:00.000Z',
      observedAt: '2018-09-06T12:00:00Z',
      eventId: 'archive-1',
      sourceUrl: 'https://api.nasa.gov/DONKI/FLR/archived',
    };
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchSkyForMission({
      queryDate: '2026-11-14',
      restoreSnapshot: restore,
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot).toEqual(restore);
  });

  it('discards an in-flight live response after mission freeze is set', async () => {
    let resolveFetch: (value: unknown) => void = () => undefined;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal('fetch', vi.fn(() => fetchPromise));

    const pending = fetchSkyForMission({ queryDate: '2026-11-14' });
    freezeMissionSkySnapshot({
      level: 'calm',
      source: 'saved',
      fetchedAt: '2026-11-14T08:00:00.000Z',
    });
    resolveFetch({
      ok: true,
      status: 200,
      json: async () => validApiBody,
    });

    const result = await pending;
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.level).toBe('calm');
    expect(result.snapshot.source).toBe('saved');
    expect(applyLateSkyResponseIfAllowed({ ...validApiBody, level: 'stormy' })).toBe(false);
  });
});

describe('readSkyCache', () => {
  it('expires entries older than 48 hours', () => {
    const storage = memoryStorage();
    const old = Date.parse('2026-01-01T00:00:00.000Z');
    writeSkyCache(validApiBody, storage, old);
    const hit = readSkyCache('2026-11-14', storage, old + SKY_CACHE_TTL_MS + 1);
    expect(hit).toBeNull();
  });
});

describe('pickArchivedResponse', () => {
  it('is deterministic for a query date', () => {
    registerDonkiArchive(archive);
    const a = pickArchivedResponse('2026-11-14');
    const b = pickArchivedResponse('2026-11-14');
    expect(a?.event?.id).toBe(b?.event?.id);
  });
});