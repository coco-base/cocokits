import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, sizeTokenOf, structureTokenOf } from './css-test-helpers';

const css = ['form-field', 'label', 'hint', 'input', 'textarea', 'chip-list', 'field-error']
  .map((name) => read('dist', 'components', `${name}.css`))
  .join('\n');
const FIELD = '.cck-form-field';
const BOX = '.cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea, > .cck-chip-list)';
const DISABLED = '.cck-form-field:where([data-disabled], :has(';
const size = (mode: string, name: string): string | undefined => sizeTokenOf(FIELD, mode, `form-field-${name}`);
const forced = css.slice(css.indexOf('@media (forced-colors: active)'));

/** The declarations of the first rule whose selector list contains `part`, from `from` on. */
const ruleWith = (sheet: string, part: string, from = 0): string =>
  [...sheet.slice(from).matchAll(/([^{}]+)\{([^{}]*)\}/g)].find((match) => match[1].includes(part))?.[2] ?? '';

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

describe('form field design match: tokens', () => {
  it.each([
    ['sm', 'control-sm', 'spacing-4', 'size-16'],
    ['md', 'control-md', 'spacing-5', 'size-16'],
    ['lg', 'control-lg', 'spacing-5', 'size-20'],
  ])('size %s: height %s, padding and addon padding %s, zone icon %s, text-sm text', (mode, height, inline, icon) => {
    expect(size(mode, 'height')).toBe(ref(height));
    expect(size(mode, 'padding-inline')).toBe(ref(inline));
    expect(size(mode, 'addon-padding-inline')).toBe(ref(inline));
    expect(size(mode, 'affix-icon-size')).toBe(ref(icon));
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing']) {
      expect(size(mode, part), part).toBe(ref(`text-sm-${part}`));
      expect(size(mode, `addon-${part}`), `addon-${part}`).toBe(ref(`text-sm-${part}`));
    }
  });

  it('follows the density mode: control-sm, -md and -lg per Normal, Compact and Comfortable', () => {
    expect(density('control-sm')).toEqual([ref('size-32'), ref('size-28'), ref('size-36')]);
    expect(density('control-md')).toEqual([ref('size-36'), ref('size-32'), ref('size-40')]);
    expect(density('control-lg')).toEqual([ref('size-40'), ref('size-36'), ref('size-44')]);
  });

  it.each([['padding-block'], ['gap'], ['zone-gap'], ['affix-padding'], ['hint-icon-size']])(
    'Form Field / Size has no %s',
    (name) => {
      for (const mode of ['sm', 'md', 'lg']) expect(size(mode, name)).toBeUndefined();
    },
  );

  it.each([
    [FIELD, 'form-field-balance-indent', 'spacing-0'],
    [FIELD, 'form-field-min-inline-size', 'size-96'],
    [FIELD, 'form-field-gap', 'spacing-4'],
    [FIELD, 'form-field-feedback-gap', 'spacing-3'],
    [FIELD, 'form-field-zone-gap', 'spacing-4'],
    [FIELD, 'form-field-affix-text-color', 'text-3'],
    [FIELD, 'form-field-addon-bg', 'surface-2'],
    [FIELD, 'form-field-addon-text-color', 'text-2'],
    ['.cck-label', 'label-font-weight', 'font-weight-medium'],
    ['.cck-label', 'label-font-size', 'text-sm-font-size'],
    ['.cck-label', 'label-text-color', 'text-1'],
    ['.cck-hint', 'hint-text-color', 'text-3'],
    ['.cck-hint', 'hint-font-size', 'text-xs-font-size'],
    ['.cck-hint', 'hint-icon-size', 'size-14'],
    ['.cck-field-error', 'field-error-font-size', 'text-xs-font-size'],
    ['.cck-field-error', 'field-error-text-color', 'danger-text'],
    ['.cck-textarea', 'textarea-grip-inset', 'size-2'],
    ['.cck-textarea', 'textarea-grip-gap', 'size-3'],
  ])('structure token of %s: %s is %s', (root, name, value) => {
    expect(structureTokenOf(root, name)).toBe(ref(value));
  });

  it.each([
    ['textarea', 'sm', 'control-sm'],
    ['textarea', 'md', 'control-md'],
    ['textarea', 'lg', 'control-lg'],
  ])('size token of %s %s: control-height is %s', (name, mode, value) => {
    expect(sizeTokenOf(`.cck-${name}`, mode, `${name}-control-height`)).toBe(ref(value));
  });

  it.each([[FIELD], ['.cck-input'], ['.cck-textarea'], ['.cck-chip-list']])(
    '%s: the field box tokens, hover border border/3, a focus/2 halo of size-3 at opacity-20, opacity-50 disabled',
    (root) => {
      const name = root.replace('.cck-', '');
      const own = (token: string): string | undefined => structureTokenOf(root, `${name}-${token}`);
      expect(own('hover-border-color')).toBe(ref('border-3'));
      expect(own('shadow')).toBe(ref('shadow-xs'));
      expect(own('focus-color')).toBe(ref('focus-2'));
      expect(own('focus-ring-width')).toBe(ref('size-3'));
      expect(own('focus-ring-mix')).toBe(ref('opacity-20'));
      expect(own('disabled-opacity')).toBe(ref('opacity-50'));
      for (const gone of ['hover-bg', 'disabled-bg', 'disabled-border-color', 'disabled-text-color']) {
        expect(own(gone), gone).toBeUndefined();
      }
      for (const gone of ['focus-width', 'focus-offset']) expect(own(gone), gone).toBeUndefined();
    },
  );

  it('keeps every Component value an alias, with the raw widths of Form Field / Width the only exception', () => {
    expect(rawTokens('form-field')).toEqual(['Form Field / Width#inline-size']);
    for (const file of ['label', 'hint', 'input', 'textarea', 'field-error']) expect(rawTokens(file), file).toEqual([]);
  });
});

