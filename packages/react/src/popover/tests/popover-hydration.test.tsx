// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Example, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function hydrate(defaultOpen: boolean): { container: HTMLElement; serverHtml: string } {
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = renderToString(<Example defaultOpen={defaultOpen} />);
  const serverHtml = container.innerHTML;
  render(<Example defaultOpen={defaultOpen} />, { container, hydrate: true });
  return { container, serverHtml };
}

describe('Popover hydration', () => {
  it('hydrates a closed popover without a mismatch, and a click opens it', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container, serverHtml } = hydrate(false);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);

    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    expect(screen.getByRole('dialog', { name: 'Share link' }).getAttribute('data-state')).toBe('open');
    expect(screen.getByRole('button', { name: 'Share' }).getAttribute('data-state')).toBe('open');
  });

  it('hydrates an open-by-default popover without a mismatch and mounts the content after hydration', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = hydrate(true);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Share link' })).toBeTruthy();
    });
    const dialog = screen.getByRole('dialog', { name: 'Share link' });
    expect(container.contains(dialog)).toBe(false);
    expect(screen.getByRole('button', { name: 'Share' }).getAttribute('aria-controls')).toBe(dialog.id);
  });
});
