import { describe, expect, it } from 'vitest';
import { declarationsOf, read, tokensCss } from './css-test-helpers';

const stylesCss = ['form-field', 'label', 'hint', 'input', 'textarea', 'field-error']
  .map((name) => read('dist', 'components', `${name}.css`))
  .join('\n');
/** The input wrapper that holds a text control: the box. */
const BOX = '.cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea, > .cck-chip-list)';
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
    expect(tokensCss).toMatch(/--cck-form-field-gap: var\(--cck-spacing-3\)/);
    expect(tokensCss).toMatch(/--cck-form-field-balance-indent: var\(--cck-spacing-2\)/);
    expect(tokensCss).toMatch(/--cck-form-field-min-inline-size: 100px/);
    expect(tokensCss).toMatch(/--cck-hint-gap: var\(--cck-spacing-3\)/);
    expect(tokensCss).toMatch(/--cck-label-text-color: var\(--cck-text-1\)/);
    expect(tokensCss).toMatch(/--cck-hint-text-color: var\(--cck-text-2\)/);
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
      const rule = declarationsOf(stylesCss, `.cck-form-field__${part}`) ?? '';
      expect(rule).not.toMatch(/border|radius|background|block-size|height|padding/);
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
      for (const part of selector.split(/,\s*(?![^(]*\))/)) {
        expect(part.trim(), selector).toMatch(/^\.cck-/);
      }
    }
  });

  it('joins the blocks with child or sibling combinators only, never a descendant selector', () => {
    for (const selector of own) {
      const flat = selector.replace(/\([^()]*(?:\([^()]*\)[^()]*)*\)/g, '()');
      for (const part of flat.split(',')) {
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
    const forced = stylesCss.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('border-color: CanvasText');
    expect(forced).toContain('border-color: GrayText');
    expect(forced).toContain('outline-color: Highlight');
    expect(forced).toContain('border-width: var(--cck-form-field-invalid-border-width)');
    expect(read('src', 'styles', 'components', '_label.scss')).not.toContain('forced-colors');
  });
});

describe('the box of the input wrapper', () => {
  it('draws the box on a wrapper that holds an Input and sizes it from the inherited size tokens', () => {
    const box = declarationsOf(stylesCss, BOX) ?? '';
    for (const line of [
      'border: var(--cck-form-field-border-width) solid var(--cck-form-field-border-color)',
      'border-radius: var(--cck-form-field-radius)',
      'background-color: var(--cck-form-field-bg)',
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
    // The size does not hang on the data-size of the wrapper, so a null size still gets the md box.
    expect(stylesCss).not.toContain('input-wrapper[data-size]');
  });

  it('shows the invalid border only when invalid and (touched or submitted)', () => {
    const selector =
      '.cck-form-field:where([data-invalid]):where([data-touched], [data-submitted]) > .cck-form-field__wrapper > .cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea, > .cck-chip-list)';
    expect(declarationsOf(stylesCss, selector)).toContain('border-color: var(--cck-form-field-invalid-border-color)');
    expect(scss).not.toMatch(/(^|\n)\s*\[data-/);
  });

  it('gives invalid and read-only a cue that is not color, outside forced colors too', () => {
    const wrapper =
      '> .cck-form-field__wrapper > .cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea, > .cck-chip-list)';
    const invalid = declarationsOf(
      stylesCss,
      `.cck-form-field:where([data-invalid]):where([data-touched], [data-submitted]) ${wrapper}`,
    );
    expect(invalid).toContain(
      'box-shadow: inset 0 0 0 var(--cck-form-field-border-width) var(--cck-form-field-invalid-border-color)',
    );
    expect(declarationsOf(stylesCss, `.cck-form-field:where([data-readonly]) ${wrapper}`)).toContain(
      'border-style: dashed',
    );
  });

  it('lets disabled win over invalid and touched: no invalid line and the disabled border', () => {
    const wrapper =
      '> .cck-form-field__wrapper > .cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea, > .cck-chip-list)';
    const disabled = declarationsOf(stylesCss, `.cck-form-field:where([data-disabled]) ${wrapper}`) ?? '';
    expect(disabled).toContain('box-shadow: none');
    expect(disabled).toContain('border-color: var(--cck-form-field-disabled-border-color)');
    const invalid = `.cck-form-field:where([data-invalid]):where([data-touched], [data-submitted]) ${wrapper}`;
    expect(stylesCss.indexOf(`.cck-form-field:where([data-disabled]) ${wrapper} {`)).toBeGreaterThan(
      stylesCss.indexOf(`${invalid} {`),
    );
  });

  it('lets disabled win over invalid in forced colors too: GrayText and the thin border, after the thick one', () => {
    const forced = stylesCss.split('@media (forced-colors: active)')[1] ?? '';
    const invalid = forced.indexOf('border-width: var(--cck-form-field-invalid-border-width)');
    const disabled = forced.indexOf('border-width: var(--cck-form-field-border-width)');
    expect(invalid).toBeGreaterThan(-1);
    expect(disabled).toBeGreaterThan(invalid);
  });

  it('colours the disabled and read-only boxes from the facts of the root', () => {
    const wrapper =
      '> .cck-form-field__wrapper > .cck-form-field__input-wrapper:has(> .cck-input, > .cck-textarea, > .cck-chip-list)';
    expect(declarationsOf(stylesCss, `.cck-form-field:where([data-disabled]) ${wrapper}`)).toContain(
      'background-color: var(--cck-form-field-disabled-bg)',
    );
    expect(declarationsOf(stylesCss, `.cck-form-field:where([data-readonly]) ${wrapper}`)).toContain(
      'background-color: var(--cck-form-field-readonly-bg)',
    );
  });

  it('shows the focus ring on the wrapper while the Input has focus', () => {
    expect(declarationsOf(stylesCss, `${BOX}:focus-within`)).toContain(
      'outline: var(--cck-form-field-focus-width) solid var(--cck-form-field-focus-color)',
    );
  });

  it('takes the sizes from the Form Field / Size modes', () => {
    for (const [mode, step] of [
      ['sm', 32],
      ['md', 40],
      ['lg', 48],
    ] as const) {
      expect(tokensCss).toMatch(
        new RegExp(
          `\\.cck-form-field\\[data-size=${mode}\\][^{]*\\{[^}]*--cck-form-field-height: var\\(--cck-size-${String(step)}\\)`,
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
