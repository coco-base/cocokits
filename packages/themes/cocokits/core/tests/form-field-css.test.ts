import { describe, expect, it } from 'vitest';
import { declarationsInList, declarationsOf, read, tokensCss } from './css-test-helpers';

const stylesCss = ['form-field', 'label', 'hint', 'input', 'textarea', 'field-error']
  .map((name) => read('dist', 'components', `${name}.css`))
  .join('\n');
/** The input wrapper that holds a text control: the box. */
const BOX = '.cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea, > .cck-chip-list)';
/** The chain from the field root to the box. */
const WRAPPER = '> .cck-form-field__wrapper > .cck-form-field__input-wrapper';
/** The box while its text control has the focus. */
const FOCUSED = `${BOX}:has(> :is(.cck-input, .cck-textarea):focus-visible, > .cck-chip-list > .cck-chip-list__input:focus-visible)`;
/** The field root when it renders data-disabled or its control is natively disabled. */
const DISABLED = `.cck-form-field:where([data-disabled], :has(${WRAPPER} > :is(.cck-input, .cck-textarea):disabled, ${WRAPPER} > .cck-chip-list > .cck-chip-list__input:disabled, ${WRAPPER} > .cck-select > .cck-select__trigger:disabled))`;
const INVALID = `.cck-form-field:where([data-invalid]):where([data-touched], [data-submitted]) > .cck-form-field__wrapper > ${BOX}`;
const READONLY = `.cck-form-field:where([data-readonly]) > .cck-form-field__wrapper > ${BOX}`;
const forced = (css: string): string => css.split('@media (forced-colors: active)')[1] ?? '';

/** Splits a selector list at the commas outside parentheses. */
function splitList(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of list) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  return [...parts, current.trim()];
}

/** The selector with every parenthesised argument, at any depth, replaced by `()`. */
function flatten(selector: string): string {
  let depth = 0;
  let out = '';
  for (const char of selector) {
    if (char === '(') {
      if (depth === 0) out += '()';
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
    } else if (depth === 0) {
      out += char;
    }
  }
  return out;
}
const scss = ['_form-field.scss', '_label.scss', '_hint.scss', '_input.scss', '_textarea.scss', '_field-error.scss']
  .map((file) => read('src', 'styles', 'components', file))
  .join('\n');

describe('form-field, label and hint output', () => {
  it.each([
    ['form-field', '.cck-form-field'],
    ['label', '.cck-label'],
    ['hint', '.cck-hint'],
  ])('puts the rules of dist/components/%s.css inside @layer cocokits', (name, selector) => {
    const css = read('dist', 'components', `${name}.css`);
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(css).toContain(selector);
  });

  it('emits the component tokens on the component class and never on :root', () => {
    for (const selector of ['.cck-form-field {', '.cck-label {', '.cck-hint {']) {
      expect(tokensCss).toContain(selector);
    }
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toMatch(/--cck-(form-field|label|hint)-/);
  });

  it('aliases the gaps and the indent to Theme Spacing and the colors to Theme Color', () => {
    expect(tokensCss).toMatch(/--cck-form-field-gap: var\(--cck-spacing-4\)/);
    expect(tokensCss).toMatch(/--cck-form-field-balance-indent: var\(--cck-spacing-0\)/);
    expect(tokensCss).toMatch(/--cck-form-field-feedback-gap: var\(--cck-spacing-3\)/);
    expect(tokensCss).toMatch(/--cck-form-field-zone-gap: var\(--cck-spacing-4\)/);
    expect(tokensCss).toMatch(/--cck-form-field-min-inline-size: var\(--cck-size-96\)/);
    expect(tokensCss).toMatch(/--cck-hint-gap: var\(--cck-spacing-3\)/);
    expect(tokensCss).toMatch(/--cck-label-text-color: var\(--cck-text-1\)/);
    expect(tokensCss).toMatch(/--cck-hint-text-color: var\(--cck-text-3\)/);
    expect(tokensCss).toMatch(/--cck-label-font-weight: var\(--cck-font-weight-medium\)/);
    expect(tokensCss).toMatch(/--cck-hint-font-weight: var\(--cck-font-weight-regular\)/);
  });
});

