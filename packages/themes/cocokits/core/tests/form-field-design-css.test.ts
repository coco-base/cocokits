import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, sizeTokenOf, structureTokenOf } from './css-test-helpers';

const css = ['form-field', 'label', 'hint', 'input', 'textarea', 'chip-list', 'field-error']
  .map((name) => read('dist', 'components', `${name}.css`))
  .join('\n');
const FIELD = '.cck-form-field';
const BOX = '.cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea, > .cck-chip-list)';
const size = (mode: string, name: string): string | undefined => sizeTokenOf(FIELD, mode, `form-field-${name}`);
const forced = css.slice(css.indexOf('@media (forced-colors: active)'));

describe('form field design match: tokens', () => {
  it.each([
    ['sm', 'spacing-3', 'spacing-4', 'spacing-3', 'text-sm', 'text-xs'],
    ['md', 'spacing-4', 'spacing-5', 'spacing-4', 'text-md', 'text-sm'],
    ['lg', 'spacing-5', 'spacing-6', 'spacing-5', 'text-md', 'text-sm'],
  ])(
    'size %s: gap %s, block and zone %s, affix %s, text %s, addon text %s',
    (mode, gap, inline, affix, text, addonText) => {
      expect(size(mode, 'gap')).toBe(ref(gap));
      expect(size(mode, 'padding-block')).toBe(ref(inline));
      expect(size(mode, 'zone-gap')).toBe(ref(inline));
      expect(size(mode, 'addon-padding-inline')).toBe(ref(inline));
      expect(size(mode, 'affix-padding')).toBe(ref(affix));
      for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing']) {
        expect(size(mode, part), part).toBe(ref(`${text}-${part}`));
        expect(size(mode, `addon-${part}`), `addon-${part}`).toBe(ref(`${addonText}-${part}`));
      }
    },
  );

  it.each([
    [FIELD, 'form-field-balance-indent', 'spacing-0'],
    [FIELD, 'form-field-affix-text-color', 'on-surface-2'],
    [FIELD, 'form-field-affix-icon-size', 'size-24'],
    [FIELD, 'form-field-addon-bg', 'surface-2'],
    [FIELD, 'form-field-addon-text-color', 'on-surface-2'],
    [FIELD, 'form-field-disabled-text-color', 'disabled-on-surface'],
    [FIELD, 'form-field-hover-bg', 'surface-2'],
    [FIELD, 'form-field-hover-border-color', 'border-3'],
    ['.cck-label', 'label-font-weight', 'font-weight-regular'],
    ['.cck-label', 'label-font-size', 'text-md-font-size'],
    ['.cck-label', 'label-text-color', 'text-1'],
    ['.cck-hint', 'hint-text-color', 'on-surface-3'],
    ['.cck-hint', 'hint-font-size', 'text-md-font-size'],
    ['.cck-field-error', 'field-error-font-size', 'text-md-font-size'],
    ['.cck-field-error', 'field-error-text-color', 'danger-text'],
    ['.cck-input', 'input-hover-bg', 'surface-2'],
    ['.cck-input', 'input-hover-border-color', 'border-3'],
    ['.cck-textarea', 'textarea-hover-bg', 'surface-2'],
    ['.cck-textarea', 'textarea-hover-border-color', 'border-3'],

    ['.cck-chip-list', 'chip-list-hover-bg', 'surface-2'],
    ['.cck-chip-list', 'chip-list-hover-border-color', 'border-3'],
  ])('structure token of %s: %s is %s', (root, name, value) => {
    expect(structureTokenOf(root, name)).toBe(ref(value));
  });

  it.each([FIELD, '.cck-input', '.cck-textarea', '.cck-chip-list'])(
    '%s: the active edge is a -2px focus offset',
    (root) => {
      const name = root.replace('.cck-', '');
      expect(structureTokenOf(root, `${name}-focus-offset`)).toBe('-2px');
    },
  );
});

