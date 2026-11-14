// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Example, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Popover accessibility (axe)', () => {
  it('has no violations while closed', async () => {
    const { container } = render(<Example />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations while open, including the focus guards', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Share link' })).toBeTruthy();
    });
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('names the content, is not modal and points the trigger at it', async () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Share' });
    await userEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Share link' });
    expect(dialog.hasAttribute('aria-modal')).toBe(false);
    expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });
});
