import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RepairWires } from './RepairWires';

function renderWires(onResult = vi.fn(), reduceMotion = true) {
  const utils = render(
    <RepairWires
      id="repair_wires"
      instructionKey="minigame.repair_wires.hint"
      instruction="Choose a wire end, then its matching symbol. Connect all three pairs."
      reduceMotion={reduceMotion}
      onResult={onResult}
    />,
  );
  return { onResult, ...utils };
}

function port(name: 'Alpha' | 'Beta' | 'Gamma', side: 'left' | 'right') {
  const sideWord = side === 'left' ? 'left' : 'right';
  return screen.getByRole('button', {
    name: new RegExp(`${name} wire ${sideWord}`, 'i'),
  });
}

async function connectPair(name: 'Alpha' | 'Beta' | 'Gamma') {
  fireEvent.click(port(name, 'left'));
  fireEvent.click(port(name, 'right'));
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  vi.useFakeTimers();
});

describe('RepairWires', () => {
  it('reports done once after all three pairs connect', async () => {
    const onResult = vi.fn();
    renderWires(onResult);
    await connectPair('Alpha');
    await connectPair('Beta');
    await connectPair('Gamma');
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith('done');
  });

  it('allows retry after a mismatch', () => {
    const onResult = vi.fn();
    renderWires(onResult);
    fireEvent.click(port('Alpha', 'left'));
    fireEvent.click(port('Beta', 'right'));
    expect(screen.getByRole('status')).toHaveTextContent(/do not match/i);
    expect(onResult).not.toHaveBeenCalled();
    fireEvent.click(port('Alpha', 'left'));
    fireEvent.click(port('Alpha', 'right'));
    expect(screen.getByText(/1 of 3/i)).toBeInTheDocument();
  });

  it('reports skipped once and ignores repeated Skip', () => {
    const onResult = vi.fn();
    renderWires(onResult);
    const skip = screen.getByRole('button', { name: 'Skip' });
    fireEvent.click(skip);
    fireEvent.click(skip);
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith('skipped');
    expect(skip).toBeDisabled();
  });

  it('does not double-report done on extra clicks', async () => {
    const onResult = vi.fn();
    renderWires(onResult);
    await connectPair('Alpha');
    await connectPair('Beta');
    await connectPair('Gamma');
    vi.runAllTimers();
    fireEvent.click(port('Gamma', 'left'));
    expect(onResult).toHaveBeenCalledTimes(1);
  });

  it('connects a pair via number keys after focus handlers mount', async () => {
    const onResult = vi.fn();
    renderWires(onResult);
    await act(async () => {});
    fireEvent.keyDown(document, { key: '1' });
    fireEvent.keyDown(document, { key: '4' });
    expect(
      screen.getByRole('button', { name: /Alpha wire right, connected/i }),
    ).toBeDisabled();
  });

  it('connects a pair via Enter when focus is on the board', async () => {
    renderWires();
    await act(async () => {});
    const left = port('Alpha', 'left');
    left.focus();
    fireEvent.keyDown(left, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    const right = port('Alpha', 'right');
    right.focus();
    fireEvent.keyDown(right, { key: 'Enter' });
    expect(
      screen.getByRole('button', { name: /Alpha wire right, connected/i }),
    ).toBeDisabled();
  });

  it('keeps Skip visible during play', () => {
    renderWires();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeVisible();
    fireEvent.click(port('Alpha', 'left'));
    expect(screen.getByRole('button', { name: 'Skip' })).toBeVisible();
  });

  it('locks Skip before done callback fires', async () => {
    const onResult = vi.fn();
    renderWires(onResult, false);
    await connectPair('Alpha');
    await connectPair('Beta');
    await connectPair('Gamma');
    const skip = screen.getByRole('button', { name: 'Skip' });
    expect(skip).toBeDisabled();
    expect(onResult).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith('done');
  });

  it('allows Skip midway through wiring', () => {
    const onResult = vi.fn();
    renderWires(onResult);
    fireEvent.click(port('Alpha', 'left'));
    fireEvent.click(port('Alpha', 'right'));
    const skip = screen.getByRole('button', { name: 'Skip' });
    fireEvent.click(skip);
    expect(onResult).toHaveBeenCalledWith('skipped');
  });
});