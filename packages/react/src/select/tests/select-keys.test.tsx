// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { active, Dishes, Opt, reasonsOf, stubTopLayer } from './fixtures';

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select keyboard: typeahead cycling', () => {
  it('cycles through the options that share a first letter when the same character repeats', async () => {
    const user = userEvent.setup();
    render(
      <Dishes>
        <Opt value="Cake">Cake</Opt>
        <Opt value="Salad">Salad</Opt>
        <Opt value="Soup">Soup</Opt>
        <Opt value="Steak">Steak</Opt>
      </Dishes>,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}s');
    expect(active()).toBe('Salad');
    await user.keyboard('s');
    expect(active()).toBe('Soup');
    await user.keyboard('s');
    expect(active()).toBe('Steak');
    await user.keyboard('s');
    expect(active()).toBe('Salad');
  });
});

describe('Select keyboard: multiple', () => {
  const multiple = (onValueChange = vi.fn()): ReturnType<typeof vi.fn> => {
    render(
      <>
        <Dishes multiple onValueChange={onValueChange}>
          <Opt value="Cake">Cake</Opt>
          <Opt value="Pizza">Pizza</Opt>
        </Dishes>
        <button id="after">After</button>
      </>,
    );
    return onValueChange;
  };

  it('toggles the highlighted option with Enter and Space and keeps the list open', async () => {
    const user = userEvent.setup();
    const onValueChange = multiple();
    await user.tab();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{ArrowDown} ');
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(reasonsOf(onValueChange)).toEqual([
      [['Cake'], 'user'],
      [['Cake', 'Pizza'], 'user'],
    ]);
    await user.keyboard('{Enter}');
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(reasonsOf(onValueChange).at(-1)).toEqual([['Cake'], 'user']);
  });

  it('closes on Tab without a change and lets the focus move on', async () => {
    const user = userEvent.setup();
    const onValueChange = multiple();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.tab();
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(document.activeElement?.id).toBe('after');
  });
});
