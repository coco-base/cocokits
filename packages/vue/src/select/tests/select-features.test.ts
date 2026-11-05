// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectAnatomy } from '@cocokits/machines/select';
import { provideDirection } from '@cocokits/vue-core';
import { DialogClose, DialogContent, DialogRoot, DialogTrigger } from '../../dialog';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../../popover';
import { SelectGroup, SelectLabel, SelectSeparator } from '../index';
import {
  active,
  gone,
  item,
  mountView,
  ObjectItem,
  option,
  record,
  selectRoot,
  selectView,
  settle,
  stubOverlayBrowser,
  trigger,
  valueText,
} from './fixtures';

const { classes } = selectAnatomy;

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('Select groups and separators', () => {
  it('groups items under a label, named by the label, with a separator between groups', async () => {
    const user = userEvent.setup();
    mountView(() =>
      selectRoot(
        {},
        {
          items: () => [
            h(SelectGroup, null, () => [h(SelectLabel, null, () => 'Desserts'), item('Cake')]),
            h(SelectSeparator, { 'data-testid': 'line' }),
            h(SelectGroup, null, () => [
              h(SelectLabel, null, () => [h('b', { 'data-testid': 'mark' }, 'Mains'), ' (hot)']),
              item('Pizza'),
            ]),
          ],
        },
      ),
    );
    await user.click(trigger());
    const groups = await screen.findAllByRole('group');
    expect(groups.map((group) => group.classList.contains(classes.optionGroup))).toEqual([true, true]);
    expect(screen.getByRole('group', { name: 'Desserts' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Mains (hot)' })).toBeTruthy();
    expect(screen.getByTestId('mark').closest(`.${classes.optionGroupLabel}`)).not.toBeNull();
    expect(screen.getByRole('group', { name: 'Desserts' }).contains(option('Cake'))).toBe(true);
    const line = screen.getByTestId('line');
    expect(line.localName).toBe('div');
    expect(line.classList.contains(classes.separator)).toBe(true);
    expect(line.getAttribute('aria-hidden')).toBe('true');
  });

  it('skips a separator with the keys', async () => {
    const user = userEvent.setup();
    mountView(() => selectRoot({}, { items: () => [item('Cake'), h(SelectSeparator), item('Pizza')] }));
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await waitFor(() => {
      expect(active()).toBe('Cake');
    });
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('Pizza');
  });

  it('disables the items of a disabled group', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(() =>
      selectRoot(recorded.props, {
        items: () => [
          h(SelectGroup, { disabled: true }, () => [h(SelectLabel, null, () => 'Sold out'), item('Cake')]),
          item('Pizza'),
        ],
      }),
    );
    await user.click(trigger());
    const group = await screen.findByRole('group', { name: 'Sold out' });
    expect(group.getAttribute('aria-disabled')).toBe('true');
    expect(group.hasAttribute('data-disabled')).toBe(true);
    expect(option('Cake').getAttribute('aria-disabled')).toBe('true');
    await waitFor(() => {
      expect(active()).toBe('Pizza');
    });
    await user.click(option('Cake'));
    expect(recorded.values).toEqual([]);
  });
});

describe('Select clearing item', () => {
  it('sets the empty string on a value of "" and shows the placeholder again', async () => {
    const user = userEvent.setup();
    const values: unknown[] = [];
    const model = ref<string | null>('Cake');
    mountView(() =>
      selectRoot(
        {
          modelValue: model.value,
          'onUpdate:modelValue': (value: string | null) => {
            model.value = value;
            values.push(value);
          },
        },
        { items: () => [item('', 'None'), item('Cake')], value: { placeholder: 'Choose' } },
      ),
    );
    expect(valueText()).toBe('Cake');
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'None' }));
    await gone();
    expect(values).toEqual(['']);
    expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
    expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-placeholder-shown')).toBe(true);
  });

  it('clears with a null item, emits null and carries nullableValue in the hidden input', async () => {
    const user = userEvent.setup();
    const values: unknown[] = [];
    const model = ref<string | null>('Cake');
    const { container } = mountView(() =>
      selectRoot(
        {
          name: 'dish',
          nullableValue: 'none',
          modelValue: model.value,
          'onUpdate:modelValue': (value: string | null) => {
            model.value = value;
            values.push(value);
          },
        },
        { items: () => [item(null, 'None'), item('Cake')], value: { placeholder: 'Choose' } },
      ),
    );
    const input = (): HTMLInputElement | null => container.querySelector('input[name="dish"]');
    expect(input()?.value).toBe('Cake');
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'None' }));
    await gone();
    expect(values).toEqual([null]);
    expect(trigger().closest(`.${classes.root}`)?.hasAttribute('data-placeholder-shown')).toBe(true);
    expect(input()?.value).toBe('none');
  });
});

