// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { createSSRApp, h, nextTick, ref, type Ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountView, pick } from '../../internal/tests/mount-helpers';
import { ChipList, type ChipListEntry } from '../index';
import { box, chipTexts, list, removeButtons } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** A bound list that records every update. */
function boundList(initial: ChipListEntry[], extra: Record<string, unknown> = {}): { value: Ref<ChipListEntry[]> } {
  const value = ref<ChipListEntry[]>(initial);
  mountView(() =>
    list({
      modelValue: value.value,
      'onUpdate:modelValue': (next: ChipListEntry[]) => {
        value.value = next;
      },
      ...extra,
    }),
  );
  return { value };
}

const chips = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('.cck-chip')];
const toggles = (): HTMLButtonElement[] => [
  ...document.querySelectorAll<HTMLButtonElement>('button.cck-chip__content-wrapper'),
];

describe('Chip list items (chip-list-01, -04)', () => {
  it('renders a chip for each string and each item object with its facts', () => {
    boundList([
      'Pizza',
      { value: 'Cake' },
      { value: 'Soup', removable: false },
      { value: 'Salad', disabled: true },
      { value: 'Steak', selected: true },
    ]);
    expect(chipTexts()).toEqual(['Pizza', 'Cake', 'Soup', 'Salad', 'Steak']);
    // Removable: the strings and the items that do not say otherwise, and only while enabled.
    expect(chips().map((chip) => chip.querySelector('.cck-chip__remove') !== null)).toEqual([
      true,
      true,
      false,
      false,
      true,
    ]);
    expect(chips()[3]?.hasAttribute('data-disabled')).toBe(true);
    // Only an item with selected set is selectable.
    expect(toggles()).toHaveLength(1);
    expect(toggles()[0]?.getAttribute('aria-pressed')).toBe('true');
  });

  it('adds typed text as a string and keeps the objects as they are', async () => {
    const { value } = boundList([{ value: 'Cake', selected: false }]);
    await userEvent.type(box(), 'Pizza{Enter}');
    expect(value.value).toEqual([{ value: 'Cake', selected: false }, 'Pizza']);
  });

  it('does not add a text that is the value of an item object', async () => {
    const { value } = boundList([{ value: 'Cake' }]);
    await userEvent.type(box(), 'Cake{Enter}');
    expect(value.value).toEqual([{ value: 'Cake' }]);
  });

  it('removes only the item whose remove button was pressed, an object included', async () => {
    const { value } = boundList(['Pizza', { value: 'Cake' }, 'Pizza']);
    await userEvent.click(removeButtons()[1]);
    expect(value.value).toEqual(['Pizza', 'Pizza']);
  });

  it('toggles an item with selected set, in a new list, and emits the change', async () => {
    const onUpdate = vi.fn();
    const { value } = boundList(['Pizza', { value: 'Cake', selected: false }], {
      'onUpdate:modelValue': (next: ChipListEntry[]) => {
        onUpdate(next);
      },
    });
    await userEvent.click(toggles()[0]);
    expect(onUpdate).toHaveBeenLastCalledWith(['Pizza', { value: 'Cake', selected: true }]);
    // The test parent did not store it: the list shows what the parent holds.
    expect(value.value).toEqual(['Pizza', { value: 'Cake', selected: false }]);
  });

  it('keeps a toggled item when the parent accepts, and follows the new selected', async () => {
    const { value } = boundList([{ value: 'Cake', selected: false }]);
    await userEvent.click(toggles()[0]);
    expect(value.value).toEqual([{ value: 'Cake', selected: true }]);
    expect(toggles()[0]?.getAttribute('aria-pressed')).toBe('true');
    await userEvent.click(toggles()[0]);
    expect(value.value).toEqual([{ value: 'Cake', selected: false }]);
  });

  it('disables a toggle of a disabled item and of a disabled list', async () => {
    const { value } = boundList([{ value: 'Cake', selected: false, disabled: true }]);
    expect(toggles()[0]?.disabled).toBe(true);
    await userEvent.click(toggles()[0]);
    expect(value.value).toEqual([{ value: 'Cake', selected: false, disabled: true }]);
    cleanup();
    mountView(() => list({ defaultValue: [{ value: 'Cake', selected: false }], disabled: true }));
    expect(toggles()[0]?.disabled).toBe(true);
    expect(removeButtons()).toHaveLength(0);
  });

  it('submits the text of each item, selected or not', () => {
    mountView(() =>
      h('form', null, [list({ defaultValue: ['Pizza', { value: 'Cake', selected: true }], name: 'toppings' })]),
    );
    const data = new FormData(pick(document.body, 'form') as HTMLFormElement);
    expect(data.getAll('toppings')).toEqual(['Pizza', 'Cake']);
  });
});

