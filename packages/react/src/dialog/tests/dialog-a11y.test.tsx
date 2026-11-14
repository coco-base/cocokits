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
  document.documentElement.removeAttribute('style');
});

describe('Dialog accessibility (axe)', () => {
  it('has no violations while closed', async () => {
    const { container } = render(<Example />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations while open', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Delete project' })).toBeTruthy();
    });
    expect((await axe(document.body)).violations).toEqual([]);
  });

  it('is a native modal dialog named by its Title, described by its Description and pointed at by the trigger', async () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Delete' });
    await userEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Delete project', description: 'This cannot be undone.' });
    expect(dialog.localName).toBe('dialog');
    expect(dialog.hasAttribute('role')).toBe(false);
    expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });
});