describe('Select object values (generic T)', () => {
  interface Dish {
    readonly id: number;
    readonly name: string;
  }
  const first: Dish = { id: 1, name: 'Cake' };
  const second: Dish = { id: 2, name: 'Pizza' };
  const label = (dish: Dish): string => dish.name;
  const sameId = (a: Dish, b: Dish): boolean => a.id === b.id;

  function objectView(onSeen?: (value: unknown) => void): () => ReturnType<typeof h> {
    const dish = ref<unknown>({ id: 2, name: 'Pizza (copy)' });
    return () =>
      selectRoot(
        {
          name: 'dish',
          modelValue: dish.value,
          itemToStringLabel: label,
          itemToStringValue: label,
          by: sameId,
          'onUpdate:modelValue': (next: unknown) => {
            onSeen?.(next);
            dish.value = next;
          },
        },
        { items: () => [first, second].map((entry) => item(entry, entry.name, { key: entry.id })) },
      );
  }

  it('selects by `by`, shows itemToStringLabel and submits itemToStringValue', async () => {
    const user = userEvent.setup();
    const seen = vi.fn();
    const { container } = mountView(objectView(seen));
    expect(valueText()).toBe('Pizza (copy)');
    expect(container.querySelector<HTMLInputElement>('input[name="dish"]')?.value).toBe('Pizza (copy)');
    await user.click(trigger());
    expect((await screen.findByRole('option', { name: 'Pizza' })).getAttribute('aria-selected')).toBe('true');
    await user.click(option('Cake'));
    await gone();
    expect(seen).toHaveBeenCalledWith({ id: 1, name: 'Cake' });
    expect(container.querySelector<HTMLInputElement>('input[name="dish"]')?.value).toBe('Cake');
  });

  it('compares by the name of a field', async () => {
    const user = userEvent.setup();
    mountView(() =>
      selectRoot(
        { modelValue: { id: 2, name: 'x' }, by: 'id', itemToStringLabel: label },
        { items: () => [first, second].map((entry) => item(entry, entry.name, { key: entry.id })) },
      ),
    );
    await user.click(trigger());
    expect((await screen.findByRole('option', { name: 'Pizza' })).getAttribute('aria-selected')).toBe('true');
  });

  it('settles with inline object values that are new on every render', async () => {
    const user = userEvent.setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const dish = ref<unknown>({ id: 2, name: 'Pizza' });
    mountView(() =>
      selectRoot(
        {
          modelValue: dish.value,
          itemToStringLabel: label,
          by: sameId,
          'onUpdate:modelValue': (next: unknown) => {
            dish.value = next;
          },
        },
        {
          items: () =>
            [1, 2, 3].map((id) => item({ id, name: `Dish ${String(id)}` }, `Dish ${String(id)}`, { key: id })),
        },
      ),
    );
    await user.click(trigger());
    await settle();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect((await screen.findByRole('option', { name: 'Dish 2' })).getAttribute('aria-selected')).toBe('true');
    await user.click(option('Dish 3'));
    await gone();
    expect(dish.value).toEqual({ id: 3, name: 'Dish 3' });
  });

  it('returns the latest payload of an item the comparator calls the same', async () => {
    const user = userEvent.setup();
    const name = ref('Old');
    const seen = vi.fn();
    mountView(() =>
      selectRoot(
        { itemToStringLabel: label, by: sameId, 'onUpdate:modelValue': seen },
        { items: () => [item({ id: 1, name: name.value }, name.value, { key: 1 })] },
      ),
    );
    name.value = 'New';
    await nextTick();
    await user.click(trigger());
    await screen.findByRole('option', { name: 'New' });
    await user.keyboard('{ArrowDown}{Enter}');
    expect(seen).toHaveBeenCalledWith({ id: 1, name: 'New' });
  });

  it('updates for a replaced object value with no comparator', async () => {
    const user = userEvent.setup();
    const replaced: Dish = { id: 1, name: 'Cake (new)' };
    const dish = ref<unknown>(first);
    const entry = ref<Dish>(first);
    mountView(() =>
      selectRoot(
        { modelValue: dish.value, itemToStringLabel: label },
        { items: () => [item(entry.value, entry.value.name, { key: 1 })] },
      ),
    );
    entry.value = replaced;
    dish.value = replaced;
    await nextTick();
    await user.click(trigger());
    const chosen = await screen.findByRole('option', { name: 'Cake (new)' });
    expect(chosen.getAttribute('aria-selected')).toBe('true');
    expect(valueText()).toBe('Cake (new)');
  });

  it('settles with inline object values and the default comparison', async () => {
    const user = userEvent.setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() =>
      selectRoot(
        { itemToStringLabel: label },
        {
          items: () => [1, 2].map((id) => item({ id, name: `Dish ${String(id)}` }, `Dish ${String(id)}`, { key: id })),
        },
      ),
    );
    await user.click(trigger());
    await settle();
    expect(warn).not.toHaveBeenCalled();
  });

  it('uses itemToStringLabel for the type-to-search text of an item with no text', async () => {
    const user = userEvent.setup();
    mountView(() =>
      selectRoot(
        { itemToStringLabel: label },
        {
          items: () =>
            [first, second].map((entry) => h(ObjectItem, { value: entry }, () => h('svg', { 'aria-hidden': 'true' }))),
        },
      ),
    );
    await user.tab();
    await user.keyboard('p');
    await screen.findByRole('listbox');
    await waitFor(() => {
      expect(trigger().getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[1]?.id);
    });
  });
});

