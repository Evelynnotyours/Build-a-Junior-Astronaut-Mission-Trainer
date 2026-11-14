import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { resetSkyServiceState, writeSkyCache } from './services/sky';

beforeEach(() => {
  localStorage.clear();
  resetSkyServiceState();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function backend() {
  // Test-only backend response: never bundled into the production application.
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        date: new Date().toISOString().slice(0, 10),
        level: 'active',
        source: 'saved',
        event: null,
        fetchedAt: '2026-11-14T00:00:00Z',
      }),
    })),
  );
}
async function launch() {
  fireEvent.click(screen.getByRole('button', { name: 'Start Mission' }));
  await screen.findByRole('heading', { name: 'Pack your cargo' });
  fireEvent.click(screen.getByRole('button', { name: 'Launch mission' }));
  // Prologue: skip straight into Sol 1 for integration tests.
  fireEvent.click(screen.getByRole('button', { name: 'Skip prologue' }));
}
function readToChoice() {
  for (let count = 0; count < 40; count++) {
    if (screen.queryByRole('button', { name: 'Air system first' })) return;
    const target = screen.queryByRole('button', { name: 'Habitat' });
    if (target && !(target as HTMLButtonElement).disabled) {
      fireEvent.click(target);
      continue;
    }
    const arrival = screen.queryByRole('button', { name: 'Finish walk' });
    if (arrival) {
      fireEvent.click(arrival);
      continue;
    }
    const cont = screen.queryByRole('button', { name: 'Continue' });
    if (cont) {
      fireEvent.click(cont);
      continue;
    }
    const explore = screen.queryByRole('button', { name: 'Real Mars, tap to read' });
    if (explore) {
      fireEvent.click(explore);
      const close = screen.queryByRole('button', { name: 'Close' });
      if (close) fireEvent.click(close);
      continue;
    }
  }
  throw new Error('Tutorial did not reach its choice');
}
describe('Sol 1 app integration', () => {
  it('launches, reads the tutorial, applies choice and night once, and continues without refetching', async () => {
    backend();
    const first = render(<App />);
    await launch();
    readToChoice();
    fireEvent.click(screen.getByRole('button', { name: 'Air system first' }));
    expect(
      screen.getByText('Life Support: 85 · Power: 72 · Shielding: 60'),
    ).toBeInTheDocument();
    first.unmount();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue Mission' }));
    expect(screen.getByText(/Air first! Breathing/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    const explore = screen.queryByRole('button', { name: 'Real Mars, tap to read' });
    if (explore) {
      fireEvent.click(explore);
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    } else {
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    }
    expect(
      screen.getByText(
        'Sol 1 is complete and saved. Sol 2 is not connected yet.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Life Support: 80 · Power: 64 · Shielding: 60'),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('starts with the bundled archive when the NASA service is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Mission' }));
    await screen.findByRole('heading', { name: 'Pack your cargo' });
    expect(screen.getByText(/NASA input: Saved/)).toBeInTheDocument();
    expect(screen.getByText(/observed /)).toBeInTheDocument();
    expect(localStorage.getItem('mms.activeRun')).toBeNull();
  });
  it('keeps the old save while a replacement mission plans with archive fallback', async () => {
    backend();
    const first = render(<App />);
    await launch();
    first.unmount();
    const saved = localStorage.getItem('mms.activeRun');
    localStorage.removeItem('mms.sky.' + new Date().toISOString().slice(0, 10));
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Mission' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Replace saved mission and start' }),
    );
    await screen.findByRole('heading', { name: 'Pack your cargo' });
    expect(screen.getByText(/NASA input: Saved/)).toBeInTheDocument();
    expect(localStorage.getItem('mms.activeRun')).toBe(saved);
    expect(
      screen.getByRole('button', { name: 'Launch mission' }),
    ).toBeInTheDocument();
  });
});

it('prefers a valid cached sky response before the archive when offline', async () => {
  const date = new Date().toISOString().slice(0, 10);
  writeSkyCache({
    date,
    level: 'active',
    event: null,
    source: 'live',
    fetchedAt: new Date().toISOString(),
  });
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Start Mission' }));
  await screen.findByRole('heading', { name: 'Pack your cargo' });
  expect(screen.getByText(/NASA input: Cached.*active/)).toBeInTheDocument();
});
