// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dishes, Opt, stubTopLayer } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function Example(): ReactElement {
  return (
    <Dishes contentProps={{ forceMount: true }}>
      <Opt value="Cake">Cake</Opt>
    </Dishes>
  );
}

describe('Select forceMount hydration', () => {
  it('hydrates without a mismatch, then mounts the hidden list, which opens on a click', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<Example />);
    expect(container.innerHTML).not.toContain('role="listbox"');
    render(<Example />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();

    const list = await waitFor(() => {
      const found = document.querySelector<HTMLElement>('.cck-select__content');
      if (!found) throw new Error('not mounted');
      return found;
    });
    expect(list.hasAttribute('hidden')).toBe(true);
    expect(container.contains(list)).toBe(false);

    await userEvent.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(list.hasAttribute('hidden')).toBe(false);
    });
  });
});
