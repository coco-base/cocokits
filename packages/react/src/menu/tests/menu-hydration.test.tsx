// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Example, item, menu, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function hydrate(defaultOpen: boolean): { container: HTMLElement; serverHtml: string } {
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = renderToString(<Example root={{ defaultOpen }} />);
  const serverHtml = container.innerHTML;
  render(<Example root={{ defaultOpen }} />, { container, hydrate: true });
  return { container, serverHtml };
}

describe('Menu hydration', () => {
  it('hydrates a closed menu without a mismatch or a warning, and a click opens it', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container, serverHtml } = hydrate(false);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
    await userEvent.click(trigger());
    expect(menu()?.getAttribute('data-state')).toBe('open');
    expect(trigger().getAttribute('data-state')).toBe('open');
  });

  it('hydrates an open-by-default menu without a mismatch and mounts the content after hydration', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = hydrate(true);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(menu()).not.toBeNull();
    });
    expect(container.contains(menu())).toBe(false);
    expect(trigger().getAttribute('aria-controls')).toBe(menu()?.id);
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    expect(item('Edit').getAttribute('tabindex')).toBe('0');
  });
});