describe('Select labels from data', () => {
  it('shows the label of `items` for the selected value on the first render', () => {
    mountView(() =>
      selectRoot(
        {
          modelValue: 'cake',
          items: [
            { value: 'cake', label: 'Cake' },
            { value: 'pizza', label: 'Pizza' },
          ],
        },
        { items: () => [item('cake', 'Cake'), item('pizza', 'Pizza')] },
      ),
    );
    expect(valueText()).toBe('Cake');
  });

  it('takes the labels from a record, joins them for a multiple Select, and falls back to the value', () => {
    mountView(() =>
      selectRoot(
        { multiple: true, modelValue: ['cake', 'pizza', 'other'], items: { cake: 'Cake', pizza: 'Pizza' } },
        { items: () => [item('cake', 'Cake')] },
      ),
    );
    expect(valueText()).toBe('Cake, Pizza, other');
  });

  it('uses itemToStringLabel when `items` has no entry', () => {
    mountView(() =>
      selectRoot(
        { modelValue: 'cake', itemToStringLabel: (value: string) => value.toUpperCase() },
        { items: () => [item('cake', 'Cake')] },
      ),
    );
    expect(valueText()).toBe('CAKE');
  });

  it('registers no text with the root: a closed Select shows the value without items', () => {
    mountView(() => selectRoot({ modelValue: 'cake' }, { items: () => [item('cake', 'Cake')] }));
    expect(valueText()).toBe('cake');
  });
});

