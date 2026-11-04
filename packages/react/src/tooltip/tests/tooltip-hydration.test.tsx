// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Example, stubTopLayer, tooltipContent, tooltipDescription } from './fixtures';

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

describe('Tooltip hydration', () => {
  it('hydrates a closed tooltip without a mismatch', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container, serverHtml } = hydrate(false);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    // After mount the trigger gains the description id; nothing else differs from the server markup.
    expect(container.innerHTML.replace(/ aria-describedby="[^"]*"/, '')).toBe(serverHtml);
    expect(tooltipContent()).toBeNull();
  });

  it('hydrates an open-by-default tooltip without a mismatch and mounts the content after hydration', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = hydrate(true);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(tooltipContent()).not.toBeNull();
    });
    expect(container.contains(tooltipContent())).toBe(false);
    // The description appears after mount; the server markup had none.
    const description = tooltipDescription();
    expect(description?.textContent).toBe('Copy the link');
    expect(screen.getByRole('button', { name: 'Copy link' }).getAttribute('aria-describedby')).toBe(description?.id);
  });
});
