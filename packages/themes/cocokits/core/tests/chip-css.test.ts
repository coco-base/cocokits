import { describe, expect, it } from 'vitest';
import {
  declarationsInList,
  declarationsOf,
  read,
  ref,
  selectorsOf,
  sizeTokenOf,
  structureTokenOf,
  tokensCss,
} from './css-test-helpers';

const chipCss = read('dist', 'components', 'chip.css');
const listCss = read('dist', 'components', 'chip-list.css');
const fieldCss = read('dist', 'components', 'form-field.css');
const stylesCss = read('dist', 'styles.css');
const BOX = '.cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea, > .cck-chip-list)';
const IN_FIELD = '.cck-form-field__input-wrapper > .cck-chip-list';
const FOCUS = ':has(> .cck-chip-list__input:focus-visible)';
const INVALID = ':where([data-invalid]):where([data-touched], [data-submitted])';
const DISABLED = ':where([data-disabled], :has(> .cck-chip-list__input:disabled))';
const MODES = ['sm', 'md', 'lg'] as const;
/** The rules of the Chip itself: the entry sheets also hold the SvgIcon rules (svg-icon-css.test.ts). */
const own = (css: string): string => css.slice(0, css.indexOf('.cck-svg-icon'));
const forced = (css: string, from = '@media (forced-colors: active)'): string => css.slice(css.indexOf(from));
/** The forced-colors block of the Chip list (the list entry also holds the Chip rules, with their own block). */
const LIST_FORCED = '@media (forced-colors: active) {\n    .cck-chip-list {';
/** The Chip step a list chip repeats: `md` for a sm or md list, `lg` for a lg list (css-fields.md, Chip list). */
const chipStep = (mode: string): string => (mode === 'lg' ? 'lg' : 'md');

