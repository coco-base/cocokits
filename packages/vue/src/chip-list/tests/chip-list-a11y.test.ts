// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h, nextTick, type VNode } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { mountView } from '../../internal/tests/mount-helpers';
import { box, field, list } from './fixtures';

afterEach(cleanup);

describe('ChipList accessibility', () => {
  it.each<[string, () => VNode]>([
    ['a list in a FormField', () => field({}, { defaultValue: ['Pizza', 'Cake'] })],
    ['a labelled standalone list', () => list({ defaultValue: ['Pizza'] })],
    ['an empty labelled list', () => list()],
    ['a required list in a field', () => field({ required: true }, { defaultValue: ['A'], name: 'x' })],
    ['an invalid, touched list', () => field({}, { invalid: true, touched: true, defaultValue: ['A'] })],
    ['a disabled list', () => field({ disabled: true }, { defaultValue: ['A'] })],
    ['a read-only list', () => field({ readonly: true }, { defaultValue: ['A'] })],
    [
      'a list named by an element',
      () => h('div', [h('p', { id: 'cap' }, 'Toppings'), list({ 'aria-label': undefined, 'aria-labelledby': 'cap' })]),
    ],
  ])('has no axe violations: %s', async (_name, ui) => {
    const { container } = mountView(ui);
    await nextTick();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is named by the Label and described by the hint, and each button by its chip text', async () => {
    mountView(() => field({}, { defaultValue: ['Pizza'] }));
    await nextTick();
    expect(screen.getByRole('textbox', { name: 'Toppings' })).toBe(box());
    expect(screen.getByRole('textbox', { description: 'Press Enter to add.' })).toBe(box());
    expect(screen.getByRole('button', { name: 'Pizza' }).tagName).toBe('BUTTON');
  });

  it('has no composite role and keeps its root free of a role', () => {
    mountView(() => list({ defaultValue: ['Pizza'] }));
    expect(document.querySelector('.cck-chip-list')?.hasAttribute('role')).toBe(false);
    expect(document.querySelector('.cck-chip')?.hasAttribute('role')).toBe(false);
  });
});
