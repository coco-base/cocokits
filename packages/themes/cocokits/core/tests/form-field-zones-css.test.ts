import { describe, expect, it } from 'vitest';
import { declarationsInList, declarationsOf, read, sizeTokenOf, tokensCss } from './css-test-helpers';

const stylesCss = ['form-field', 'label', 'hint', 'input', 'textarea', 'field-error']
  .map((name) => read('dist', 'components', `${name}.css`))
  .join('\n');
const scss = read('src', 'styles', 'components', '_form-field.scss');

const INSIDE = ['.cck-form-field__input-wrapper > .cck-prefix', '.cck-form-field__input-wrapper > .cck-suffix'];
const OUTSIDE = ['.cck-form-field__wrapper > .cck-leading', '.cck-form-field__wrapper > .cck-trailing'];
const list = (selectors: string[]): string => selectors.join(',\n  ');
const WRAPPER = '> .cck-form-field__wrapper > .cck-form-field__input-wrapper';
const BOX = '.cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea, > .cck-chip-list)';
/** The field root when it renders data-disabled or its control is natively disabled. */
const DISABLED = `.cck-form-field:where([data-disabled], :has(${WRAPPER} > :is(.cck-input, .cck-textarea):disabled, ${WRAPPER} > .cck-chip-list > .cck-chip-list__input:disabled, ${WRAPPER} > .cck-select > .cck-select__trigger:disabled))`;
const AFFIX = `${DISABLED} ${WRAPPER} > :is(.cck-prefix, .cck-suffix)`;

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

  it('keeps Leading and Trailing outside the box, as high as it', () => {
    const rule = declarationsOf(stylesCss, list(OUTSIDE)) ?? '';
    for (const line of [
      'display: flex',
      'flex: none',
      'align-self: stretch',
      'min-block-size: var(--cck-form-field-height)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('puts the zone gap on the input wrapper only: Leading and Trailing are attached to the box', () => {
    expect(declarationsOf(stylesCss, '.cck-form-field__input-wrapper')).toContain(
      'gap: var(--cck-form-field-zone-gap)',
    );
    expect(declarationsOf(stylesCss, '.cck-form-field__wrapper')).not.toContain('gap');
  });

  it('restates the native hidden on every zone, because the zones set display', () => {
    for (const selectors of [INSIDE, OUTSIDE]) {
      expect(declarationsOf(stylesCss, list(selectors.map((selector) => `${selector}[hidden]`)))).toContain(
        'display: none',
      );
    }
  });

  it('fades the affix text of a disabled field with the box it sits in, with no colour of its own', () => {
    expect(declarationsInList(stylesCss, `${DISABLED} > .cck-form-field__wrapper > ${BOX}`)).toContain(
      'opacity: var(--cck-form-field-disabled-opacity)',
    );
    const normal = stylesCss.split('@media (forced-colors: active)')[0] ?? '';
    expect(declarationsInList(normal, AFFIX)).toBeUndefined();
    expect(tokensCss).not.toContain('--cck-form-field-affix-disabled-text-color');
  });

  it('makes the affix text GrayText in forced colors when the field is disabled', () => {
    const forced = stylesCss.split('@media (forced-colors: active)')[1] ?? '';
    const rule = declarationsInList(forced, AFFIX) ?? '';
    expect(rule).toContain('color: GrayText');
    expect(rule).toContain('opacity: 1');
  });

  it('uses no physical property for the zones', () => {
    expect(scss).not.toMatch(/(^|[\s{;])(margin-left|margin-right|padding-left|padding-right|left|right)\s*:/);
  });
});

describe('a Button, an IconButton or a Select in a Leading or Trailing is the zone', () => {
  const ATTACHED = ':is(.cck-button, .cck-icon-button, .cck-select)';
  const ZONE = `.cck-form-field__wrapper > :is(.cck-leading, .cck-trailing):has(> ${ATTACHED})`;
  const side = (zone: 'leading' | 'trailing'): string => `.cck-form-field__wrapper > .cck-${zone}:has(> ${ATTACHED})`;
  const corners = (zone: 'leading' | 'trailing'): string =>
    `${side(zone)} > :is(.cck-button, .cck-icon-button),\n  ${side(zone)} > .cck-select > .cck-select__trigger`;

  it('drops the border of the zone, and the control is as high as the field box', () => {
    const zone = declarationsOf(stylesCss, ZONE) ?? '';
    for (const line of ['padding-inline: 0', 'border: 0', 'box-shadow: none']) {
      expect(zone).toContain(line);
    }
    expect(zone).not.toContain('background-color');
    expect(declarationsOf(stylesCss, `${ZONE} > .cck-button`)).toContain('align-self: stretch');
    // The size token of an IconButton sets its height; the stretched zone is a definite height to reach.
    expect(declarationsOf(stylesCss, `${ZONE} > .cck-icon-button`)).toContain('min-block-size: 100%');
  });

  it('drops the fill of a zone that holds a Button or an IconButton, which draw their own', () => {
    const selector =
      '.cck-form-field__wrapper > :is(.cck-leading, .cck-trailing):has(> :is(.cck-button, .cck-icon-button))';
    expect(declarationsOf(stylesCss, selector)).toContain('background-color: transparent');
  });

  it('makes a Select as wide as its value, its trigger clear over the fill of the zone', () => {
    const select = declarationsOf(stylesCss, `${ZONE} > .cck-select`) ?? '';
    expect(select).toContain('flex: 0 0 content');
    expect(select).toContain('min-inline-size: 0');
    // The zone is as wide as the Select in it: the fixed width of a standalone Select would widen the zone.
    expect(select).toContain('inline-size: auto');
    expect(declarationsOf(stylesCss, `${ZONE} > .cck-select > .cck-select__trigger`)).toContain(
      'background-color: transparent',
    );
    expect(scss).not.toContain('--cck-select-');
  });

  it('fades a zone with a Select as a whole when the field is disabled, and the trigger does not fade again', () => {
    const trigger = `${DISABLED} > .cck-form-field__wrapper > :is(.cck-leading, .cck-trailing) > .cck-select > .cck-select__trigger`;
    expect(declarationsInList(stylesCss, trigger)).toContain('opacity: 1');
    const faded = `${DISABLED} > .cck-form-field__wrapper > :is(.cck-leading, .cck-trailing):not(:has(> :is(.cck-button, .cck-icon-button)))`;
    expect(declarationsInList(stylesCss, faded)).toContain('opacity: var(--cck-form-field-disabled-opacity)');
  });

  it('keeps the zone of an open Select above the box, as the focus does', () => {
    const open = declarationsOf(
      stylesCss,
      '.cck-form-field__wrapper > :is(.cck-leading, .cck-trailing):has(> .cck-select[data-state=open])',
    );
    expect(open).toContain('position: relative');
    expect(open).toContain('z-index: 1');
  });

  it('attaches the control over the box border, square on the side that touches the box, in logical terms', () => {
    expect(declarationsOf(stylesCss, side('leading'))).toContain(
      'margin-inline-end: calc(-1 * var(--cck-form-field-border-width))',
    );
    expect(declarationsOf(stylesCss, side('trailing'))).toContain(
      'margin-inline-start: calc(-1 * var(--cck-form-field-border-width))',
    );
    const leading = declarationsOf(stylesCss, corners('leading')) ?? '';
    expect(leading).toContain('border-start-start-radius: var(--_radius)');
    expect(leading).toContain('border-end-start-radius: var(--_radius)');
    expect(leading).toContain('border-start-end-radius: 0');
    expect(leading).toContain('border-end-end-radius: 0');
    const trailing = declarationsOf(stylesCss, corners('trailing')) ?? '';
    expect(trailing).toContain('border-start-start-radius: 0');
    expect(trailing).toContain('border-end-start-radius: 0');
    expect(trailing).toContain('border-start-end-radius: var(--_radius)');
    expect(trailing).toContain('border-end-end-radius: var(--_radius)');
  });
});

describe('the box of a Textarea', () => {
  it('aligns the items of the box to the start, so it grows with the textarea', () => {
    expect(declarationsOf(stylesCss, '.cck-form-field__input-wrapper:has(> .cck-textarea)')).toContain(
      'align-items: flex-start',
    );
  });

  it('keeps the padding-block of the textarea in the box, and its bounds leave out the border (F24)', () => {
    const selector = '.cck-form-field__input-wrapper > .cck-textarea';
    const rule = declarationsOf(stylesCss, selector) ?? '';
    expect(rule).not.toMatch(/padding-block|min-block-size|max-block-size|font|letter-spacing/);
    // In a field the bounds leave out the border term, because the wrapper draws the border.
    const bounds = declarationsOf(stylesCss, `${selector}[data-auto-resize]`) ?? '';
    expect(bounds).toContain(
      'min-block-size: max(var(--cck-textarea-min-height) - 2 * var(--cck-textarea-border-width), var(--cck-textarea-min-rows, 2) * 1lh + 2 * var(--cck-textarea-padding-block))',
    );
    expect(bounds).toContain(
      'max-block-size: calc(var(--cck-textarea-max-rows, 5) * 1lh + 2 * var(--cck-textarea-padding-block))',
    );
    expect(declarationsOf(stylesCss, `${selector}:not([data-auto-resize])`)).toContain(
      'min-block-size: calc(var(--cck-textarea-min-height) - 2 * var(--cck-textarea-border-width))',
    );
    const standalone = declarationsOf(stylesCss, '.cck-textarea[data-auto-resize]') ?? '';
    expect(standalone).toContain('var(--cck-textarea-min-rows, 2)');
    expect(standalone).toContain('var(--cck-textarea-max-rows, 5)');
    expect(standalone).toContain('2 * var(--cck-textarea-padding-block)');
    expect(stylesCss).not.toMatch(/\.cck-form-field[^{]*\{[^}]*--cck-form-field-padding-block/);
  });

  it('lets the last Textarea hold the end padding of the box, so its handle sits in the corner', () => {
    expect(declarationsOf(stylesCss, `${BOX}:has(> .cck-textarea:last-child)`)).toContain('padding-inline-end: 0');
    expect(declarationsOf(stylesCss, '.cck-form-field__input-wrapper > .cck-textarea:last-child')).toContain(
      'padding-inline-end: var(--cck-textarea-padding-inline)',
    );
  });

  it('has no padding-block token in the Form Field / Size modes: the Textarea keeps its own', () => {
    for (const mode of ['sm', 'md', 'lg']) {
      expect(sizeTokenOf('.cck-form-field', mode, 'form-field-padding-block')).toBeUndefined();
    }
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
    expect(declarationsOf(stylesCss, selector)).toContain('padding-block-start: var(--cck-form-field-feedback-gap)');
    expect(stylesCss).not.toMatch(/\.cck-field-error[^{]*\{[^}]*margin/);
  });

  it('puts no gap on the feedback wrapper, and sets it feedback-gap under the box', () => {
    const rule = declarationsOf(stylesCss, '.cck-form-field__feedback-wrapper') ?? '';
    expect(rule).not.toMatch(/(^|[\s;])(row-)?gap:/);
    expect(rule).toContain('margin-block-start: calc(var(--cck-form-field-feedback-gap) - var(--cck-form-field-gap))');
  });
});