describe('Chip list keyboard (chip-list-04)', () => {
  it('moves the focus to the last chip with Backspace in an empty text box, and does nothing with text in it', async () => {
    boundList(['Pizza', 'Cake']);
    box().focus();
    await userEvent.keyboard('{Backspace}');
    expect(document.activeElement).toBe(removeButtons()[1]);
    box().focus();
    await userEvent.type(box(), 'a{Backspace}');
    expect(document.activeElement).toBe(box());
  });

  it('focuses the toggle of a selectable last chip, and skips a chip with no focus stop', async () => {
    boundList(['Pizza', { value: 'Cake', selected: false }]);
    box().focus();
    await userEvent.keyboard('{Backspace}');
    expect(document.activeElement).toBe(toggles()[0]);
    cleanup();
    boundList(['Pizza', { value: 'Cake', removable: false }]);
    box().focus();
    await userEvent.keyboard('{Backspace}');
    expect(document.activeElement).toBe(removeButtons()[0]);
  });

  it.each([
    { key: '{Backspace}', name: 'Backspace', removed: 'Cake', focus: 'Pizza' },
    { key: '{Delete}', name: 'Delete', removed: 'Cake', focus: 'Steak' },
  ])('$name removes the focused chip and moves the focus to the neighbour', async ({ key, removed, focus }) => {
    const { value } = boundList(['Pizza', 'Cake', 'Steak']);
    removeButtons()[1]?.focus();
    await userEvent.keyboard(key);
    await nextTick();
    expect(value.value).not.toContain(removed);
    expect(chipTexts()).toEqual(['Pizza', 'Steak']);
    expect(document.activeElement?.closest('.cck-chip')?.textContent).toContain(focus);
  });

  it('moves the focus to the text box when no chip is left in that direction', async () => {
    boundList(['Pizza']);
    removeButtons()[0]?.focus();
    await userEvent.keyboard('{Backspace}');
    await nextTick();
    expect(chipTexts()).toEqual([]);
    expect(document.activeElement).toBe(box());
  });

  it('removes nothing with Delete on a chip that is not removable or disabled', async () => {
    const { value } = boundList([{ value: 'Cake', selected: false, removable: false }]);
    toggles()[0]?.focus();
    await userEvent.keyboard('{Delete}');
    expect(value.value).toHaveLength(1);
  });

  it('leaves Backspace in the text box to the text box', async () => {
    const { value } = boundList(['Pizza']);
    box().focus();
    await userEvent.type(box(), 'ab{Backspace}');
    expect(box().value).toBe('a');
    expect(value.value).toEqual(['Pizza']);
  });
});

describe('Chip list items on the server', () => {
  it('renders the toggle of a selectable item and the check', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ChipList, { 'aria-label': 'T', defaultValue: ['Pizza', { value: 'Cake', selected: true }] }),
      }),
    );
    expect(html.match(/<button\b[^>]*cck-chip__content-wrapper/g)).toHaveLength(1);
    expect(html).toContain('aria-pressed="true"');
    expect(html.match(/cck-chip__remove/g)).toHaveLength(2);
  });
});
