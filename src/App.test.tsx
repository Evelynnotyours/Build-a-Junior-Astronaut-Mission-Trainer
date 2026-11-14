import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('application scaffold', () => {
  it('clearly identifies the starter screen as not yet playable', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Mission control is getting ready' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/gameplay and screens are not implemented yet/i),
    ).toBeInTheDocument();
  });
});
