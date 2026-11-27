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
/** A control in a Leading or Trailing that draws its own state, so the zone does not fade with the field. */
const OWN_STATE = ':is(.cck-button, .cck-icon-button)';
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
    expect(declarationsInList(sheet, `${DISABLED} > .cck-form-field__wrapper > ${BOX}`)).toContain(
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
    expect(declarationsInList(stylesCss, INVALID)).toContain(
      'border-color: var(--cck-form-field-invalid-border-color)',
    );
    expect(scss).not.toMatch(/(^|\n)\s*\[data-/);
  });

  it('shows invalid by the border colour and focus colour only, and read-only by a fill', () => {
    const invalid = declarationsInList(stylesCss, INVALID) ?? '';
    expect(invalid).toContain('--_focus: var(--cck-form-field-invalid-border-color)');
    expect(invalid).not.toMatch(/box-shadow|outline|border-width|border-style/);
    const readonly = declarationsInList(stylesCss, READONLY) ?? '';
    expect(readonly).toContain('background-color: var(--cck-form-field-readonly-bg)');
    expect(readonly).not.toContain('border-style');
    expect(declarationsInList(forced(sheet), READONLY)).toContain('border-style: dashed');
  });

  it('lets disabled win over hover, invalid and read-only: the resting border, faded, solid in forced colors', () => {
    const selector = `${DISABLED} > .cck-form-field__wrapper > ${BOX}`;
    const disabled = declarationsInList(stylesCss, selector) ?? '';
    expect(disabled).toContain('border-color: var(--cck-form-field-border-color)');
    expect(disabled).toContain('opacity: var(--cck-form-field-disabled-opacity)');
    expect(disabled).toContain('cursor: not-allowed');
    for (const earlier of [`${BOX}:where(:hover)`, INVALID, READONLY]) {
      expect(sheet.indexOf(selector)).toBeGreaterThan(sheet.indexOf(earlier));
    }
    const forcedDisabled = declarationsInList(forced(sheet), selector) ?? '';
    expect(forcedDisabled).toContain('border-style: solid');
    expect(forcedDisabled).toContain('opacity: 1');
  });

  it('keeps the thin border in forced colors, GrayText when disabled', () => {
    expect(forced(stylesCss)).not.toContain('invalid-border-width');
    expect(forced(stylesCss)).toContain('border-color: GrayText');
  });

  it('fades the Label, the Hint and a zone without a Button or an IconButton from the facts of the root', () => {
    const rule = declarationsInList(sheet, `${DISABLED} > .cck-label`) ?? '';
    expect(rule).toContain('opacity: var(--cck-form-field-disabled-opacity)');
    for (const part of [
      `${DISABLED} > .cck-form-field__feedback-wrapper > .cck-hint`,
      `${DISABLED} > .cck-form-field__wrapper > :is(.cck-leading, .cck-trailing):not(:has(> ${OWN_STATE}))`,
    ]) {
      expect(declarationsInList(sheet, part)).toBe(rule);
      expect(declarationsInList(forced(sheet), part)).toContain('color: GrayText');
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

describe('a Select that is the control, with a Prefix or Suffix beside it', () => {
  const sheet = read('dist', 'components', 'form-field.css');
  const SELECT_BOX =
    '.cck-form-field__input-wrapper:has(> .cck-select):has(> :is(.cck-prefix, .cck-suffix):not([hidden]))';
  const TRIGGER = `${SELECT_BOX} > .cck-select > .cck-select__trigger`;
  const SELECT_FOCUSED = `${SELECT_BOX}:has(> .cck-select > .cck-select__trigger:focus-visible, > .cck-select[data-state=open])`;
  const IN_FIELD = (root: string): string => `${root} > .cck-form-field__wrapper > ${SELECT_BOX}`;

  it('draws one field box around them on the input wrapper, as high as the box of an Input', () => {
    const box = declarationsOf(stylesCss, SELECT_BOX) ?? '';
    for (const line of [
      'block-size: var(--cck-form-field-height)',
      'min-block-size: var(--cck-form-field-height)',
      'gap: 0',
      'padding-inline: 0',
      'border: var(--cck-form-field-border-width) solid var(--cck-form-field-border-color)',
      'border-radius: var(--_radius)',
      'background-color: var(--cck-form-field-bg)',
      'box-shadow: var(--cck-form-field-shadow)',
    ]) {
      expect(box).toContain(line);
    }
    expect(box).not.toContain('--cck-select-');
    expect(declarationsOf(stylesCss, `${SELECT_BOX} > .cck-prefix`)).toContain(
      'padding-inline-start: var(--cck-form-field-padding-inline)',
    );
    expect(declarationsOf(stylesCss, `${SELECT_BOX} > .cck-suffix`)).toContain(
      'padding-inline-end: var(--cck-form-field-padding-inline)',
    );
  });

  it('clears the box of the trigger and keeps its size, padding and text', () => {
    const trigger = declarationsOf(stylesCss, TRIGGER) ?? '';
    for (const line of ['border: 0', 'background-color: transparent', 'box-shadow: none']) {
      expect(trigger).toContain(line);
    }
    expect(trigger).not.toMatch(/min-block-size|padding|font|letter-spacing/);
  });

  it('shows hover, focus and the open list on the box, the focus last', () => {
    expect(declarationsOf(stylesCss, `${SELECT_BOX}:where(:hover)`)).toContain(
      'border-color: var(--cck-form-field-hover-border-color)',
    );
    const focus = declarationsOf(stylesCss, SELECT_FOCUSED) ?? '';
    expect(focus).toContain('border-color: var(--_focus)');
    expect(focus).toContain('z-index: 1');
    expect(focus).toContain(
      'box-shadow: 0 0 0 var(--cck-form-field-focus-ring-width) color-mix(in srgb, var(--_focus) var(--cck-form-field-focus-ring-mix), transparent)',
    );
    expect(declarationsOf(stylesCss, SELECT_BOX)).toContain('--_focus: var(--cck-form-field-focus-color)');
    expect(sheet.indexOf(`${SELECT_FOCUSED} {`)).toBeGreaterThan(sheet.indexOf(`${SELECT_BOX}:where(:hover)`));
  });

  it('takes invalid, read-only and disabled from the facts of the field root, as the box of an Input does', () => {
    for (const [root, box] of [
      [INVALID.split(' > ')[0], `${INVALID.split(' > ')[0]} > .cck-form-field__wrapper > ${BOX}`],
      [READONLY.split(' > ')[0], READONLY],
      [DISABLED, `${DISABLED} > .cck-form-field__wrapper > ${BOX}`],
    ] as const) {
      expect(declarationsInList(sheet, IN_FIELD(root)), root).toBe(declarationsInList(sheet, box));
    }
    // The box fades as a whole, so the trigger in it does not fade a second time.
    expect(declarationsInList(sheet, `${IN_FIELD(DISABLED)} > .cck-select > .cck-select__trigger`)).toContain(
      'opacity: 1',
    );
  });

  it('squares the corners of that box that touch a Leading or Trailing', () => {
    for (const zone of ['leading', 'trailing']) {
      const selector = `.cck-form-field__wrapper:has(> .cck-${zone}:not([hidden])) > ${SELECT_BOX}`;
      expect(declarationsInList(stylesCss, selector)).toContain(
        zone === 'leading' ? 'border-start-start-radius: 0' : 'border-start-end-radius: 0',
      );
    }
  });

  it('keeps the box in forced colors: CanvasText, dashed when read-only, GrayText when disabled, an outline on focus', () => {
    expect(declarationsOf(forced(sheet), SELECT_BOX)).toContain('border-color: CanvasText');
    expect(declarationsOf(forced(sheet), TRIGGER)).toContain('outline: none');
    expect(declarationsInList(forced(sheet), IN_FIELD(READONLY.split(' > ')[0]))).toContain('border-style: dashed');
    expect(declarationsInList(forced(sheet), IN_FIELD(DISABLED))).toContain('border-color: GrayText');
    expect(declarationsOf(forced(sheet), SELECT_FOCUSED)).toContain(
      'outline: var(--cck-form-field-focus-ring-width) solid Highlight',
    );
  });

  it('leaves a Select with no Prefix or Suffix its own box', () => {
    expect(declarationsOf(stylesCss, '.cck-form-field__input-wrapper > .cck-select')).not.toContain('border');
  });
});

describe('the required marker', () => {
  it('has a colour and a logical gap from its tokens', () => {
    const marker = declarationsOf(stylesCss, '.cck-label__required-marker') ?? '';
    expect(marker).toContain('color: var(--cck-label-required-marker-color)');
    expect(marker).toContain('margin-inline-start: var(--cck-label-required-marker-gap)');
  });
});