describe('form-field layout', () => {
  it('stacks the zones in a column with the gap and the minimum inline size', () => {
    const rule = declarationsOf(stylesCss, '.cck-form-field') ?? '';
    for (const line of [
      'display: flex',
      'flex-direction: column',
      'align-items: flex-start',
      'gap: var(--cck-form-field-gap)',
      'min-inline-size: var(--cck-form-field-min-inline-size)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('gives the control zone layout only, with no box look', () => {
    expect(declarationsOf(stylesCss, '.cck-form-field__wrapper')).toContain('inline-size: 100%');
    const inputWrapper = declarationsOf(stylesCss, '.cck-form-field__input-wrapper') ?? '';
    for (const line of ['display: flex', 'flex: 1', 'min-inline-size: 0', 'align-items: center']) {
      expect(inputWrapper).toContain(line);
    }
    for (const part of ['wrapper', 'input-wrapper']) {
      // The private --_radius of the wrapper is the corner the box reads; it draws nothing on the wrapper.
      const rule = (declarationsOf(stylesCss, `.cck-form-field__${part}`) ?? '').replace(/--_[a-z-]+:[^;]*;/g, '');
      expect(rule).not.toMatch(/border(?!-box)|radius|background|block-size|height|padding/);
    }
  });

  it('indents the label with padding from the field, never with a margin on a root', () => {
    expect(declarationsOf(stylesCss, '.cck-form-field > .cck-label')).toContain(
      'padding-inline-start: var(--cck-form-field-balance-indent)',
    );
    for (const selector of ['.cck-form-field', '.cck-label', '.cck-hint']) {
      expect(declarationsOf(stylesCss, selector)).not.toMatch(/margin|padding/);
    }
  });

  it('indents the feedback wrapper with a logical margin and hides it when empty', () => {
    expect(declarationsOf(stylesCss, '.cck-form-field__feedback-wrapper')).toContain(
      'margin-inline-start: var(--cck-form-field-balance-indent)',
    );
    expect(
      declarationsOf(stylesCss, '.cck-form-field__feedback-wrapper:empty, .cck-form-field__feedback-wrapper[hidden]'),
    ).toContain('display: none');
  });
});

describe('label and hint', () => {
  it('sets the label color and medium text, and the hint color, gap and regular text', () => {
    const label = declarationsOf(stylesCss, '.cck-label') ?? '';
    expect(label).toContain('display: flex');
    expect(label).toContain('color: var(--cck-label-text-color)');
    expect(label).toContain('font-weight: var(--cck-label-font-weight)');
    const hint = declarationsOf(stylesCss, '.cck-hint') ?? '';
    expect(hint).toContain('display: flex');
    expect(hint).toContain('gap: var(--cck-hint-gap)');
    expect(hint).toContain('color: var(--cck-hint-text-color)');
    expect(hint).toContain('font-weight: var(--cck-hint-font-weight)');
  });

  it.each(['.cck-form-field', '.cck-form-field__wrapper', '.cck-form-field__input-wrapper', '.cck-label', '.cck-hint'])(
    'restates the native hidden on %s',
    (selector) => {
      expect(declarationsOf(stylesCss, `${selector}[hidden]`)).toContain('display: none');
    },
  );
});

describe('form-field, label and hint selectors and units', () => {
  const own = [...stylesCss.matchAll(/(?:^|\})\s*([^{}@]+)\{/g)]
    .map((match) => match[1].trim())
    .filter((selector) =>
      /cck-(form-field|label|hint|input|textarea|field-error|prefix|suffix|leading|trailing)/.test(selector),
    );

  it('starts every selector with a CocoKits class, so no attribute or tag selector is bare', () => {
    expect(own.length).toBeGreaterThan(0);
    for (const selector of own) {
      for (const part of splitList(selector)) {
        expect(part.trim(), selector).toMatch(/^\.cck-/);
      }
    }
  });

  it('joins the blocks with child or sibling combinators only, never a descendant selector', () => {
    for (const selector of own) {
      for (const part of splitList(selector).map(flatten)) {
        const tokens = part.trim().split(/\s+/);
        tokens.forEach((token, index) => {
          if (index % 2 === 1) expect(token, selector).toMatch(/^[>~+]$/);
        });
      }
    }
  });

  it('uses no physical margin, padding, size or position property', () => {
    expect(scss).not.toMatch(
      /(^|[\s{;])(left|right|top|bottom|width|min-width|height|margin-left|margin-right|padding-left|padding-right)\s*:/,
    );
  });

  it('gives the box of the input wrapper a forced-colors border, and the label marker none', () => {
    const sheet = forced(read('dist', 'components', 'form-field.css'));
    expect(declarationsOf(sheet, BOX)).toContain('border-color: CanvasText');
    expect(declarationsOf(sheet, `${DISABLED} > .cck-form-field__wrapper > ${BOX}`)).toContain(
      'border-color: GrayText',
    );
    const focus = declarationsOf(sheet, FOCUSED) ?? '';
    expect(focus).toContain('border-color: Highlight');
    expect(focus).toContain('outline: var(--cck-form-field-focus-ring-width) solid Highlight');
    expect(forced(stylesCss)).not.toContain('invalid-border-width');
    expect(read('src', 'styles', 'components', '_label.scss')).not.toContain('forced-colors');
  });
});

describe('the box of the input wrapper', () => {
  const sheet = read('dist', 'components', 'form-field.css');

  it('draws the box on a wrapper that holds an Input and sizes it from the inherited size tokens', () => {
    const box = declarationsOf(stylesCss, BOX) ?? '';
    for (const line of [
      'border: var(--cck-form-field-border-width) solid var(--cck-form-field-border-color)',
      'border-radius: var(--_radius)',
      'background-color: var(--cck-form-field-bg)',
      'box-shadow: var(--cck-form-field-shadow)',
    ]) {
      expect(box).toContain(line);
    }
    for (const line of [
      'min-block-size: var(--cck-form-field-height)',
      'padding-inline: var(--cck-form-field-padding-inline)',
      'font-family: var(--cck-form-field-font-family)',
      'font-size: var(--cck-form-field-font-size)',
      'line-height: var(--cck-form-field-line-height)',
      'letter-spacing: var(--cck-form-field-letter-spacing)',
    ]) {
      expect(box).toContain(line);
    }
    expect(declarationsOf(stylesCss, '.cck-form-field__wrapper')).toContain('--_radius: var(--cck-form-field-radius)');
    // The size does not hang on the data-size of the wrapper, so a null size still gets the md box.
    expect(stylesCss).not.toContain('input-wrapper[data-size]');
  });

  it('caps the radius of a Textarea or Chip list box at half the height of a one-line box', () => {
    expect(
      declarationsOf(
        stylesCss,
        '.cck-form-field__wrapper:has(> .cck-form-field__input-wrapper > :is(.cck-textarea, .cck-chip-list))',
      ),
    ).toContain('--_radius: min(var(--cck-form-field-radius), calc(var(--cck-form-field-height) / 2))');
  });

  it('shows the invalid border only when invalid and (touched or submitted)', () => {
    expect(declarationsOf(stylesCss, INVALID)).toContain('border-color: var(--cck-form-field-invalid-border-color)');
    expect(scss).not.toMatch(/(^|\n)\s*\[data-/);
  });

  it('shows invalid by the border colour and focus colour only, and read-only by a fill', () => {
    const invalid = declarationsOf(stylesCss, INVALID) ?? '';
    expect(invalid).toContain('--_focus: var(--cck-form-field-invalid-border-color)');
    expect(invalid).not.toMatch(/box-shadow|outline|border-width|border-style/);
    const readonly = declarationsOf(stylesCss, READONLY) ?? '';
    expect(readonly).toContain('background-color: var(--cck-form-field-readonly-bg)');
    expect(readonly).not.toContain('border-style');
    expect(declarationsOf(forced(sheet), READONLY)).toContain('border-style: dashed');
  });

  it('lets disabled win over hover, invalid and read-only: the resting border, faded, solid in forced colors', () => {
    const selector = `${DISABLED} > .cck-form-field__wrapper > ${BOX}`;
    const disabled = declarationsOf(stylesCss, selector) ?? '';
    expect(disabled).toContain('border-color: var(--cck-form-field-border-color)');
    expect(disabled).toContain('opacity: var(--cck-form-field-disabled-opacity)');
    expect(disabled).toContain('cursor: not-allowed');
    for (const earlier of [`${BOX}:where(:hover)`, INVALID, READONLY]) {
      expect(sheet.indexOf(`${selector} {`)).toBeGreaterThan(sheet.indexOf(`${earlier} {`));
    }
    const forcedDisabled = declarationsOf(forced(sheet), selector) ?? '';
    expect(forcedDisabled).toContain('border-style: solid');
    expect(forcedDisabled).toContain('opacity: 1');
  });

  it('keeps the thin border in forced colors, GrayText when disabled', () => {
    expect(forced(stylesCss)).not.toContain('invalid-border-width');
    expect(forced(stylesCss)).toContain('border-color: GrayText');
  });

  it('fades the Label, the Hint and a zone without a Button from the facts of the root', () => {
    const rule = declarationsInList(sheet, `${DISABLED} > .cck-label`) ?? '';
    expect(rule).toContain('opacity: var(--cck-form-field-disabled-opacity)');
    for (const part of [
      `${DISABLED} > .cck-form-field__feedback-wrapper > .cck-hint`,
      `${DISABLED} > .cck-form-field__wrapper > :is(.cck-leading, .cck-trailing):not(:has(> .cck-button))`,
    ]) {
      expect(declarationsInList(sheet, part)).toBe(rule);
    }
    expect(sheet).not.toMatch(/\.cck-field-error[^{]*\{[^}]*opacity/);
  });

  it('shows the focus border and halo on the wrapper while its text control has the focus', () => {
    const focus = declarationsOf(stylesCss, FOCUSED) ?? '';
    expect(focus).toContain('border-color: var(--_focus)');
    expect(focus).toContain(
      'box-shadow: 0 0 0 var(--cck-form-field-focus-ring-width) color-mix(in srgb, var(--_focus) var(--cck-form-field-focus-ring-mix), transparent)',
    );
    expect(focus).toContain('z-index: 1');
    expect(declarationsOf(stylesCss, BOX)).toContain('--_focus: var(--cck-form-field-focus-color)');
    expect(sheet).not.toContain(`${BOX}:focus-within`);
    expect(sheet.split('@media (forced-colors: active)')[0]).not.toMatch(/(^|[\s;])outline:/);
  });

  it('takes the sizes from the Form Field / Size modes', () => {
    for (const mode of ['sm', 'md', 'lg'] as const) {
      expect(tokensCss).toMatch(
        new RegExp(
          `\\.cck-form-field\\[data-size=${mode}\\][^{]*\\{[^}]*--cck-form-field-height: var\\(--cck-control-${mode}\\)`,
        ),
      );
    }
  });
});

describe('the required marker', () => {
  it('has a colour and a logical gap from its tokens', () => {
    const marker = declarationsOf(stylesCss, '.cck-label__required-marker') ?? '';
    expect(marker).toContain('color: var(--cck-label-required-marker-color)');
    expect(marker).toContain('margin-inline-start: var(--cck-label-required-marker-gap)');
  });
});