describe('form field design match: rules', () => {
  it.each([
    ['the field box', `${BOX}:where(:hover)`, 'form-field'],
    ['the Input', '.cck-input:where(:hover)', 'input'],
    ['the Textarea', '.cck-textarea:where(:hover)', 'textarea'],
    ['the Chip list', '.cck-chip-list:where(:hover)', 'chip-list'],
  ])('%s changes the border on hover and keeps the fill', (_, selector, name) => {
    const rule = declarationsOf(css, selector) ?? '';
    expect(rule).toContain(`border-color: var(--cck-${name}-hover-border-color)`);
    expect(rule).not.toContain('background-color');
  });

  it('puts the disabled rule of the field box after the hover rule, so its border wins', () => {
    const hover = css.indexOf(`${BOX}:where(:hover)`);
    expect(hover).toBeGreaterThan(-1);
    const disabled = css.indexOf(DISABLED);
    expect(disabled).toBeGreaterThan(hover);
    const rule = ruleWith(css, `> .cck-form-field__wrapper > ${BOX}`, disabled);
    expect(rule).toContain('border-color: var(--cck-form-field-border-color)');
    expect(rule).toContain('opacity: var(--cck-form-field-disabled-opacity)');
    expect(rule).toContain('cursor: not-allowed');
  });

  it('spaces the zones from the control with zone-gap and sizes the zone icon', () => {
    expect(declarationsOf(css, '.cck-form-field__input-wrapper')).toContain('gap: var(--cck-form-field-zone-gap)');
    expect(css).not.toContain('--cck-form-field-affix-padding');
    expect(ruleWith(css, '.cck-form-field__input-wrapper > .cck-prefix > .cck-svg-icon')).toContain(
      'font-size: var(--cck-form-field-affix-icon-size)',
    );
  });

  it('draws Leading and Trailing as attached addons with the box border and their own text', () => {
    const rule = css.slice(css.indexOf('.cck-form-field__wrapper > .cck-leading,'));
    for (const line of [
      'min-block-size: var(--cck-form-field-height)',
      'border: var(--cck-form-field-border-width) solid var(--cck-form-field-border-color)',
      'background-color: var(--cck-form-field-addon-bg)',
      'box-shadow: var(--cck-form-field-shadow)',
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

  it('fades the Label and the Hint of a disabled field, GrayText at full opacity in forced colors', () => {
    const rule = ruleWith(css, '> .cck-label', css.indexOf(DISABLED));
    expect(rule).toContain('opacity: var(--cck-form-field-disabled-opacity)');
    expect(rule).not.toContain('color:');
    expect(css.slice(css.indexOf(DISABLED))).toContain('> .cck-form-field__feedback-wrapper > .cck-hint');
    const gray = ruleWith(forced, '> .cck-label', forced.indexOf(DISABLED));
    expect(gray).toContain('color: GrayText');
    expect(gray).toContain('opacity: 1');
  });

  it('gives a Textarea its own minimum height, an auto-resize one its rows, in a field too (F24)', () => {
    expect(css).not.toContain('--cck-form-field-textarea-min-height');
    expect(declarationsOf(css, '.cck-form-field__input-wrapper > .cck-textarea:not([data-auto-resize])')).toContain(
      'min-block-size: calc(var(--cck-textarea-min-height) - 2 * var(--cck-textarea-border-width))',
    );
    expect(declarationsOf(css, '.cck-textarea:not([data-auto-resize])')).toContain(
      'min-block-size: var(--cck-textarea-min-height)',
    );
    expect(declarationsOf(css, '.cck-textarea[data-auto-resize]')).toContain('--cck-textarea-min-rows');
  });
});
