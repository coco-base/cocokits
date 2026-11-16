import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, selectorsOf, sizeTokenOf, structureTokenOf, tokensCss } from './css-test-helpers';

const chipCss = read('dist', 'components', 'chip.css');
const listCss = read('dist', 'components', 'chip-list.css');
const fieldCss = read('dist', 'components', 'form-field.css');
const stylesCss = read('dist', 'styles.css');
const BOX = '.cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea, > .cck-chip-list)';
const FIELD_LIST = '.cck-form-field__wrapper > .cck-form-field__input-wrapper > .cck-chip-list';
/** The rules of the Chip itself: the entry sheets also hold the SvgIcon rules (svg-icon-css.test.ts). */
const own = (css: string): string => css.slice(0, css.indexOf('.cck-svg-icon'));
const forced = (css: string, from = '@media (forced-colors: active)'): string => css.slice(css.indexOf(from));

describe('chip output', () => {
  it('puts the rules inside @layer cocokits, in both entries and in the whole theme', () => {
    expect(chipCss.startsWith('@layer cocokits {')).toBe(true);
    expect(listCss.startsWith('@layer cocokits {')).toBe(true);
    expect(stylesCss).toContain('.cck-chip {');
    expect(stylesCss).toContain('.cck-chip-list {');
  });

  it('emits the size modes on each root, the structure on the class, and nothing on :root', () => {
    for (const block of ['chip', 'chip-list']) {
      for (const mode of ['sm', 'lg']) expect(tokensCss).toContain(`.cck-${block}[data-size=${mode}] {`);
      expect(tokensCss).toContain(`.cck-${block}, .cck-${block}[data-size=md] {`);
    }
    const onRoot = tokensCss
      .split('  }')
      .filter((block) => block.includes(':root'))
      .join('');
    expect(onRoot).not.toContain('--cck-chip');
  });

  it.each([
    ['sm', 28],
    ['md', 32],
    ['lg', 36],
  ])('gives the %s chip and the %s list chip the height %i', (mode, height) => {
    for (const [block, name] of [
      ['chip', '--cck-chip-height'],
      ['chip-list', '--cck-chip-list-chip-height'],
    ]) {
      const selector =
        mode === 'md' ? `.cck-${block}, .cck-${block}[data-size=md]` : `.cck-${block}[data-size=${mode}]`;
      const rule = tokensCss.slice(tokensCss.indexOf(`${selector} {`));
      expect(rule.slice(0, rule.indexOf('}'))).toContain(`${name}: var(--cck-size-${String(height)})`);
    }
  });

  it('reads only its own tokens, and every one exists in tokens.css', () => {
    const names = [...new Set([...(own(chipCss) + own(listCss)).matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]))];
    expect(names.length).toBeGreaterThan(20);
    for (const name of names) {
      expect(name.startsWith('--cck-chip-'), name).toBe(true);
      expect(tokensCss, name).toContain(`${name}:`);
    }
  });
});

