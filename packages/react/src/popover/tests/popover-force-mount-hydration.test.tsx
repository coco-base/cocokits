// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Popover } from '../index';
import { stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function Example(): ReactElement {
  return (
    <Popover.Root>
      <Popover.Trigger>Share</Popover.Trigger>
      <Popover.Content aria-label="x" forceMount>
        <Popover.Arrow />
        text
      </Popover.Content>
    </Popover.Root>
  );
}

describe('Popover forceMount hydration', () => {
  it('hydrates without a mismatch, then mounts the hidden content', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<Example />);
    expect(container.innerHTML).not.toContain('cck-popover__content');
    render(<Example />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();

    const content = await waitFor(() => {
      const found = document.querySelector<HTMLElement>('.cck-popover__content');
      if (!found) throw new Error('not mounted');
      return found;
    });
    expect(content.hasAttribute('hidden')).toBe(true);
    expect(content.querySelector('.cck-popover__arrow')).not.toBeNull();
    expect(container.contains(content)).toBe(false);
    expect(screen.getByRole('button', { name: 'Share' }).getAttribute('aria-controls')).toBe(content.id);

    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => {
      expect(content.hasAttribute('hidden')).toBe(false);
    });
  });
});
