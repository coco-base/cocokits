import { describe, expect, it } from 'vitest';
import { declarationsOf, read, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'textarea.css');
const scss = read('src', 'styles', 'components', '_textarea.scss');
const INVALID = '.cck-textarea:where([data-invalid]):where([data-touched], [data-submitted])';
const DISABLED = '.cck-textarea:where([data-disabled], :disabled)';

describe('textarea output', () => {
  it('puts the rules inside @layer cocokits and into the whole theme', () => {
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain('.cck-textarea {');
  });

  it('emits the tokens on the component class and never on :root', () => {
    expect(tokensCss).toContain('.cck-textarea {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-textarea-');
  });

  it('defines no token named min-rows or max-rows, so they stay author-only', () => {
    expect(tokensCss).not.toMatch(/--cck-textarea-(min|max)-rows\s*:/);
  });
});

describe('standalone textarea box', () => {
  it('draws the md box with the tokens, vertical resize and top alignment', () => {
    const rule = declarationsOf(css, '.cck-textarea') ?? '';
    for (const line of [
      'padding-block: var(--cck-textarea-padding-block)',
      'padding-inline: var(--cck-textarea-padding-inline)',
      'border: var(--cck-textarea-border-width) solid var(--cck-textarea-border-color)',
      'border-radius: var(--cck-textarea-radius)',
      'background-color: var(--cck-textarea-bg)',
      'color: var(--cck-textarea-text-color)',
      'resize: vertical',
      'vertical-align: top',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('sets no display, so the native hidden attribute hides it', () => {
    expect(scss).not.toMatch(/(^|[\s{;])display\s*:/);
  });

  it('looks different when invalid and touched or submitted, read-only and disabled', () => {
    expect(declarationsOf(css, INVALID)).toContain('border-color: var(--cck-textarea-invalid-border-color)');
    expect(declarationsOf(css, '.cck-textarea:where([data-readonly])')).toContain(
      'background-color: var(--cck-textarea-readonly-bg)',
    );
    const disabled = declarationsOf(css, DISABLED) ?? '';
    expect(disabled).toContain('background-color: var(--cck-textarea-disabled-bg)');
    expect(disabled).toContain('color: var(--cck-textarea-disabled-text-color)');
    expect(declarationsOf(css, '.cck-textarea::placeholder')).toContain('color: var(--cck-textarea-placeholder-color)');
  });

  it('gives invalid and read-only a cue that is not color', () => {
    expect(declarationsOf(css, INVALID)).toContain(
      'box-shadow: inset 0 0 0 var(--cck-textarea-border-width) var(--cck-textarea-invalid-border-color)',
    );
    expect(declarationsOf(css, '.cck-textarea:where([data-readonly])')).toContain('border-style: dashed');
  });

  it('lets disabled win over invalid and touched, also in forced colors', () => {
    expect(declarationsOf(css, DISABLED)).toContain('box-shadow: none');
    expect(css.indexOf(`${DISABLED} {`)).toBeGreaterThan(css.indexOf(`${INVALID} {`));
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    const thick = forced.indexOf('border-width: var(--cck-textarea-invalid-border-width)');
    expect(thick).toBeGreaterThan(-1);
    expect(forced.indexOf('border-width: var(--cck-textarea-border-width)')).toBeGreaterThan(thick);
  });

  it('keeps the states at the specificity of the base rule', () => {
    expect(scss).not.toMatch(/&\[data-(?!auto-resize)/);
    expect(css).not.toMatch(/\.cck-textarea\[data-(?!auto-resize)/);
  });

  it('rings the focus outside a field and has forced-colors rules', () => {
    expect(declarationsOf(css, '.cck-textarea:focus-visible')).toContain(
      'outline: var(--cck-textarea-focus-width) solid var(--cck-textarea-focus-color)',
    );
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    for (const line of ['border-color: CanvasText', 'border-color: GrayText', 'outline-color: Highlight']) {
      expect(forced).toContain(line);
    }
  });
});

describe('auto-resize', () => {
  const rule = declarationsOf(css, '.cck-textarea[data-auto-resize]') ?? '';

  it('grows with the content and drops the resize handle', () => {
    expect(rule).toContain('field-sizing: content');
    expect(rule).toContain('resize: none');
    expect(rule).toContain('inline-size: 100%');
  });

  it('is bounded by the documented rows, 2 and 5 by default, plus the padding and the border', () => {
    expect(rule).toMatch(/min-block-size: calc\(\s*var\(--cck-textarea-min-rows, 2\) \* 1lh/);
    expect(rule).toMatch(/max-block-size: calc\(\s*var\(--cck-textarea-max-rows, 5\) \* 1lh/);
    expect(rule).toContain('var(--cck-textarea-padding-block)');
    expect(rule).toContain('var(--cck-textarea-border-width)');
  });

  it('is set by the attribute alone, so a textarea without the option keeps its rows', () => {
    expect(declarationsOf(css, '.cck-textarea') ?? '').not.toContain('field-sizing');
  });
});

describe('textarea inside a field input wrapper', () => {
  it('is borderless and transparent, fills the wrapper and keeps the wrapper font', () => {
    const rule = declarationsOf(css, '.cck-form-field__input-wrapper > .cck-textarea') ?? '';
    for (const line of [
      'flex: 1',
      'min-inline-size: 0',
      'padding-inline: 0',
      'border: 0',
      'background-color: transparent',
      'font: inherit',
      'box-shadow: none',
    ]) {
      expect(rule).toContain(line);
    }
    expect(rule).not.toContain('padding-block');
  });

  it('leaves the focus ring to the wrapper', () => {
    expect(declarationsOf(css, '.cck-form-field__input-wrapper > .cck-textarea:focus-visible')).toContain(
      'outline: none',
    );
  });
});
