// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ChipListEntry } from '../index';
import { Controlled, chipTexts, chips, textbox } from './fixtures';

afterEach(cleanup);

const items: readonly ChipListEntry[] = [
  'Steak',
  { value: 'Pizza', selected: false },
  { value: 'Burger', removable: false },
  { value: 'Salad', disabled: true },
];

describe('ChipList items', () => {
  it.each([
    ['a string', 0, { removable: true, toggle: false, disabled: false }],
    ['a selectable item', 1, { removable: true, toggle: true, disabled: false }],
    ['a non-removable item', 2, { removable: false, toggle: false, disabled: false }],
    ['a disabled item', 3, { removable: false, toggle: false, disabled: true }],
  ])('renders %s with its own parts', (_name, index, expected) => {
    render(<Controlled initial={items} />);
    const chip = chips()[index];
    expect(chip.querySelector('.cck-chip__remove') !== null).toBe(expected.removable);
    expect(chip.querySelector('button.cck-chip__content-wrapper') !== null).toBe(expected.toggle);
    expect(chip.hasAttribute('data-disabled')).toBe(expected.disabled);
  });

  it('toggles a selectable item and reports the reason toggle', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled initial={items} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Pizza' }));
    expect(onChange).toHaveBeenCalledWith(
      ['Steak', { value: 'Pizza', selected: true }, { value: 'Burger', removable: false }, items[3]],
      expect.objectContaining({ reason: 'toggle' }),
    );
    expect(screen.getByRole('button', { name: 'Pizza' }).getAttribute('aria-pressed')).toBe('true');
  });
});

describe('ChipList keyboard', () => {
  it('moves focus to the last chip on Backspace in the empty text box', async () => {
    const user = userEvent.setup();
    render(<Controlled initial={['A', 'B']} />);
    textbox().focus();
    await user.keyboard('{Backspace}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove B' }));
    expect(chipTexts()).toEqual(['A', 'B']);
  });

  it('keeps Backspace as a text edit while the text box holds text', async () => {
    const user = userEvent.setup();
    render(<Controlled initial={['A']} />);
    await user.type(textbox(), 'ab{Backspace}');
    expect(textbox().value).toBe('a');
    expect(document.activeElement).toBe(textbox());
  });

  it.each([
    ['Backspace', 1, ['A', 'C'], 'Remove A'],
    ['Delete', 1, ['A', 'C'], 'Remove C'],
    ['Backspace', 0, ['B', 'C'], 'textbox'],
    ['Delete', 2, ['A', 'B'], 'textbox'],
  ])('removes the focused chip on %s at %i and moves focus to %s', async (key, index, texts, next) => {
    const user = userEvent.setup();
    render(<Controlled initial={['A', 'B', 'C']} />);
    screen.getByRole('button', { name: `Remove ${['A', 'B', 'C'][index] ?? ''}` }).focus();
    await user.keyboard(`{${key}}`);
    expect(chipTexts()).toEqual(texts);
    expect(document.activeElement).toBe(next === 'textbox' ? textbox() : screen.getByRole('button', { name: next }));
  });

  it('removes nothing on Backspace at a chip that is not removable', async () => {
    const user = userEvent.setup();
    render(<Controlled initial={[{ value: 'Pizza', selected: false, removable: false }]} />);
    screen.getByRole('button', { name: 'Pizza' }).focus();
    await user.keyboard('{Backspace}');
    expect(chipTexts()).toEqual(['Pizza']);
  });
});