describe('form field design match: rules', () => {
  it.each([
    ['the field box', `${BOX}:where(:hover)`, 'form-field'],
    ['the Input', '.cck-input:where(:hover)', 'input'],
    ['the Textarea', '.cck-textarea:where(:hover)', 'textarea'],
    ['the Chip list', '.cck-chip-list:where(:hover)', 'chip-list'],
  ])('%s fills on hover and keeps the border', (_, selector, name) => {
    const rule = declarationsOf(css, selector) ?? '';
    expect(rule).toContain(`border-color: var(--cck-${name}-hover-border-color)`);
    expect(rule).toContain(`background-color: var(--cck-${name}-hover-bg)`);
  });

  it('lets the disabled fill of the field box win over the hover fill', () => {
    const hover = css.indexOf(`${BOX}:where(:hover)`);
    expect(hover).toBeGreaterThan(-1);
    expect(css.indexOf('.cck-form-field:where([data-disabled]) > .cck-form-field__wrapper >')).toBeGreaterThan(hover);
  });

  it('takes the edge padding where a Prefix or Suffix is first or last, and sizes its icon', () => {
    expect(declarationsOf(css, `${BOX}:has(> .cck-prefix:first-child:not([hidden]))`)).toContain(
      'padding-inline-start: var(--cck-form-field-affix-padding)',
    );
    expect(declarationsOf(css, `${BOX}:has(> .cck-suffix:last-child:not([hidden]))`)).toContain(
      'padding-inline-end: var(--cck-form-field-affix-padding)',
    );
    const rule = css.slice(css.indexOf('.cck-form-field__input-wrapper > .cck-prefix > .cck-svg-icon'));
    expect(rule.slice(0, rule.indexOf('}'))).toContain('font-size: var(--cck-form-field-affix-icon-size)');
  });

  it('draws Leading and Trailing as attached addons with the box border and their own text', () => {
    const rule = css.slice(css.indexOf('.cck-form-field__wrapper > .cck-leading,'));
    for (const line of [
      'border: var(--cck-form-field-border-width) solid var(--cck-form-field-border-color)',
      'background-color: var(--cck-form-field-addon-bg)',
      'color: var(--cck-form-field-addon-text-color)',
      'padding-inline: var(--cck-form-field-addon-padding-inline)',
      'font-size: var(--cck-form-field-addon-font-size)',
      'font-family: var(--cck-form-field-addon-font-family)',
      'line-height: var(--cck-form-field-addon-line-height)',
      'letter-spacing: var(--cck-form-field-addon-letter-spacing)',
    ]) {
      expect(rule.slice(0, rule.indexOf('}'))).toContain(line);
    }
    expect(declarationsOf(css, '.cck-form-field__wrapper > .cck-leading')).toContain('border-inline-end-width: 0');
    expect(declarationsOf(css, '.cck-form-field__wrapper > .cck-trailing')).toContain('border-inline-start-width: 0');
  });

  it.each([
    ['leading', 'start'],
    ['trailing', 'end'],
  ])('squares the corners of the box and of a Select trigger that touch the %s addon', (zone, side) => {
    const prefix = `.cck-form-field__wrapper:has(> .cck-${zone}:not([hidden])) > .cck-form-field__input-wrapper`;
    for (const selector of [
      `${prefix}:has(> .cck-input, > .cck-textarea, > .cck-chip-list)`,
      `${prefix} > .cck-select > .cck-select__trigger`,
    ]) {
      const rule = css.slice(css.indexOf(selector));
      expect(rule.slice(0, rule.indexOf('}'))).toContain(`border-start-${side}-radius: 0`);
    }
  });

  it('colours the Label and the Hint of a disabled field, with GrayText in forced colors', () => {
    const selector = '.cck-form-field:where([data-disabled]) > .cck-label';
    const rule = css.slice(css.indexOf(selector));
    expect(rule.slice(0, rule.indexOf('}'))).toContain('color: var(--cck-form-field-disabled-text-color)');
    expect(rule).toContain('.cck-form-field__feedback-wrapper > .cck-hint');
    const gray = forced.slice(forced.indexOf(selector));
    expect(gray.slice(0, gray.indexOf('}'))).toContain('color: GrayText');
  });

  it('gives a Textarea its own minimum height, an auto-resize one its rows, in a field too (F24)', () => {
    expect(css).not.toContain('--cck-form-field-textarea-min-height');
    expect(declarationsOf(css, '.cck-form-field__input-wrapper > .cck-textarea:not([data-auto-resize])')).toBe(
      undefined,
    );
    expect(declarationsOf(css, '.cck-textarea:not([data-auto-resize])')).toContain(
      'min-block-size: var(--cck-textarea-min-height)',
    );
    expect(declarationsOf(css, '.cck-textarea[data-auto-resize]')).toContain('--cck-textarea-min-rows');
  });
});
