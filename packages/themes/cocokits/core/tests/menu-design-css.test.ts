import { describe, expect, it } from 'vitest';
import { declarationsInList as declarationsOf, read, ref, sizeTokenOf, structureTokenOf } from './css-test-helpers';

const css = read('dist', 'components', 'menu.css');
const ROOT = '.cck-menu__content';
const size = (mode: string, name: string): string | undefined => sizeTokenOf(ROOT, mode, `menu-${name}`);
const own = (name: string): string | undefined => structureTokenOf(ROOT, `menu-${name}`);
const forced = css.slice(css.indexOf('@media (forced-colors: active)'));

/** The `control-*` value per density mode (`normal`, `compact`, `comfortable`). */
const density = (name: string): (string | undefined)[] =>
  ['normal', 'compact', 'comfortable'].map((mode) => structureTokenOf(`[data-cck-spacing=${mode}]`, name));

/** The tokens of a token file whose value in some mode is not an alias, as `<collection>#<token>`. */
const rawTokens = (file: string): string[] => {
  const json = JSON.parse(read('src', 'tokens', `${file}.tokens.json`)) as {
    collections: { name: string; tokens: { name: string; valuesByMode: Record<string, unknown> }[] }[];
  };
  return json.collections.flatMap((collection) =>
    collection.tokens
      .filter((token) => Object.values(token.valuesByMode).some((value) => !/^\{[^{}#]+#[^{}]+\}$/.test(String(value))))
      .map((token) => `${collection.name}#${token.name}`),
  );
};

describe('menu design match: tokens', () => {
  it.each([
    ['sm', 'control-xs', 'spacing-4', 'spacing-0'],
    ['md', 'control-sm', 'spacing-4', 'spacing-3'],
    ['lg', 'control-md', 'spacing-5', 'spacing-3'],
  ])('size %s: item %s high, item padding %s and %s, text text-sm', (mode, height, inline, block) => {
    expect(size(mode, 'item-height')).toBe(ref(height));
    expect(size(mode, 'item-padding-inline')).toBe(ref(inline));
    expect(size(mode, 'item-padding-block')).toBe(ref(block));
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(size(mode, part), part).toBe(ref(`text-sm-${part}`));
    for (const gone of ['padding-block', 'padding-inline', 'gap', 'item-gap', 'separator-margin-block'])
      expect(size(mode, gone), gone).toBeUndefined();
  });

  it('follows the density mode: control-xs, -sm and -md per Normal, Compact and Comfortable', () => {
    expect(density('control-xs')).toEqual([ref('size-24'), ref('size-24'), ref('size-28')]);
    expect(density('control-sm')).toEqual([ref('size-32'), ref('size-28'), ref('size-36')]);
    expect(density('control-md')).toEqual([ref('size-36'), ref('size-32'), ref('size-40')]);
  });

  it.each([
    ['border-color', 'border-1'],
    ['radius', 'radius-lg'],
    ['shadow', 'shadow-lg'],
    ['padding', 'spacing-3'],
    ['side-offset', 'spacing-3'],
    ['motion-distance', 'spacing-1'],
    ['item-gap', 'spacing-4'],
    ['item-radius', 'radius-sm'],
    ['item-font-weight', 'font-weight-regular'],
    ['item-icon-color', 'text-3'],
    ['item-highlight-bg', 'surface-2'],
    ['item-danger-highlight-bg', 'danger-container'],
    ['item-disabled-opacity', 'opacity-50'],
    ['item-chevron-size', 'size-6'],
    ['item-chevron-border-width', 'border-width-1'],
    ['group-label-font-weight', 'font-weight-medium'],
    ['group-label-padding-block', 'spacing-3'],
    ['separator-color', 'border-1'],
    ['separator-margin-block', 'spacing-3'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it.each([['item-margin-inline'], ['item-disabled-text-color'], ['item-focus-color'], ['item-selected-bg']])(
    'has no token %s',
    (name) => {
      expect(own(name)).toBeUndefined();
      expect(css).not.toContain(`--cck-menu-${name}`);
    },
  );
});

describe('menu design match: design values', () => {
  it('keeps every Component value an alias, with the 220px panel width and the motion the only exceptions', () => {
    expect(rawTokens('menu')).toEqual([
      'Menu__content / Structure#min-inline-size',
      'Menu__content / Structure#motion-duration',
    ]);
    expect(own('min-inline-size')).toBe('220px');
    expect(own('motion-duration')).toBe('150ms');
    expect(declarationsOf(css, ROOT)).toContain('min-inline-size: var(--cck-menu-min-inline-size)');
  });

  it.each([
    ['sm', 'size-14'],
    ['md', 'size-16'],
    ['lg', 'size-16'],
  ])('size %s: the item icon is %s, set by the size collection', (mode, icon) => {
    expect(size(mode, 'item-icon-size')).toBe(ref(icon));
    expect(own('item-icon-size')).toBeUndefined();
  });
});

describe('menu design match: rules', () => {
  it('pads the panel and spaces and weights its items from the variables', () => {
    const content = declarationsOf(css, ROOT) ?? '';
    expect(content).toContain('padding: var(--cck-menu-padding)');
    expect(content).not.toMatch(/(^|[\s;])gap:/);
    const item = declarationsOf(css, '.cck-menu__item') ?? '';
    expect(item).toContain('gap: 0 var(--cck-menu-item-gap)');
    expect(item).toContain('min-block-size: var(--cck-menu-item-height)');
    expect(item).toContain('padding-block: var(--cck-menu-item-padding-block)');
    expect(item).toContain('padding-inline: var(--cck-menu-item-padding-inline)');
    expect(item).toContain('font-weight: var(--cck-menu-item-font-weight)');
  });

  it('colours an icon with the icon colour, and fades a disabled item with its icon as a whole', () => {
    const icon = '.cck-menu__item > .cck-svg-icon:not([data-cck-color])';
    expect(declarationsOf(css, icon)).toContain('color: var(--cck-menu-item-icon-color)');
    const disabled = declarationsOf(css, '.cck-menu__item[data-disabled]') ?? '';
    expect(disabled).toContain('opacity: var(--cck-menu-item-disabled-opacity)');
    expect(disabled).toContain('cursor: not-allowed');
    expect(css.slice(0, css.indexOf('@media (forced-colors: active)'))).not.toContain(
      '.cck-menu__item[data-disabled] > .cck-svg-icon',
    );
  });

  it('turns a disabled item icon GrayText at full opacity in forced colors', () => {
    const rule = declarationsOf(forced, '.cck-menu__item[data-disabled] > .cck-svg-icon') ?? '';
    expect(rule).toContain('color: GrayText');
    expect(rule).toContain('opacity: 1');
  });
});
