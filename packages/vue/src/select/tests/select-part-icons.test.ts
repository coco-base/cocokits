// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { Comment, createTextVNode, h, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { iconNamesIn, noPartIconsThemeConfig, themed } from '../../internal/tests/part-icon-fixtures';
import { SelectIcon, SelectItemIndicator, SelectItemText, SelectTrigger } from '../index';
import { ObjectItem, ObjectRoot, mountView, selectRoot, stubOverlayBrowser } from './fixtures';

beforeEach(() => {
  stubOverlayBrowser();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const dropdownIcon = (): Element | null => document.querySelector('.cck-select__dropdown-icon');
const indicators = (): Element[] => [...document.querySelectorAll('.cck-select__option-indicator')];

async function open(): Promise<void> {
  await userEvent.click(screen.getByRole('combobox'));
  await screen.findByRole('listbox');
}

const twoItems = (indicator: () => VNode): (() => VNode[]) => {
  const one = (value: string): VNode =>
    h(ObjectItem, { value }, () => [indicator(), h(SelectItemText, null, () => value)]);
  return () => [one('Cake'), one('Burger')];
};

describe('Select part icons (the theme names them)', () => {
  it('puts the theme chevron in the dropdown icon, also while closed, and keeps the part aria-hidden', () => {
    mountView(themed(() => selectRoot({ modelValue: 'Cake' })));
    expect(iconNamesIn(dropdownIcon())).toEqual(['chevron-down']);
    expect(dropdownIcon()?.getAttribute('aria-hidden')).toBe('true');
    expect(dropdownIcon()?.querySelector('.cck-svg-icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('puts the theme check in the indicator of the selected option only', async () => {
    mountView(themed(() => selectRoot({ modelValue: 'Burger' }, { items: twoItems(() => h(SelectItemIndicator)) })));
    await open();
    const [cake, burger] = indicators();
    expect(iconNamesIn(cake)).toEqual([]);
    expect(iconNamesIn(burger)).toEqual(['check']);
  });

  it('moves the check with the selection', async () => {
    mountView(themed(() => selectRoot({ modelValue: 'Cake' }, { items: twoItems(() => h(SelectItemIndicator)) })));
    await open();
    await userEvent.click(screen.getByRole('option', { name: 'Burger' }));
    await open();
    const [cake, burger] = indicators();
    expect([iconNamesIn(cake), iconNamesIn(burger)]).toEqual([[], ['check']]);
  });

  it('shows the author content of the dropdown icon instead of the theme icon', () => {
    mountView(
      themed(() =>
        h(ObjectRoot, { modelValue: 'Cake' }, () => [
          h(SelectTrigger, { 'aria-label': 'Dish' }, () => h(SelectIcon, null, () => h('b', 'v'))),
          h('div', null, [
            h(ObjectItem, { value: 'Cake' }, () => [
              h(SelectItemIndicator, null, () => h('i', 'x')),
              h(SelectItemText, null, () => 'Cake'),
            ]),
          ]),
        ]),
      ),
    );
    expect(dropdownIcon()?.innerHTML).toBe('<b>v</b>');
    expect(iconNamesIn(dropdownIcon())).toEqual([]);
  });

  const noContent: readonly [string, () => unknown][] = [
    ['no slot', () => undefined],
    ['white space text', () => [createTextVNode('  ')]],
    ['only a comment', () => [h(Comment, 'x')]],
  ];
  it.each(noContent)('treats %s as no content: the theme icon shows', (_name, slot) => {
    mountView(
      themed(() =>
        h(ObjectRoot, null, () =>
          h(SelectTrigger, { 'aria-label': 'Dish' }, () => h(SelectIcon, null, slot as () => VNode[])),
        ),
      ),
    );
    expect(iconNamesIn(dropdownIcon())).toEqual(['chevron-down']);
  });

  it('shows the author content in the indicator of every option, selected or not', async () => {
    mountView(
      themed(() =>
        selectRoot({ modelValue: 'Cake' }, { items: twoItems(() => h(SelectItemIndicator, null, () => h('i', 'x'))) }),
      ),
    );
    await open();
    expect(indicators().map((indicator) => indicator.innerHTML)).toEqual(['<i>x</i>', '<i>x</i>']);
  });
});

describe('Select part icons (no icon names)', () => {
  const configs: readonly [string, Parameters<typeof themed>[1]][] = [
    ['without a theme', undefined],
    ['with a theme that names none', noPartIconsThemeConfig],
  ];
  it.each(configs)('leaves both parts empty %s', async (name, themeConfig) => {
    const render = () => selectRoot({ modelValue: 'Cake' }, { items: twoItems(() => h(SelectItemIndicator)) });
    mountView(name === 'without a theme' ? render : themed(render, themeConfig));
    expect(dropdownIcon()?.innerHTML).toBe('');
    await open();
    expect(indicators().map((indicator) => indicator.innerHTML)).toEqual(['', '']);
  });
});
