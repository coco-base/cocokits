// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Example, stubTopLayer, tooltipContent, tooltipDescription } from './fixtures';

// A tooltip is no landmark: the page-level `region` rule asks for a landmark around every text outside one,
// which a component test without a page cannot have. Every other rule runs.
const noPageLandmarks = { rules: { region: { enabled: false } } };

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Tooltip accessibility (axe)', () => {
  it('has no violations while closed', async () => {
    const { container } = render(<Example />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations while open, and describes the trigger by the hidden description', async () => {
    render(<Example />);
    await userEvent.tab();
    await userEvent.tab();
    const trigger = screen.getByRole('button', { name: 'Copy link' });
    await waitFor(() => {
      expect(tooltipContent()).not.toBeNull();
    });
    expect(trigger.getAttribute('aria-describedby')).toBe(tooltipDescription()?.id);
    expect(tooltipContent()?.hasAttribute('tabindex')).toBe(false);
    expect((await axe(document.body, noPageLandmarks)).violations).toEqual([]);
  });
});
