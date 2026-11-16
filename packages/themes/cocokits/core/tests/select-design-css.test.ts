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
    ['border-color', 'border-3'],
    ['value-font-weight', 'font-weight-medium'],
    ['placeholder-color', 'text-2'],
    ['icon-color', 'on-surface-2'],
    ['icon-size', 'size-24'],
    ['content-border-color', 'border-2'],
    ['content-shadow', 'shadow-md'],
    ['content-padding', 'spacing-4'],
    ['content-gap', 'spacing-3'],
    ['option-padding-block', 'spacing-4'],
    ['option-padding-inline', 'spacing-7'],
    ['option-gap', 'spacing-5'],
    ['option-radius', 'radius-md'],
    ['option-font-weight', 'font-weight-medium'],
    ['option-selected-bg', 'brand-container'],
    ['option-highlight-bg', 'surface-2'],
    ['indicator-size', 'size-20'],
    ['indicator-color', 'brand-on-container'],
    ['indicator-box-border-color', 'on-surface-1'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
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
