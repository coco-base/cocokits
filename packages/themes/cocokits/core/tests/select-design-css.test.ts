import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, sizeTokenOf, structureTokenOf } from './css-test-helpers';

const css = read('dist', 'components', 'select.css');
const ROOT = '.cck-select';
const size = (mode: string, name: string): string | undefined => sizeTokenOf(ROOT, mode, `select-${name}`);
const own = (name: string): string | undefined =>
  structureTokenOf(
    name.startsWith('content-') || name.startsWith('option-') || name.startsWith('indicator-')
      ? '.cck-select__content'
      : ROOT,
    `select-${name}`,
  );
const forced = css.slice(css.indexOf('@media (forced-colors: active)'));

describe('select design match: tokens', () => {
  it.each([
    ['sm', 'spacing-5', 'text-sm'],
    ['md', 'spacing-6', 'text-md'],
    ['lg', 'spacing-7', 'text-md'],
  ])('size %s: value-to-chevron gap %s, text %s', (mode, gap, text) => {
    expect(size(mode, 'gap')).toBe(ref(gap));
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(size(mode, part), part).toBe(ref(`${text}-${part}`));
  });

  it.each([
    ['hover-bg', 'surface-2'],
    ['hover-border-color', 'border-3'],
    ['border-color', 'border-2'],
    ['value-font-weight', 'font-weight-medium'],
    ['placeholder-color', 'text-3'],
    ['icon-color', 'on-surface-2'],
    ['content-border-color', 'border-2'],
    ['content-padding', 'spacing-0'],
    ['content-gap', 'spacing-3'],
    ['option-padding-block', 'spacing-4'],
    ['option-padding-inline', 'spacing-7'],
    ['option-gap', 'spacing-5'],
    ['option-radius', 'radius-md'],
    ['option-font-weight', 'font-weight-medium'],
    ['option-selected-bg', 'surface-2'],
    ['option-highlight-ring-color', 'focus-2'],
    ['option-highlight-ring-width', 'size-1'],
    ['option-highlight-bg', 'surface-2'],
    ['indicator-size', 'size-20'],
    ['indicator-color', 'brand-color'],
    ['indicator-box-border-color', 'on-surface-1'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it('draws the Figma shadow, a raw value of the list, and a trigger 236px wide that the value never changes', () => {
    expect(own('content-shadow')).toBe('0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)');
    expect(own('min-inline-size')).toBe('236px');
    const root = declarationsOf(css, '.cck-select') ?? '';
    expect(root).toContain('inline-size: var(--cck-select-min-inline-size)');
    expect(root).toContain('max-inline-size: 100%');
    expect(css).not.toContain('--cck-select-option-min-height');
  });

  it.each([
    ['sm', 'size-20'],
    ['md', 'size-24'],
    ['lg', 'size-24'],
  ])('size %s: the chevron is %s, set by the size collection', (mode, icon) => {
    expect(size(mode, 'icon-size')).toBe(ref(icon));
    expect(own('icon-size')).toBeUndefined();
  });

  it('dims the label of a disabled group', () => {
    expect(structureTokenOf('.cck-select__content', 'select-group-label-disabled-color')).toBe(
      ref('disabled-on-surface'),
    );
    expect(declarationsOf(css, '.cck-select__option-group[data-disabled] > .cck-select__option-group-label')).toContain(
      'color: var(--cck-select-group-label-disabled-color)',
    );
  });

  it('puts the active edge on a -2px focus offset', () => {
    expect(own('focus-offset')).toBe('-2px');
  });
});

describe('select design match: rules', () => {
  it('fills the trigger on hover and keeps the border', () => {
    const rule = declarationsOf(css, '.cck-select__trigger:where(:hover)') ?? '';
    expect(rule).toContain('border-color: var(--cck-select-hover-border-color)');
    expect(rule).toContain('background-color: var(--cck-select-hover-bg)');
  });

  it('shows the active edge on the trigger of an open select, Highlight in forced colors', () => {
    const selector = '.cck-select[data-state=open] > .cck-select__trigger';
    const rule = declarationsOf(css, selector) ?? '';
    expect(rule).toContain('outline: var(--cck-select-focus-width) solid var(--cck-select-focus-color)');
    expect(rule).toContain('outline-offset: var(--cck-select-focus-offset)');
    expect(declarationsOf(forced, selector)).toContain('outline-color: Highlight');
  });

  it('weights the value, the options and spaces the list', () => {
    expect(declarationsOf(css, '.cck-select__value')).toContain('font-weight: var(--cck-select-value-font-weight)');
    expect(declarationsOf(css, '.cck-select__option')).toContain('font-weight: var(--cck-select-option-font-weight)');
    const content = declarationsOf(css, '.cck-select__content') ?? '';
    expect(content).toContain('flex-direction: column');
    expect(content).toContain('gap: var(--cck-select-content-gap)');
    expect(declarationsOf(css, '.cck-select__option-group')).toContain('gap: var(--cck-select-content-gap)');
  });

  it('keeps the row height of options and group labels in a height-limited list', () => {
    expect(declarationsOf(css, '.cck-select__option')).toContain('flex: none');
    expect(declarationsOf(css, '.cck-select__option-group-label')).toContain('flex: none');
  });

  it('marks a selected option without a background in forced colors when the indicator is none', () => {
    const rule = declarationsOf(forced, '.cck-select__content[data-indicator=none] .cck-select__option[data-selected]');
    expect(rule).toContain('outline: 2px solid CanvasText');
    expect(rule).toContain('outline-offset: -2px');
  });

  it('fills a selected option after the highlight rule, so a highlighted selected option keeps it', () => {
    const highlight = css.indexOf('.cck-select__option[data-highlighted] {');
    const selected = css.indexOf('.cck-select__option[data-selected] {');
    expect(selected).toBeGreaterThan(highlight);
    expect(declarationsOf(css, '.cck-select__option[data-selected]')).toContain(
      'background-color: var(--cck-select-option-selected-bg)',
    );
    expect(declarationsOf(forced, '.cck-select__option[data-highlighted]')).toContain('background-color: Highlight');
  });
});
