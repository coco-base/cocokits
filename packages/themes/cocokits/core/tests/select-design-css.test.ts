import { describe, expect, it } from 'vitest';
import { declarationsInList, declarationsOf, read, ref, sizeTokenOf, structureTokenOf } from './css-test-helpers';

const css = read('dist', 'components', 'select.css');
const ROOT = '.cck-select';
const CONTENT = '.cck-select__content';
const size = (mode: string, name: string): string | undefined => sizeTokenOf(ROOT, mode, `select-${name}`);
const own = (name: string): string | undefined =>
  structureTokenOf(
    /^(content|option|indicator|group-label|header|search|footer|empty)-/.test(name) ? CONTENT : ROOT,
    `select-${name}`,
  );
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

describe('select design match: tokens', () => {
  it.each([
    ['sm', 'control-sm', 'spacing-4', 'size-16'],
    ['md', 'control-md', 'spacing-5', 'size-16'],
    ['lg', 'control-lg', 'spacing-5', 'size-20'],
  ])('size %s: height %s, padding %s, chevron %s, text-sm text', (mode, height, inline, icon) => {
    expect(size(mode, 'height')).toBe(ref(height));
    expect(size(mode, 'padding-inline')).toBe(ref(inline));
    expect(size(mode, 'icon-size')).toBe(ref(icon));
    expect(size(mode, 'gap')).toBeUndefined();
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(size(mode, part), part).toBe(ref(`text-sm-${part}`));
  });

  it('follows the density mode: control-sm, -md and -lg per Normal, Compact and Comfortable', () => {
    expect(density('control-sm')).toEqual([ref('size-32'), ref('size-28'), ref('size-36')]);
    expect(density('control-md')).toEqual([ref('size-36'), ref('size-32'), ref('size-40')]);
    expect(density('control-lg')).toEqual([ref('size-40'), ref('size-36'), ref('size-44')]);
  });

  it.each([
    ['gap', 'spacing-4'],
    ['hover-border-color', 'border-3'],
    ['border-color', 'border-2'],
    ['shadow', 'shadow-xs'],
    ['focus-color', 'focus-2'],
    ['focus-ring-width', 'size-3'],
    ['focus-ring-mix', 'opacity-20'],
    ['disabled-opacity', 'opacity-50'],
    ['value-font-weight', 'font-weight-regular'],
    ['placeholder-color', 'text-3'],
    ['icon-color', 'text-3'],
    ['content-border-color', 'border-1'],
    ['content-padding', 'spacing-3'],
    ['content-shadow', 'shadow-lg'],
    ['content-focus-width', 'border-width-2'],
    ['option-min-height', 'control-sm'],
    ['option-padding-block', 'spacing-3'],
    ['option-padding-inline', 'spacing-4'],
    ['option-gap', 'spacing-4'],
    ['option-radius', 'radius-sm'],
    ['option-font-weight', 'font-weight-regular'],
    ['option-selected-bg', 'surface-3'],
    ['option-selected-highlight-bg', 'surface-4'],
    ['option-highlight-bg', 'surface-2'],
    ['option-disabled-opacity', 'opacity-50'],
    ['indicator-size', 'size-16'],
    ['indicator-color', 'text-1'],
    ['indicator-box-mark-size', 'size-12'],
    ['indicator-box-bg', 'surface-1'],
    ['indicator-box-shadow', 'shadow-xs'],
    ['indicator-box-border-color', 'border-3'],
    ['group-label-gap', 'spacing-3'],
    ['group-label-padding-block', 'spacing-3'],
    ['search-focus-color', 'focus-2'],
    ['empty-padding-block', 'spacing-6'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it.each([
    ['hover-bg'],
    ['disabled-bg'],
    ['disabled-border-color'],
    ['disabled-text-color'],
    ['focus-width'],
    ['focus-offset'],
    ['content-gap'],
    ['option-highlight-ring-width'],
    ['option-highlight-ring-color'],
    ['option-disabled-text-color'],
    ['group-label-disabled-color'],
  ])('has no token %s', (name) => {
    expect(css).not.toContain(`--cck-select-${name}`);
    expect(own(name)).toBeUndefined();
  });

  it('keeps every Component value an alias, with the 236px trigger width and the list motion the only exceptions', () => {
    expect(rawTokens('select')).toEqual([
      'Select / Structure#min-inline-size',
      'Select__content / Structure#content-motion-duration',
    ]);
    expect(own('min-inline-size')).toBe('236px');
    expect(own('content-motion-duration')).toBe('150ms');
  });

  it('draws a trigger as wide as min-inline-size, which the value never changes', () => {
    const root = declarationsOf(css, '.cck-select') ?? '';
    expect(root).toContain('inline-size: var(--cck-select-min-inline-size)');
    expect(root).toContain('max-inline-size: 100%');
  });

  it('sets the chevron size in the size collection only', () => {
    expect(own('icon-size')).toBeUndefined();
    expect(declarationsOf(css, '.cck-select__dropdown-icon')).toContain('font-size: var(--cck-select-icon-size)');
  });

  it('fades the label of a disabled group with the option disabled opacity', () => {
    expect(declarationsOf(css, '.cck-select__option-group[data-disabled] > .cck-select__option-group-label')).toContain(
      'opacity: var(--cck-select-option-disabled-opacity)',
    );
  });
});

describe('select design match: rules', () => {
  it('changes the border of the trigger on hover and keeps the fill', () => {
    const rule = declarationsOf(css, '.cck-select__trigger:where(:hover)') ?? '';
    expect(rule).toContain('border-color: var(--cck-select-hover-border-color)');
    expect(rule).not.toContain('background-color');
  });

  it('shows the focus border and halo on the trigger of an open select, Highlight in forced colors', () => {
    const selector = '.cck-select[data-state=open] > .cck-select__trigger';
    const rule = declarationsInList(css, selector) ?? '';
    expect(rule).toContain('border-color: var(--_focus)');
    expect(rule).toContain(
      'box-shadow: 0 0 0 var(--cck-select-focus-ring-width) color-mix(in srgb, var(--_focus) var(--cck-select-focus-ring-mix), transparent)',
    );
    expect(rule).not.toContain('outline');
    const high = declarationsInList(forced, selector) ?? '';
    expect(high).toContain('border-color: Highlight');
    expect(high).toContain('outline: var(--cck-select-focus-ring-width) solid Highlight');
  });

  it('weights the value and the options, and pads the list column with no gap between rows', () => {
    expect(declarationsOf(css, '.cck-select__value')).toContain('font-weight: var(--cck-select-value-font-weight)');
    const option = declarationsOf(css, '.cck-select__option') ?? '';
    expect(option).toContain('font-weight: var(--cck-select-option-font-weight)');
    expect(option).toContain('min-block-size: var(--cck-select-option-min-height)');
    const content = declarationsOf(css, CONTENT) ?? '';
    expect(content).toContain('flex-direction: column');
    expect(content).toContain('padding: var(--cck-select-content-padding)');
    expect(content).not.toMatch(/(^|[\s;])gap:/);
    expect(declarationsOf(css, '.cck-select__option-group')).not.toMatch(/(^|[\s;])gap:/);
  });

  it('keeps the row height of options and group labels in a height-limited list', () => {
    expect(declarationsOf(css, '.cck-select__option')).toContain('flex: none');
    expect(declarationsOf(css, '.cck-select__option-group-label')).toContain('flex: none');
  });

  it('marks a selected option without a background in forced colors when the indicator is none', () => {
    const rule = declarationsOf(forced, '.cck-select__content[data-indicator=none] .cck-select__option[data-selected]');
    expect(rule).toContain('outline: var(--cck-select-content-focus-width) solid CanvasText');
    expect(rule).toContain('outline-offset: calc(-1 * var(--cck-select-content-focus-width))');
  });

  it('fills a selected option of the none kind after the highlight rule, and a highlighted one with its own fill', () => {
    const none = '.cck-select__content[data-indicator=none] .cck-select__option[data-selected]';
    const highlight = css.indexOf('.cck-select__option[data-highlighted] {');
    const selected = css.indexOf(`${none} {`);
    const both = css.indexOf(`${none}[data-highlighted] {`);
    expect(selected).toBeGreaterThan(highlight);
    expect(both).toBeGreaterThan(selected);
    expect(declarationsOf(css, none)).toContain('background-color: var(--cck-select-option-selected-bg)');
    expect(declarationsOf(css, `${none}[data-highlighted]`)).toContain(
      'background-color: var(--cck-select-option-selected-highlight-bg)',
    );
    expect(declarationsInList(forced, '.cck-select__option[data-highlighted]')).toContain(
      'background-color: Highlight',
    );
  });
});
