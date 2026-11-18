import { describe, expect, it } from 'vitest';
import { declarationsInList as declarationsOf, read, ref, sizeTokenOf, structureTokenOf } from './css-test-helpers';

const css = read('dist', 'components', 'menu.css');
const ROOT = '.cck-menu__content';
const size = (mode: string, name: string): string | undefined => sizeTokenOf(ROOT, mode, `menu-${name}`);
const own = (name: string): string | undefined => structureTokenOf(ROOT, `menu-${name}`);

describe('menu design match: tokens', () => {
  it.each([
    ['sm', 'spacing-3', 'spacing-2', 'size-36', 'spacing-4', 'spacing-3', 'spacing-4', 'text-sm'],
    ['md', 'spacing-4', 'spacing-2', 'size-40', 'spacing-5', 'spacing-4', 'spacing-5', 'text-sm'],
    ['lg', 'spacing-4', 'spacing-3', 'size-44', 'spacing-5', 'spacing-4', 'spacing-5', 'text-md'],
  ])(
    'size %s: panel padding %s, gap %s, item %s high, item padding %s and %s, item gap %s, text %s',
    (mode, pad, gap, height, inline, block, itemGap, text) => {
      expect(size(mode, 'padding-block')).toBe(ref(pad));
      expect(size(mode, 'padding-inline')).toBe(ref(pad));
      expect(size(mode, 'separator-margin-block')).toBe(ref(pad));
      expect(size(mode, 'gap')).toBe(ref(gap));
      expect(size(mode, 'item-height')).toBe(ref(height));
      expect(size(mode, 'item-padding-inline')).toBe(ref(inline));
      expect(size(mode, 'item-padding-block')).toBe(ref(block));
      expect(size(mode, 'item-gap')).toBe(ref(itemGap));
      for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
        expect(size(mode, part), part).toBe(ref(`${text}-${part}`));
    },
  );

  it.each([
    ['border-color', 'border-2'],
    ['radius', 'radius-md'],
    ['item-radius', 'radius-sm'],
    ['item-margin-inline', 'spacing-0'],
    ['item-font-weight', 'font-weight-medium'],
    ['item-icon-color', 'text-3'],
    ['item-highlight-bg', 'surface-2'],
    ['item-focus-color', 'focus-2'],
    ['side-offset', 'spacing-4'],
    ['item-disabled-text-color', 'disabled-on-surface'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });
});

describe('menu design match: design values', () => {
  it('draws the design shadow, a raw value of the Menu, and a panel at least 220px wide', () => {
    expect(own('shadow')).toBe('0 4px 6px -2px rgba(15, 18, 26, 0.06), 0 12px 16px -4px rgba(15, 18, 26, 0.1)');
    expect(own('min-inline-size')).toBe('220px');
    expect(declarationsOf(css, ROOT)).toContain('min-inline-size: var(--cck-menu-min-inline-size)');
  });

  it.each([
    ['sm', 'size-16'],
    ['md', 'size-20'],
    ['lg', 'size-24'],
  ])('size %s: the item icon is %s, set by the size collection', (mode, icon) => {
    expect(size(mode, 'item-icon-size')).toBe(ref(icon));
    expect(own('item-icon-size')).toBeUndefined();
  });
});

describe('menu design match: rules', () => {
  it('pads, spaces and weights the panel and its items from the new variables', () => {
    const content = declarationsOf(css, ROOT) ?? '';
    expect(content).toContain('gap: var(--cck-menu-gap)');
    expect(content).toContain('padding-inline: var(--cck-menu-padding-inline)');
    const item = declarationsOf(css, '.cck-menu__item') ?? '';
    expect(item).toContain('padding-block: var(--cck-menu-item-padding-block)');
    expect(item).toContain('font-weight: var(--cck-menu-item-font-weight)');
  });

  it('colours an icon with the icon colour, and a disabled item icon with the disabled text colour after it', () => {
    const icon = '.cck-menu__item > .cck-svg-icon:not([data-cck-color])';
    const disabled = '.cck-menu__item[data-disabled] > .cck-svg-icon:not([data-cck-color])';
    expect(declarationsOf(css, icon)).toContain('color: var(--cck-menu-item-icon-color)');
    expect(declarationsOf(css, disabled)).toContain('color: var(--cck-menu-item-disabled-text-color)');
    expect(css.indexOf(disabled)).toBeGreaterThan(css.indexOf(icon));
  });

  it('turns a disabled item icon GrayText in forced colors', () => {
    const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
    expect(forced).toContain('.cck-menu__item[data-disabled] > .cck-svg-icon');
    expect(forced).toContain('color: GrayText');
  });
});
