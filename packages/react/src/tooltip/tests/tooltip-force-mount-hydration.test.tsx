// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from '../index';
import { stubTopLayer, tooltipContent } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function Example(): ReactElement {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger aria-label="Copy link">Copy</Tooltip.Trigger>
      <Tooltip.Content forceMount>
        Copy the link
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

describe('Tooltip forceMount hydration', () => {
  it('hydrates without a mismatch, then mounts the hidden content', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<Example />);
    expect(container.innerHTML).not.toContain('cck-tooltip__content');
    render(<Example />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();

    const content = await waitFor(() => {
      const found = tooltipContent();
      if (!found) throw new Error('not mounted');
      return found;
    });
    expect(content.hasAttribute('hidden')).toBe(true);
    expect(content.querySelector('.cck-tooltip__arrow')).not.toBeNull();
    expect(container.contains(content)).toBe(false);
  });
});
