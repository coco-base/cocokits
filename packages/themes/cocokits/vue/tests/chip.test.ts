// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/vue';
import { h, nextTick, ref, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Chip as BaseChip } from '@cocokits/vue/chip';
import { ChipList as BaseChipList } from '@cocokits/vue/chip-list';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Chip, ChipList } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const { chip } = cocokitsThemeConfig.components;
const root = (): HTMLElement => screen.getByTestId('root');
const removeButton = (): Element => {
  const button = root().querySelector('.cck-chip__remove');
  if (!button) throw new Error('no remove button');
  return button;
};

type Props = Record<string, unknown>;

interface Row {
  readonly name: 'chip' | 'chip-list';
  readonly vnode: (props: Props) => VNode;
  readonly baseVnode: (props: Props) => VNode;
  readonly props: Props;
}

const rows: readonly Row[] = [
  { name: 'chip', vnode: (props) => h(Chip, props), baseVnode: (props) => h(BaseChip, props), props: {} },
  {
    name: 'chip-list',
    vnode: (props) => h(ChipList, props),
    baseVnode: (props) => h(BaseChipList, props),
    props: { ariaLabel: 'Toppings' },
  },
];

describe.each(rows)('theme $name', ({ name, vnode, baseVnode, props }) => {
  const values = cocokitsThemeConfig.components[name].size.values;
  const mount = (own: Props = {}, overrides?: Record<string, Record<string, string | null>>) =>
    render(themed(() => vnode({ 'data-testid': 'root', ...props, ...own }), overrides));

  it('renders the config default on the root', () => {
    mount();
    expect(root().getAttribute('data-size')).toBe('md');
  });

  it.each(values)('moves data-size to %s', (value) => {
    mount({ size: value });
    expect(root().getAttribute('data-size')).toBe(value);
  });

  it('removes the attribute with null', () => {
    mount({ size: null });
    expect(root().hasAttribute('data-size')).toBe(false);
  });

  it('lets a provider override win over the default and the own prop over the override', () => {
    mount({}, { [name]: { size: 'lg' } });
    expect(root().getAttribute('data-size')).toBe('lg');
    cleanup();
    mount({ size: 'sm' }, { [name]: { size: 'lg' } });
    expect(root().getAttribute('data-size')).toBe('sm');
  });

  it('updates a mounted root: value, null, then undefined restores the default', async () => {
    const value = ref<string | null | undefined>('lg');
    render(themed(() => vnode({ 'data-testid': 'root', ...props, size: value.value })));
    const element = root();
    expect(element.getAttribute('data-size')).toBe('lg');
    value.value = null;
    await nextTick();
    expect(element.hasAttribute('data-size')).toBe(false);
    value.value = undefined;
    await nextTick();
    expect(element.getAttribute('data-size')).toBe('md');
  });

  it('renders no theme data-* for a base without a theme provider', () => {
    render(baseVnode({ 'data-testid': 'root', ...props }));
    expect(root().hasAttribute('data-size')).toBe(false);
  });
});

describe('theme Chip', () => {
  it('draws the close icon the theme names in the remove button and emits remove', async () => {
    const onRemove = vi.fn();
    render(themed(() => h(Chip, { 'data-testid': 'root', removable: true, onRemove }, () => 'Pizza')));
    const icon = root().querySelector('.cck-chip__remove .cck-svg-icon');
    expect(chip.icons.remove).toBe('close');
    expect(icon?.getAttribute('data-icon')).toBe('close');
    await fireEvent.click(removeButton());
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('passes the ref element, the base props and native attributes through', () => {
    const chipRef = ref<{ element: Element | null } | null>(null);
    render(
      themed(() => h(Chip, { 'data-testid': 'root', ref: chipRef, id: 'x', disabled: true, class: 'mine' }, () => 'A')),
    );
    expect(chipRef.value?.element).toBe(root());
    expect(root().id).toBe('x');
    expect(root().hasAttribute('data-disabled')).toBe(true);
    expect(root().classList.contains('mine')).toBe(true);
    expect(root().classList.contains('cck-chip')).toBe(true);
  });
});

describe('theme ChipList', () => {
  it('gives each chip of a list its own data-size and the remove icon', () => {
    render(
      themed(() =>
        h(ChipList, { 'data-testid': 'root', ariaLabel: 'Toppings', defaultValue: ['Ham', 'Olives'], size: 'lg' }),
      ),
    );
    const chips = root().querySelectorAll(':scope > .cck-chip');
    expect(chips).toHaveLength(2);
    for (const element of chips) {
      expect(element.getAttribute('data-size')).toBe('md');
      expect(element.querySelector('.cck-svg-icon')?.getAttribute('data-icon')).toBe('close');
    }
  });

  it('keeps the model: a start value, and update:modelValue when a chip is removed', async () => {
    const onUpdate = vi.fn();
    const value = ref<string[]>(['Ham', 'Olives']);
    render(
      themed(() =>
        h(ChipList, {
          'data-testid': 'root',
          ariaLabel: 'Toppings',
          modelValue: value.value,
          'onUpdate:modelValue': (next: string[]) => {
            onUpdate(next);
            value.value = next;
          },
        }),
      ),
    );
    await fireEvent.click(removeButton());
    expect(onUpdate).toHaveBeenCalledWith(['Olives']);
    await nextTick();
    expect(root().querySelectorAll('.cck-chip')).toHaveLength(1);
  });

  it('exposes the root and the text box', () => {
    const listRef = ref<{ element: Element | null; inputElement: HTMLInputElement | null } | null>(null);
    render(themed(() => h(ChipList, { 'data-testid': 'root', ariaLabel: 'Toppings', ref: listRef })));
    expect(listRef.value?.element).toBe(root());
    expect(listRef.value?.inputElement).toBe(root().querySelector('input.cck-chip-list__input'));
  });
});