/** The pixels of a `control-*` or Core size token in one density mode, read from tokens.css. */
const px = (name: string, density: 'normal' | 'compact' | 'comfortable'): number => {
  const selector = density === 'normal' ? ':root, [data-cck-spacing=normal]' : `[data-cck-spacing=${density}]`;
  const block = declarationsOf(tokensCss, selector) ?? '';
  const alias = new RegExp(`--cck-${name}: var\\(--cck-(size-\\d+)\\)`).exec(block)?.[1] ?? name;
  return Number(new RegExp(`--cck-${alias}: (\\d+)px`).exec(tokensCss)?.[1]);
};

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
    ['sm', 'control-xs'],
    ['md', 'control-xs'],
    ['lg', 'control-sm'],
  ])('gives the %s chip and the %s list chip the height %s', (mode, height) => {
    expect(sizeTokenOf('.cck-chip', mode, 'chip-height')).toBe(ref(height));
    expect(sizeTokenOf('.cck-chip-list', mode, 'chip-list-chip-height')).toBe(ref(height));
  });

  it('reads only its own tokens, every one in tokens.css, and sets every private property it reads', () => {
    const css = own(chipCss) + own(listCss);
    const names = [...new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]))];
    expect(names.length).toBeGreaterThan(20);
    for (const name of names) {
      if (name.startsWith('--_')) {
        expect(css, name).toContain(`${name}:`);
        continue;
      }
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
      'border: var(--cck-chip-border-width) solid transparent',
      'border-radius: var(--cck-chip-radius)',
      'font-weight: var(--cck-chip-font-weight)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('fades the disabled chip with the disabled opacity and keeps its colours', () => {
    const rule = declarationsOf(chipCss, '.cck-chip[data-disabled]') ?? '';
    expect(rule).toContain('opacity: var(--cck-chip-disabled-opacity)');
    expect(rule).toContain('cursor: not-allowed');
    expect(rule).not.toMatch(/(^|[\s;])(color|background-color|border-color):/);
  });

  it('tints the pill on hover and press of the toggle only, never for a disabled toggle', () => {
    for (const [state, mix] of [
      ['hover', 'hover-mix'],
      ['active', 'active-mix'],
    ]) {
      const selector = `.cck-chip:where(:has(> .cck-chip__content-wrapper[type=button]:${state}:not(:disabled)))`;
      expect(declarationsOf(chipCss, selector), state).toContain(
        `background-color: color-mix(in srgb, var(--_fill), var(--_ink) var(--cck-chip-${mix}))`,
      );
    }
  });

  it('makes the remove button a circle of the icon plus its padding, with the icon size as its font size', () => {
    const rule = declarationsOf(chipCss, '.cck-chip__remove') ?? '';
    for (const line of [
      'position: relative',
      'inline-size: calc(1em + 2 * var(--cck-chip-remove-padding))',
      'block-size: calc(1em + 2 * var(--cck-chip-remove-padding))',
      'border-radius: 50%',
      'font-size: var(--cck-chip-icon-size)',
      'margin-inline-end: calc(var(--cck-chip-remove-end-inset) - var(--cck-chip-padding-inline))',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('gives the remove button a round hit area of 24 by 24 CSS px, centred on the button', () => {
    const area = declarationsOf(chipCss, '.cck-chip__remove::before') ?? '';
    expect(area).toContain('position: absolute');
    expect(area).toContain('inset: calc((100% - var(--cck-chip-remove-hit-size)) / 2)');
    expect(area).toContain('border-radius: 50%');
    expect(structureTokenOf('.cck-chip', 'chip-remove-hit-size')).toBe(ref('size-24'));
    expect(tokensCss).toContain('--cck-size-24: 24px;');
  });

  it('tints the remove button with the ink on hover and press, and a disabled one keeps the resting look', () => {
    for (const [state, mix] of [
      ['hover', 'hover-mix'],
      ['active', 'active-mix'],
    ]) {
      const rule = declarationsOf(chipCss, `.cck-chip__remove:${state}`) ?? '';
      expect(rule).toContain(`color-mix(in srgb, var(--_ink) var(--cck-chip-${mix}), transparent)`);
      expect(rule).toContain('color: var(--_ink)');
    }
    const disabled = declarationsOf(chipCss, '.cck-chip__remove[data-disabled], .cck-chip__remove:disabled') ?? '';
    expect(disabled).toContain('background-color: transparent');
    expect(disabled).toContain('color: var(--_remove)');
    expect(chipCss.indexOf('.cck-chip__remove[data-disabled], .cck-chip__remove:disabled {')).toBeGreaterThan(
      chipCss.indexOf('.cck-chip__remove:active {'),
    );
  });

  it('draws the focus ring on the pill for the toggle and on the remove button for itself', () => {
    const pill = declarationsOf(chipCss, '.cck-chip:has(> .cck-chip__content-wrapper:focus-visible)') ?? '';
    expect(pill).toContain('outline: var(--cck-chip-focus-width) solid var(--cck-chip-focus-color)');
    expect(pill).toContain('outline-offset: var(--cck-chip-focus-offset)');
    expect(declarationsOf(chipCss, '.cck-chip__content-wrapper:focus-visible')).toContain('outline: none');
    const remove = declarationsOf(chipCss, '.cck-chip__remove:focus-visible') ?? '';
    expect(remove).toContain('outline: var(--cck-chip-focus-width) solid var(--_ink)');
    expect(remove).toContain('outline-offset: 0');
  });

  it('takes the icon size per size mode, 14px and 16px at lg', () => {
    expect(sizeTokenOf('.cck-chip', 'sm', 'chip-icon-size')).toBe(ref('size-14'));
    expect(sizeTokenOf('.cck-chip', 'md', 'chip-icon-size')).toBe(ref('size-14'));
    expect(sizeTokenOf('.cck-chip', 'lg', 'chip-icon-size')).toBe(ref('size-16'));
  });

  it.each(MODES)('sizes the chips of a %s list through CSS from the list size tokens', (mode) => {
    const chip = declarationsOf(listCss, '.cck-chip-list > .cck-chip') ?? '';
    for (const line of [
      'block-size: var(--cck-chip-list-chip-height)',
      'gap: var(--cck-chip-list-chip-gap)',
      'padding-inline: var(--cck-chip-list-chip-padding-inline)',
      'font-size: var(--cck-chip-list-chip-font-size)',
      'line-height: var(--cck-chip-list-chip-line-height)',
    ])
      expect(chip).toContain(line);
    expect(declarationsOf(listCss, '.cck-chip-list > .cck-chip > .cck-chip__remove')).toContain(
      'font-size: var(--cck-chip-list-chip-icon-size)',
    );
    const step = chipStep(mode);
    for (const name of [
      'height',
      'padding-inline',
      'remove-end-inset',
      'font-family',
      'font-size',
      'line-height',
      'letter-spacing',
      'icon-size',
      'check-icon-size',
      'check-padding-inline-start',
    ])
      expect(sizeTokenOf('.cck-chip-list', mode, `chip-list-chip-${name}`), name).toBe(
        sizeTokenOf('.cck-chip', step, `chip-${name}`),
      );
    expect(sizeTokenOf('.cck-chip-list', mode, 'chip-list-chip-gap')).toBe(structureTokenOf('.cck-chip', 'chip-gap'));
  });

  it.each([
    '.cck-chip',
    '.cck-chip__content-wrapper',
    '.cck-chip__remove',
    '.cck-chip-list',
    '.cck-chip__check:not([data-state=checked]), .cck-chip__check',
  ])('restates [hidden] on %s, which sets display', (selector) => {
    expect(declarationsOf(stylesCss, `${selector}[hidden]`)).toContain('display: none');
  });
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
      'min-block-size: var(--cck-chip-list-height)',
      'border: var(--cck-chip-list-border-width) solid var(--cck-chip-list-border-color)',
      'background-color: var(--cck-chip-list-bg)',
      'box-shadow: var(--cck-chip-list-shadow)',
      'padding-inline: var(--cck-chip-list-padding-inline)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('caps the radius at half the height of a one-row box, so wrapped chips make no capsule', () => {
    expect(declarationsOf(listCss, '.cck-chip-list')).toContain(
      'border-radius: min(var(--cck-chip-list-radius), var(--cck-chip-list-height) / 2)',
    );
  });

  it.each([
    [':where(:hover)', 'border-color: var(--cck-chip-list-hover-border-color)'],
    [INVALID, 'border-color: var(--cck-chip-list-invalid-border-color)'],
    [':where([data-readonly])', 'background-color: var(--cck-chip-list-readonly-bg)'],
    [DISABLED, 'opacity: var(--cck-chip-list-disabled-opacity)'],
  ])('draws the %s look from its own facts', (state, line) => {
    expect(declarationsOf(listCss, `.cck-chip-list${state}`)).toContain(line);
  });

  it('keeps the states in source order hover, invalid, read-only, disabled, and disabled resets the border', () => {
    const at = (state: string): number => listCss.indexOf(`.cck-chip-list${state} {`);
    const order = [':where(:hover)', INVALID, ':where([data-readonly])', DISABLED].map(at);
    expect(order.every((index) => index > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(declarationsOf(listCss, `.cck-chip-list${DISABLED}`)).toContain(
      'border-color: var(--cck-chip-list-border-color)',
    );
  });

  it('shows the focus of the text box as the focus border and a halo on the box, no outline', () => {
    const rule = declarationsOf(listCss, `.cck-chip-list${FOCUS}`) ?? '';
    expect(rule).toContain('border-color: var(--_focus)');
    expect(rule).toContain(
      'box-shadow: 0 0 0 var(--cck-chip-list-focus-ring-width) color-mix(in srgb, var(--_focus) var(--cck-chip-list-focus-ring-mix), transparent)',
    );
    expect(rule).not.toContain('outline');
    expect(declarationsOf(listCss, '.cck-chip-list')).toContain('--_focus: var(--cck-chip-list-focus-color)');
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

  it('leaves the chips of a faded list unfaded, so the list fades once', () => {
    const rule = declarationsOf(listCss, '.cck-chip-list > .cck-chip[data-disabled]') ?? '';
    expect(rule).toContain('opacity: 1');
    expect(rule).toContain('cursor: inherit');
  });

  it('sets the chip size from the list in one rule, not per size mode (C14)', () => {
    expect(listCss).not.toContain('.cck-chip-list[data-size] > .cck-chip');
    expect(stylesCss).not.toMatch(/\.cck-chip-list\[data-size[^{]*>\s*\.cck-chip\s*\{/);
  });

  it('reaches its chips with child combinators only, never across blocks with a descendant combinator', () => {
    for (const selector of selectorsOf(listCss)) {
      const flat = selector.replace(/\([^()]*(?:\([^()]*(?:\([^()]*\)[^()]*)*\)[^()]*)*\)/g, '()');
      for (const part of flat.split(',')) {
        const tokens = part.trim().split(/\s+/);
        tokens.forEach((token, index) => {
          if (index % 2 === 1) expect(token, selector).toMatch(/^[>~+]$/);
        });
      }
    }
    expect(listCss).toContain('.cck-chip-list > .cck-chip {');
    expect(listCss).toContain('.cck-chip-list > .cck-chip > .cck-chip__check {');
    expect(listCss).toContain('.cck-chip-list > .cck-chip > .cck-chip__remove {');
  });
});

describe('chip list in a form field', () => {
  it('lets the input wrapper draw the box of a list, and leaves the list without a box', () => {
    expect(declarationsOf(fieldCss, BOX)).toContain('border: var(--cck-form-field-border-width) solid');
    const rule = declarationsOf(listCss, IN_FIELD) ?? '';
    for (const line of [
      'flex: 1',
      'min-block-size: 0',
      'padding-inline: 0',
      'border: 0',
      'border-radius: 0',
      'background-color: transparent',
      'box-shadow: none',
      'opacity: 1',
    ]) {
      expect(rule).toContain(line);
    }
    expect(declarationsOf(listCss, `${IN_FIELD}${FOCUS}`)).toContain('box-shadow: none');
    expect(declarationsOf(forced(listCss, LIST_FORCED), `${IN_FIELD}${FOCUS}`)).toContain('outline: none');
  });

  it('caps the radius of a field box that holds a list at half the field height', () => {
    expect(
      declarationsOf(
        fieldCss,
        '.cck-form-field__wrapper:has(> .cck-form-field__input-wrapper > :is(.cck-textarea, .cck-chip-list))',
      ),
    ).toContain('--_radius: min(var(--cck-form-field-radius), calc(var(--cck-form-field-height) / 2))');
  });

  it('does not set the chip height or the text of the list from the field (C15, F25)', () => {
    expect(fieldCss).not.toContain('--cck-chip-list-');
    expect(fieldCss).not.toMatch(/\.cck-form-field__input-wrapper > \.cck-chip-list(\s*>\s*\.cck-chip)?\s*\{/);
    expect(declarationsOf(listCss, IN_FIELD)).not.toMatch(/font|letter-spacing/);
  });

  it('centres one row of chips in the box from the height of the box and of a chip', () => {
    expect(declarationsOf(listCss, '.cck-chip-list')).toContain(
      'padding-block: calc((var(--cck-chip-list-height) - var(--cck-chip-list-chip-height)) / 2 - var(--cck-chip-list-border-width))',
    );
    expect(declarationsOf(listCss, IN_FIELD)).not.toContain('padding-block');
  });

  // The list keeps its block padding in a field, where the field border takes the place of its own.
  it.each(MODES)('keeps one row of the %s list inside the field box in every density mode', (mode) => {
    const height = sizeTokenOf('.cck-chip-list', mode, 'chip-list-height');
    expect(sizeTokenOf('.cck-form-field', mode, 'form-field-height')).toBe(height);
    const chip = sizeTokenOf('.cck-chip-list', mode, 'chip-list-chip-height');
    const name = (alias: string | undefined): string => (alias ?? '').replace(/^var\(--cck-|\)$/g, '');
    for (const density of ['normal', 'compact', 'comfortable'] as const) {
      const inset = (px(name(height), density) - px(name(chip), density)) / 2 - 1;
      expect(inset, `${mode} ${density}`).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('chip forced colors and selectors', () => {
  it('keeps the chip border, greys the disabled chip and keeps both focus rings visible', () => {
    expect(declarationsOf(forced(chipCss), '.cck-chip')).toContain('border-color: CanvasText');
    const disabled = declarationsOf(forced(chipCss), '.cck-chip[data-disabled]') ?? '';
    expect(disabled).toContain('GrayText');
    expect(disabled).toContain('opacity: 1');
    for (const selector of [
      '.cck-chip:has(> .cck-chip__content-wrapper:focus-visible)',
      '.cck-chip__remove:focus-visible',
    ])
      expect(declarationsInList(forced(chipCss), selector), selector).toContain('outline-color: Highlight');
  });

  it('keeps the list border and greys the disabled one; an invalid list only changes the colour', () => {
    const css = forced(listCss, LIST_FORCED);
    expect(declarationsOf(css, '.cck-chip-list')).toContain('border-color: CanvasText');
    expect(css).not.toContain('invalid');
    expect(declarationsOf(css, '.cck-chip-list:where([data-readonly])')).toContain('border-style: dashed');
    expect(declarationsOf(css, `.cck-chip-list${DISABLED}`)).toContain('GrayText');
    expect(declarationsOf(css, `.cck-chip-list${FOCUS}`)).toContain(
      'outline: var(--cck-chip-list-focus-ring-width) solid Highlight',
    );
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
    ['sm', 'spacing-3', 'spacing-2', 'text-xs'],
    ['md', 'spacing-4', 'spacing-3', 'text-xs'],
    ['lg', 'spacing-5', 'spacing-3', 'text-sm'],
  ])('size %s: padding %s, remove inset %s and %s text', (mode, padding, inset, text) => {
    expect(size(mode, 'padding-inline')).toBe(ref(padding));
    expect(size(mode, 'remove-end-inset')).toBe(ref(inset));
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(size(mode, part), part).toBe(ref(`${text}-${part}`));
  });

  it.each([
    ['radius', 'radius-full'],
    ['gap', 'spacing-3'],
    ['border-width', 'border-width-1'],
    ['bg', 'surface-2'],
    ['text-color', 'text-1'],
    ['font-weight', 'font-weight-medium'],
    ['selected-bg', 'brand-color'],
    ['selected-text-color', 'brand-on-color'],
    ['remove-padding', 'spacing-2'],
    ['remove-hit-size', 'size-24'],
    ['remove-color', 'text-3'],
    ['hover-mix', 'opacity-10'],
    ['active-mix', 'opacity-20'],
    ['focus-color', 'focus-2'],
    ['focus-width', 'border-width-2'],
    ['focus-offset', 'spacing-2'],
    ['disabled-opacity', 'opacity-50'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it('keeps padding, remove inset and the font tokens in the size collection and the gap in the structure', () => {
    for (const name of ['padding-inline', 'remove-end-inset', 'font-family', 'font-size']) {
      expect(own(name), name).toBeUndefined();
    }
    for (const mode of MODES) expect(size(mode, 'gap'), mode).toBeUndefined();
  });

  it('has no colour token per state: no border, disabled or hover colour', () => {
    for (const name of ['border-color', 'selected-border-color', 'disabled-bg', 'disabled-border-color'])
      expect(tokensCss, name).not.toContain(`--cck-chip-${name}:`);
    expect(tokensCss).not.toMatch(/--cck-chip-[\w-]*(hover-bg|disabled-text-color)/);
  });

  it('fills the chip from --_fill, which starts as the chip fill and the selected fill', () => {
    expect(declarationsOf(chipCss, '.cck-chip')).toContain('background-color: var(--_fill)');
    expect(declarationsOf(chipCss, '.cck-chip')).toContain('--_fill: var(--cck-chip-bg)');
    expect(declarationsOf(chipCss, '.cck-chip:where(:has(> .cck-chip__content-wrapper[data-selected]))')).toContain(
      '--_fill: var(--cck-chip-selected-bg)',
    );
  });

  it.each([
    ['sm', 'spacing-3'],
    ['md', 'spacing-3'],
    ['lg', 'spacing-4'],
  ])('keeps the chip list gap in its size collection: %s is %s', (mode, gap) => {
    expect(sizeTokenOf('.cck-chip-list', mode, 'chip-list-gap')).toBe(ref(gap));
    expect(structureTokenOf('.cck-chip-list', 'chip-list-gap')).toBeUndefined();
  });

  it.each([
    ['sm', 'control-sm'],
    ['md', 'control-md'],
    ['lg', 'control-lg'],
  ])('gives the %s chip list the height %s, as the Input', (mode, height) => {
    expect(sizeTokenOf('.cck-chip-list', mode, 'chip-list-height')).toBe(ref(height));
    expect(sizeTokenOf('.cck-chip-list', mode, 'chip-list-height')).toBe(
      sizeTokenOf('.cck-input', mode, 'input-height'),
    );
  });
});
