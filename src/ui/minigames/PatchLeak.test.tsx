import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PatchLeak } from './PatchLeak';

function renderLeak(onResult = vi.fn(), reduceMotion = true) {
  return render(
    <PatchLeak
      id="patch_leak"
      instructionKey="minigame.patch_leak.hint"
      instruction="Tap each marked leak to place a patch. Patch all three, or choose Skip."
      reduceMotion={reduceMotion}
      onResult={onResult}
    />,
  );
}

function spot(label: 'Leak A' | 'Leak B' | 'Leak C') {
  return screen.getByRole('button', {
    name: new RegExp(`${label}, marked leak`, 'i'),
  });
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  vi.useFakeTimers();
});

describe('PatchLeak', () => {
  it('reports done once after all three leaks are patched', () => {
    const onResult = vi.fn();
    renderLeak(onResult);
    fireEvent.click(spot('Leak A'));
    fireEvent.click(spot('Leak B'));
    fireEvent.click(spot('Leak C'));
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith('done');
  });

  it('ignores repeat taps on a sealed leak without penalizing', () => {
    const onResult = vi.fn();
    renderLeak(onResult);
    const a = spot('Leak A');
    fireEvent.click(a);
    fireEvent.click(screen.getByRole('button', { name: /Leak A, patched/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/already sealed/i);
    expect(onResult).not.toHaveBeenCalled();
  });

  it('reports skipped once and disables Skip', () => {
    const onResult = vi.fn();
    renderLeak(onResult);
    const skip = screen.getByRole('button', { name: 'Skip' });
    fireEvent.click(skip);
    fireEvent.click(skip);
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith('skipped');
    expect(skip).toBeDisabled();
  });

  it('does not double-report done on extra taps', () => {
    const onResult = vi.fn();
    renderLeak(onResult);
    fireEvent.click(spot('Leak A'));
    fireEvent.click(spot('Leak B'));
    fireEvent.click(spot('Leak C'));
    fireEvent.click(screen.getByRole('button', { name: /Leak C, patched/i }));
    expect(onResult).toHaveBeenCalledTimes(1);
  });

  it('patches via number keys', async () => {
    renderLeak();
    await act(async () => {});
    fireEvent.keyDown(document, { key: '1' });
    fireEvent.keyDown(document, { key: '2' });
    fireEvent.keyDown(document, { key: '3' });
    expect(screen.getByLabelText(/Patched 3 of 3/i)).toBeInTheDocument();
  });

  it('patches via Enter when focus is on the module', async () => {
    renderLeak();
    await act(async () => {});
    const a = spot('Leak A');
    a.focus();
    fireEvent.keyDown(a, { key: 'Enter' });
    expect(screen.getByRole('button', { name: /Leak A, patched/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('keeps Skip visible during play', () => {
    renderLeak();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeVisible();
    fireEvent.click(spot('Leak A'));
    expect(screen.getByRole('button', { name: 'Skip' })).toBeVisible();
  });

  it('locks Skip before delayed done callback when motion enabled', () => {
    const onResult = vi.fn();
    renderLeak(onResult, false);
    fireEvent.click(spot('Leak A'));
    fireEvent.click(spot('Leak B'));
    fireEvent.click(spot('Leak C'));
    expect(screen.getByRole('button', { name: 'Skip' })).toBeDisabled();
    expect(onResult).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(onResult).toHaveBeenCalledWith('done');
  });
});