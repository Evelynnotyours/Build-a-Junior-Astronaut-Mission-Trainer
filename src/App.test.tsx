import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

beforeEach(() => {
  localStorage.clear();
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
}
function readToChoice() {
  for (let count = 0; count < 30; count++) {
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
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
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
    fireEvent.click(screen.getByRole('button', { name: 'Continue mission' }));
    expect(screen.getByText(/Air first! Breathing/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
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
  it('does not invent calm observations when NASA and the backend fallback are unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Mission' }));
    await screen.findByText(/NASA observations are unavailable/);
    expect(
      screen.queryByRole('heading', { name: 'Pack your cargo' }),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem('mms.activeRun')).toBeNull();
  });
  it('keeps a saved mission when an attempted replacement lookup fails', async () => {
    backend();
    const first = render(<App />);
    await launch();
    first.unmount();
    const saved = localStorage.getItem('mms.activeRun');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Mission' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Replace saved mission and start' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'NASA observations are unavailable',
      ),
    );
    expect(localStorage.getItem('mms.activeRun')).toBe(saved);
    expect(
      screen.getByRole('button', { name: 'Continue mission' }),
    ).toBeInTheDocument();
  });
});