describe('Select custom value', () => {
  it('renders the default slot of the value with the labels and the model while something is selected', async () => {
    const user = userEvent.setup();
    const seen: unknown[] = [];
    mountView(() =>
      selectRoot(
        { multiple: true, modelValue: ['Cake', 'Pizza'] },
        {
          items: () => ['Cake', 'Pizza', 'Steak'].map((dish) => item(dish)),
          valueSlot: ({ selectedLabel, modelValue }) => {
            seen.push(modelValue);
            return `${String(selectedLabel.length)} selected`;
          },
        },
      ),
    );
    expect(valueText()).toBe('2 selected');
    expect(seen[0]).toEqual(['Cake', 'Pizza']);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Steak' }));
    await waitFor(() => {
      expect(valueText()).toBe('3 selected');
    });
  });

  it('shows the placeholder, not the slot, while nothing is selected', () => {
    const valueSlot = vi.fn(() => 'x');
    mountView(selectView({}, { valueSlot, value: { placeholder: 'Choose' } }));
    expect(trigger().querySelector(`.${classes.placeholder}`)?.textContent).toBe('Choose');
    expect(valueSlot).not.toHaveBeenCalled();
  });
});

describe('Select dynamic items', () => {
  it('lists added, removed and reordered items in document order', async () => {
    const user = userEvent.setup();
    const dishes = ref(['Cake', 'Pizza', 'Steak']);
    mountView(() => selectRoot({}, { items: () => dishes.value.map((dish) => item(dish, dish, { key: dish })) }));
    await user.click(trigger());
    const names = (): string[] => screen.getAllByRole('option').map((node) => node.textContent.trim());
    expect(names()).toEqual(['Cake', 'Pizza', 'Steak']);
    dishes.value = ['Steak', 'Cake', 'Burger', 'Pizza'];
    await settle();
    await user.keyboard('{Home}');
    expect(names()).toEqual(['Steak', 'Cake', 'Burger', 'Pizza']);
    expect(active()).toBe('Steak');
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('Cake');
    await user.keyboard('{End}');
    expect(active()).toBe('Pizza');
  });
});

describe('Select right to left', () => {
  it('flips start and end placement, and leaves the vertical keys alone', async () => {
    const user = userEvent.setup();
    mountView(() => {
      provideDirection('rtl');
      return selectRoot({}, { items: () => [item('Cake'), item('Pizza')], content: { side: 'start' } });
    });
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    await waitFor(() => {
      expect(list.getAttribute('data-side')).toBe('start');
    });
    await user.keyboard('{ArrowDown}');
    expect(active()).toBe('Pizza');
    await user.keyboard('{ArrowUp}');
    expect(active()).toBe('Cake');
  });
});

describe('Select nested overlays', () => {
  it('inside a Popover: Escape closes the listbox only, and a choice keeps the Popover open', async () => {
    const user = userEvent.setup();
    mountView(() =>
      h(PopoverRoot, null, () => [
        h(PopoverTrigger, null, () => 'Settings'),
        h(PopoverContent, { 'aria-label': 'Settings panel' }, () =>
          selectRoot({}, { items: () => [item('Cake'), item('Pizza')] }),
        ),
      ]),
    );
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await screen.findByRole('dialog', { name: 'Settings panel' });
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    await gone();
    expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await gone();
    expect(screen.getByRole('dialog', { name: 'Settings panel' })).toBeTruthy();
  });

  it('inside a modal Dialog: the list renders inside the dialog, Escape closes it only, a choice keeps the dialog open', async () => {
    const user = userEvent.setup();
    const recorded = record();
    mountView(() =>
      h(DialogRoot, null, () => [
        h(DialogTrigger, null, () => 'Order'),
        h(DialogContent, { 'aria-label': 'Order' }, () => [
          selectRoot(recorded.props, { items: () => [item('Cake'), item('Pizza')] }),
          h(DialogClose, null, () => 'Cancel'),
        ]),
      ]),
    );
    await user.click(screen.getByRole('button', { name: 'Order' }));
    const dialog = await waitFor(() => {
      const found = document.querySelector('dialog[open]');
      if (!found) throw new Error('The dialog is not open yet.');
      return found;
    });
    await user.click(trigger());
    const list = await screen.findByRole('listbox');
    expect(dialog.contains(list)).toBe(true);
    await user.keyboard('{Escape}');
    await gone();
    expect(document.querySelector('dialog[open]')).toBe(dialog);
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Pizza' }));
    await gone();
    expect(recorded.values[0]).toBe('Pizza');
    expect(document.querySelector('dialog[open]')).toBe(dialog);
  });
});
