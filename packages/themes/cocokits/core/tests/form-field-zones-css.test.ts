import { describe, expect, it } from 'vitest';
import { declarationsOf, read, tokensCss } from './css-test-helpers';

const stylesCss = ['form-field', 'label', 'hint', 'input', 'textarea', 'field-error']
  .map((name) => read('dist', 'components', `${name}.css`))
  .join('\n');
const scss = read('src', 'styles', 'components', '_form-field.scss');

const INSIDE = ['.cck-form-field__input-wrapper > .cck-prefix', '.cck-form-field__input-wrapper > .cck-suffix'];
const OUTSIDE = ['.cck-form-field__wrapper > .cck-leading', '.cck-form-field__wrapper > .cck-trailing'];
const list = (selectors: string[]): string => selectors.join(',\n  ');

describe('the zones', () => {
  it('keeps Prefix and Suffix inside the box as items that do not shrink, in the affix color', () => {
    const rule = declarationsOf(stylesCss, list(INSIDE)) ?? '';
    for (const line of [
      'display: flex',
      'flex: none',
      'align-items: center',
      'color: var(--cck-form-field-affix-text-color)',
      'min-block-size: calc(var(--cck-form-field-height) - 2 * var(--cck-form-field-border-width))',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('keeps Leading and Trailing outside the box, on the first line of it', () => {
    const rule = declarationsOf(stylesCss, list(OUTSIDE)) ?? '';
    for (const line of [
      'display: flex',
      'flex: none',
      'align-self: flex-start',
      'min-block-size: var(--cck-form-field-height)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('puts the gap on the two wrappers, so an empty zone (nothing rendered) leaves no gap', () => {
    for (const selector of ['.cck-form-field__wrapper', '.cck-form-field__input-wrapper']) {
      expect(declarationsOf(stylesCss, selector)).toContain('gap: var(--cck-form-field-zone-gap)');
    }
  });

  it('restates the native hidden on every zone, because the zones set display', () => {
    for (const selectors of [INSIDE, OUTSIDE]) {
      expect(declarationsOf(stylesCss, list(selectors.map((selector) => `${selector}[hidden]`)))).toContain(
        'display: none',
      );
    }
  });

  it('greys the affix text of a disabled field', () => {
    const selector =
      '.cck-form-field:where([data-disabled]) > .cck-form-field__wrapper > .cck-form-field__input-wrapper > :is(.cck-prefix, .cck-suffix)';
    expect(declarationsOf(stylesCss, selector)).toContain('color: var(--cck-form-field-affix-disabled-text-color)');
  });

  it('makes the affix text GrayText in forced colors when the field is disabled', () => {
    const forced = stylesCss.split('@media (forced-colors: active)')[1] ?? '';
    const selector =
      '.cck-form-field:where([data-disabled]) > .cck-form-field__wrapper > .cck-form-field__input-wrapper > :is(.cck-prefix, .cck-suffix)';
    expect(declarationsOf(forced, selector)).toContain('color: GrayText');
  });

  it('uses no physical property for the zones', () => {
    expect(scss).not.toMatch(/(^|[\s{;])(margin-left|margin-right|padding-left|padding-right|left|right)\s*:/);
  });
});

describe('the box of a Textarea', () => {
  it('aligns the items of the box to the start, so it grows with the textarea', () => {
    expect(declarationsOf(stylesCss, '.cck-form-field__input-wrapper:has(> .cck-textarea)')).toContain(
      'align-items: flex-start',
    );
  });

  it('gives the textarea in the box the padding-block of the field size, and bounds without a border', () => {
    const selector = '.cck-form-field__input-wrapper > .cck-textarea';
    expect(declarationsOf(stylesCss, selector)).toContain('padding-block: var(--cck-form-field-padding-block)');
    const bounds = declarationsOf(stylesCss, `${selector}[data-auto-resize]`) ?? '';
    expect(bounds).toContain('var(--cck-textarea-min-rows, 2)');
    expect(bounds).toContain('var(--cck-textarea-max-rows, 5)');
    expect(bounds).toContain('2 * var(--cck-form-field-padding-block)');
  });

  it.each([
    ['sm', 4],
    ['md', 6],
    ['lg', 10],
  ] as const)('takes the padding-block of %s from the Form Field / Size modes', (mode, step) => {
    expect(tokensCss).toMatch(
      new RegExp(
        `\\.cck-form-field\\[data-size=${mode}\\][^{]*\\{[^}]*--cck-form-field-padding-block: var\\(--cck-size-${String(step)}\\)`,
      ),
    );
  });
});

describe('the feedback wrapper and the FieldError', () => {
  it('gives back the gap of the field when nothing in the wrapper is visible, and never hides it', () => {
    const rule = declarationsOf(stylesCss, '.cck-form-field__feedback-wrapper:not(:has(> :not(:empty)))') ?? '';
    expect(rule).toContain('margin-block-start: calc(-1 * var(--cck-form-field-gap))');
    expect(rule).not.toContain('display');
  });

  it('spaces a shown message from the one above it with padding, never a margin on the FieldError', () => {
    const selector = '.cck-form-field__feedback-wrapper > :not(:empty) ~ .cck-field-error:not(:empty)';
    expect(declarationsOf(stylesCss, selector)).toContain('padding-block-start: var(--cck-form-field-gap)');
    expect(stylesCss).not.toMatch(/\.cck-field-error[^{]*\{[^}]*margin/);
  });

  it('puts no gap on the feedback wrapper', () => {
    expect(declarationsOf(stylesCss, '.cck-form-field__feedback-wrapper')).not.toContain('gap');
  });
});
