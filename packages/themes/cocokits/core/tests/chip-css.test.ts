import { describe, expect, it } from 'vitest';
import { declarationsOf, read, selectorsOf, tokensCss } from './css-test-helpers';

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
    ['lg', 40],
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
      'font-size: var(--cck-chip-remove-icon-size)',
      'margin-inline-end: calc(var(--cck-chip-remove-end-inset) - var(--cck-chip-padding-inline))',
    ]) {
      expect(rule).toContain(line);
    }
    expect(tokensCss).toMatch(/--cck-chip-remove-size: var\(--cck-size-(2[4-9]|[3-9]\d)\)/);
  });

  it('tints the remove button on hover, and not while disabled', () => {
    expect(declarationsOf(chipCss, '.cck-chip__remove:hover')).toContain('var(--cck-chip-remove-hover-bg)');
    expect(chipCss.indexOf('.cck-chip__remove:hover')).toBeLessThan(chipCss.indexOf('.cck-chip__remove:disabled'));
    expect(declarationsOf(chipCss, '.cck-chip__remove[data-disabled], .cck-chip__remove:disabled')).toContain(
      'background-color: transparent',
    );
  });

  it('shows the focus ring of the theme on the remove button', () => {
    const rule = declarationsOf(chipCss, '.cck-chip__remove:focus-visible') ?? '';
    expect(rule).toContain('var(--cck-chip-focus-width) solid var(--cck-chip-focus-color)');
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

  it('sizes the chips it holds by a child combinator, over their own size', () => {
    expect(declarationsOf(listCss, '.cck-chip-list[data-size] > .cck-chip')).toContain(
      'block-size: var(--cck-chip-list-chip-height)',
    );
  });
});

describe('chip list in a form field', () => {
  it('lets the input wrapper draw the box of a list, and leaves the list borderless', () => {
    expect(declarationsOf(fieldCss, BOX)).toContain('border: var(--cck-form-field-border-width) solid');
    const rule = declarationsOf(fieldCss, '.cck-form-field__input-wrapper > .cck-chip-list') ?? '';
    for (const line of [
      'flex: 1',
      'border: 0',
      'padding-inline: 0',
      'box-shadow: none',
      'background-color: transparent',
    ]) {
      expect(rule).toContain(line);
    }
    expect(declarationsOf(fieldCss, '.cck-form-field__input-wrapper > .cck-chip-list:focus-within')).toContain(
      'outline: none',
    );
  });

  it.each([
    ['md', `.cck-form-field > ${FIELD_LIST}`],
    ['sm', `.cck-form-field[data-size=sm] > ${FIELD_LIST}`],
    ['lg', `.cck-form-field[data-size=lg] > ${FIELD_LIST}`],
  ])('takes the %s height of the chips from the field size', (mode, selector) => {
    expect(declarationsOf(fieldCss, selector)).toContain(
      `--cck-chip-list-chip-height: var(--cck-chip-list-field-chip-height-${mode})`,
    );
  });

  it('keeps one row of chips inside the height of the field box', () => {
    const rule = declarationsOf(fieldCss, '.cck-form-field__input-wrapper > .cck-chip-list') ?? '';
    expect(rule).toContain('var(--cck-form-field-height) - var(--cck-chip-list-chip-height)');
  });
});

describe('chip forced colors and selectors', () => {
  it('keeps the chip border, greys the disabled chip and keeps the remove focus ring visible', () => {
    expect(declarationsOf(forced(chipCss), '.cck-chip')).toContain('border-color: CanvasText');
    expect(declarationsOf(forced(chipCss), '.cck-chip[data-disabled]')).toContain('GrayText');
    expect(declarationsOf(forced(chipCss), '.cck-chip__remove:focus-visible')).toContain('outline-color: Highlight');
  });

  it('keeps the list border, thickens the invalid one and greys the disabled one', () => {
    const css = forced(listCss, '@media (forced-colors: active) {\n    .cck-chip-list {');
    expect(declarationsOf(css, '.cck-chip-list')).toContain('border-color: CanvasText');
    expect(
      declarationsOf(css, '.cck-chip-list:where([data-invalid]):where([data-touched], [data-submitted])'),
    ).toContain('border-width: var(--cck-chip-list-invalid-border-width)');
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