describe('chip box', () => {
  it('lays the chip out inline with the height, the padding, the border and the text from tokens', () => {
    const rule = declarationsOf(chipCss, '.cck-chip') ?? '';
    for (const line of [
      'display: inline-flex',
      'align-items: center',
      'gap: var(--cck-chip-gap)',
      'block-size: var(--cck-chip-height)',
      'padding-inline: var(--cck-chip-padding-inline)',
      'border-radius: var(--cck-chip-radius)',
      'font-weight: var(--cck-chip-font-weight)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('draws the disabled chip with the disabled border and text colors', () => {
    const rule = declarationsOf(chipCss, '.cck-chip[data-disabled]') ?? '';
    expect(rule).toContain('var(--cck-chip-disabled-border-color)');
    expect(rule).toContain('var(--cck-chip-disabled-text-color)');
  });

  it('makes the remove button a round square of at least 24 by 24 px with the icon size as its font size', () => {
    const rule = declarationsOf(chipCss, '.cck-chip__remove') ?? '';
    for (const line of [
      'inline-size: var(--cck-chip-remove-size)',
      'block-size: var(--cck-chip-remove-size)',
      'border-radius: 50%',
      'font-size: var(--cck-chip-icon-size)',
      'margin-inline-end: calc(var(--cck-chip-remove-end-inset) - var(--cck-chip-padding-inline))',
    ]) {
      expect(rule).toContain(line);
    }
    expect(tokensCss).toMatch(/--cck-chip-remove-size: var\(--cck-size-(2[4-9]|[3-9]\d)\)/);
  });

  it('has no hover look on the remove button, and a disabled one stays transparent', () => {
    expect(chipCss).not.toContain(':hover');
    expect(tokensCss).not.toContain('--cck-chip-remove-hover-bg');
    expect(declarationsOf(chipCss, '.cck-chip__remove[data-disabled], .cck-chip__remove:disabled')).toContain(
      'background-color: transparent',
    );
  });

  it('draws the focus ring on the pill when the remove button has focus, and none on the button', () => {
    const pill = declarationsOf(chipCss, '.cck-chip:has(> .cck-chip__remove:focus-visible)') ?? '';
    expect(pill).toContain('outline: var(--cck-chip-focus-width) solid var(--cck-chip-focus-color)');
    expect(pill).toContain('outline-offset: var(--cck-chip-focus-offset)');
    expect(declarationsOf(chipCss, '.cck-chip__remove:focus-visible')).toContain('outline: none');
  });

  it('takes the icon size per size mode, 16px and 20px at lg', () => {
    expect(sizeTokenOf('.cck-chip', 'sm', 'chip-icon-size')).toBe(ref('size-16'));
    expect(sizeTokenOf('.cck-chip', 'md', 'chip-icon-size')).toBe(ref('size-16'));
    expect(sizeTokenOf('.cck-chip', 'lg', 'chip-icon-size')).toBe(ref('size-20'));
  });

  it.each(['sm', 'md', 'lg'])('sizes the chips of a %s list through CSS from the list size tokens', (mode) => {
    const chip = declarationsOf(listCss, '.cck-chip-list .cck-chip') ?? '';
    for (const line of [
      'block-size: var(--cck-chip-list-chip-height)',
      'gap: var(--cck-chip-list-chip-gap)',
      'padding-inline: var(--cck-chip-list-chip-padding-inline)',
      'font-size: var(--cck-chip-list-chip-font-size)',
      'line-height: var(--cck-chip-list-chip-line-height)',
    ])
      expect(chip).toContain(line);
    expect(declarationsOf(listCss, '.cck-chip-list .cck-chip__remove')).toContain(
      'font-size: var(--cck-chip-list-chip-icon-size)',
    );
    for (const name of [
      'padding-inline',
      'gap',
      'remove-end-inset',
      'font-family',
      'font-size',
      'line-height',
      'letter-spacing',
      'icon-size',
    ])
      expect(sizeTokenOf('.cck-chip-list', mode, `chip-list-chip-${name}`), name).toBe(
        sizeTokenOf('.cck-chip', mode, `chip-${name}`),
      );
    expect(sizeTokenOf('.cck-chip-list', mode, 'chip-list-chip-height')).toBe(
      sizeTokenOf('.cck-chip', mode, 'chip-height'),
    );
  });

  it.each(['.cck-chip', '.cck-chip__content-wrapper', '.cck-chip__remove', '.cck-chip-list'])(
    'restates [hidden] on %s, which sets display',
    (selector) => {
      expect(declarationsOf(stylesCss, `${selector}[hidden]`)).toContain('display: none');
    },
  );
});

describe('chip list', () => {
  it('wraps its chips and its text box in a flex row with the gap', () => {
    const rule = declarationsOf(listCss, '.cck-chip-list') ?? '';
    for (const line of ['display: flex', 'flex-wrap: wrap', 'align-items: center', 'gap: var(--cck-chip-list-gap)']) {
      expect(rule).toContain(line);
    }
  });

  it('draws the standalone box from the structure tokens, as the Input', () => {
    const rule = declarationsOf(listCss, '.cck-chip-list') ?? '';
    for (const line of [
      'border: var(--cck-chip-list-border-width) solid var(--cck-chip-list-border-color)',
      'border-radius: var(--cck-chip-list-radius)',
      'background-color: var(--cck-chip-list-bg)',
      'padding-inline: var(--cck-chip-list-padding-inline)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it.each([
    [':where([data-invalid]):where([data-touched], [data-submitted])', 'invalid-border-color'],
    [':where([data-readonly])', 'readonly-bg'],
    [':where([data-disabled])', 'disabled-bg'],
  ])('draws the %s look from its own facts', (state, token) => {
    expect(declarationsOf(listCss, `.cck-chip-list${state}`)).toContain(`var(--cck-chip-list-${token})`);
  });

  it('shows the focus of the text box as a ring on the box', () => {
    const rule = declarationsOf(listCss, '.cck-chip-list:focus-within') ?? '';
    expect(rule).toContain('var(--cck-chip-list-focus-width) solid var(--cck-chip-list-focus-color)');
  });

  it('gives the text box the rest of the row, no border and no outline, and the chip height', () => {
    const rule = declarationsOf(listCss, '.cck-chip-list__input') ?? '';
    for (const line of [
      'flex: 1',
      'min-inline-size: var(--cck-chip-list-input-min-inline-size)',
      'border: 0',
      'outline: none',
      'background-color: transparent',
      'block-size: var(--cck-chip-list-chip-height)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('leaves the size of the chips it renders to the chip: no rule of the list sets a chip height (C14)', () => {
    expect(listCss).not.toContain('.cck-chip-list[data-size] > .cck-chip');
    expect(stylesCss).not.toMatch(/\.cck-chip-list[^{]*>\s*\.cck-chip\s*\{/);
  });
});

describe('chip list in a form field', () => {
  it('lets the input wrapper draw the box of a list, and leaves the list borderless', () => {
    expect(declarationsOf(fieldCss, BOX)).toContain('border: var(--cck-form-field-border-width) solid');
    const rule = declarationsOf(listCss, '.cck-form-field__input-wrapper > .cck-chip-list') ?? '';
    for (const line of ['flex: 1', 'border: 0', 'padding-inline: 0', 'background-color: transparent']) {
      expect(rule).toContain(line);
    }
    expect(declarationsOf(listCss, '.cck-form-field__input-wrapper > .cck-chip-list:focus-within')).toContain(
      'outline: none',
    );
  });

  it('no longer sets the chip height or the text of the list from the field (C15, F25)', () => {
    expect(fieldCss).not.toContain('--cck-chip-list-chip-height');
    expect(fieldCss).not.toContain('--cck-chip-list-field-chip-height');
    expect(fieldCss).not.toContain(FIELD_LIST);
    const rule = declarationsOf(listCss, '.cck-form-field__input-wrapper > .cck-chip-list') ?? '';
    expect(rule).not.toMatch(/font|letter-spacing/);
  });

  it.each([
    ['sm', 1, 28, 32],
    ['md', 3, 32, 40],
    ['lg', 5, 36, 48],
  ])(
    'keeps one row of the %s list inside the field box: inset %ipx, row %ipx, field %ipx',
    (mode, inset, row, field) => {
      const rule = declarationsOf(listCss, '.cck-form-field__input-wrapper > .cck-chip-list') ?? '';
      expect(rule).toContain('padding-block: var(--cck-chip-list-inset-padding-block)');
      expect(sizeTokenOf('.cck-chip-list', mode, 'chip-list-inset-padding-block')).toBe(`${String(inset)}px`);
      // The inset centres the row in the field box: field height = row + 2 * inset + 2 * border (1px).
      expect(row + 2 * inset + 2).toBe(field);
    },
  );
});

describe('chip forced colors and selectors', () => {
  it('keeps the chip border, greys the disabled chip and keeps the remove focus ring visible', () => {
    expect(declarationsOf(forced(chipCss), '.cck-chip')).toContain('border-color: CanvasText');
    expect(declarationsOf(forced(chipCss), '.cck-chip[data-disabled]')).toContain('GrayText');
    expect(declarationsOf(forced(chipCss), '.cck-chip:has(> .cck-chip__remove:focus-visible)')).toContain(
      'outline-color: Highlight',
    );
  });

  it('keeps the list border and greys the disabled one; an invalid list only changes the colour', () => {
    const css = forced(listCss, '@media (forced-colors: active) {\n    .cck-chip-list {');
    expect(declarationsOf(css, '.cck-chip-list')).toContain('border-color: CanvasText');
    expect(css).not.toContain('invalid');
    expect(declarationsOf(css, '.cck-chip-list:where([data-disabled])')).toContain('GrayText');
  });

  it('uses no :nth-child and no tag selector in a rule that names a chip', () => {
    const selectors = [...selectorsOf(own(chipCss)), ...selectorsOf(own(listCss)), ...selectorsOf(fieldCss)].filter(
      (selector) => selector.includes('.cck-chip'),
    );
    expect(selectors.length).toBeGreaterThan(10);
    for (const selector of selectors) {
      expect(selector).not.toContain(':nth-');
      expect(selector).not.toMatch(/(^|[\s>+~(,])(div|span|input|button|svg|p)([\s.:[>+~),]|$)/);
    }
  });
});

describe('chip design match', () => {
  const size = (mode: string, name: string): string | undefined => sizeTokenOf('.cck-chip', mode, `chip-${name}`);
  const own = (name: string): string | undefined => structureTokenOf('.cck-chip', `chip-${name}`);

  it.each([
    ['sm', 'spacing-4', 'spacing-2', 'spacing-3', 'text-xs'],
    ['md', 'spacing-5', 'spacing-3', 'spacing-4', 'text-sm'],
    ['lg', 'spacing-6', 'spacing-4', 'spacing-5', 'text-md'],
  ])('size %s: padding %s, gap %s, remove inset %s and %s text', (mode, padding, gap, inset, text) => {
    expect(size(mode, 'padding-inline')).toBe(ref(padding));
    expect(size(mode, 'gap')).toBe(ref(gap));
    expect(size(mode, 'remove-end-inset')).toBe(ref(inset));
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(size(mode, part), part).toBe(ref(`${text}-${part}`));
  });

  it.each([
    ['radius', 'radius-full'],
    ['bg', 'surface-2'],
    ['border-color', 'border-2'],
    ['text-color', 'text-1'],
    ['disabled-bg', 'disabled-surface'],
    ['focus-color', 'focus-2'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it('moves padding, gap, remove inset and the font tokens to the size collection', () => {
    for (const name of ['padding-inline', 'gap', 'remove-end-inset', 'font-family', 'font-size']) {
      expect(own(name), name).toBeUndefined();
    }
  });

  it('fills the chip, and the disabled chip with its own fill', () => {
    expect(declarationsOf(chipCss, '.cck-chip')).toContain('background-color: var(--cck-chip-bg)');
    expect(declarationsOf(chipCss, '.cck-chip[data-disabled]')).toContain(
      'background-color: var(--cck-chip-disabled-bg)',
    );
  });

  it.each([
    ['sm', 'spacing-4'],
    ['md', 'spacing-5'],
    ['lg', 'spacing-6'],
  ])('moves the chip list gap to its size collection: %s is %s', (mode, gap) => {
    expect(sizeTokenOf('.cck-chip-list', mode, 'chip-list-gap')).toBe(ref(gap));
    expect(structureTokenOf('.cck-chip-list', 'chip-list-gap')).toBeUndefined();
  });

  it('keeps the field chip height of lg in step with the 36px chip', () => {
    expect(structureTokenOf('.cck-chip-list', 'chip-list-field-chip-height-lg')).toBe(ref('size-36'));
  });
});
