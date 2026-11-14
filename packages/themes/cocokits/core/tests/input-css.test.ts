import { describe, expect, it } from 'vitest';
import { declarationsOf, read, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'input.css');
const scss = read('src', 'styles', 'components', '_input.scss');

describe('input output', () => {
  it('puts the rules inside @layer cocokits and into the whole theme', () => {
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain('.cck-input {');
  });

  it('emits the tokens on the component class and never on :root', () => {
    expect(tokensCss).toContain('.cck-input {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-input-');
  });
});

describe('standalone input box', () => {
  it('draws the md box with the tokens', () => {
    const rule = declarationsOf(css, '.cck-input') ?? '';
    for (const line of [
      'min-block-size: var(--cck-input-height)',
      'padding-inline: var(--cck-input-padding-inline)',
      'border: var(--cck-input-border-width) solid var(--cck-input-border-color)',
      'border-radius: var(--cck-input-radius)',
      'background-color: var(--cck-input-bg)',
      'color: var(--cck-input-text-color)',
    ]) {
      expect(rule).toContain(line);
    }
    expect(tokensCss).toMatch(/--cck-input-height: var\(--cck-size-40\)/);
  });

  it('sets no display, so the native hidden attribute hides it', () => {
    expect(scss).not.toMatch(/(^|[\s{;])display\s*:/);
  });

  it('looks different when invalid and touched or submitted, read-only and disabled', () => {
    expect(declarationsOf(css, '.cck-input:where([data-invalid]):where([data-touched], [data-submitted])')).toContain(
      'border-color: var(--cck-input-invalid-border-color)',
    );
    expect(declarationsOf(css, '.cck-input:where([data-readonly])')).toContain(
      'background-color: var(--cck-input-readonly-bg)',
    );
    const disabled = declarationsOf(css, '.cck-input:where([data-disabled], :disabled)') ?? '';
    expect(disabled).toContain('background-color: var(--cck-input-disabled-bg)');
    expect(disabled).toContain('color: var(--cck-input-disabled-text-color)');
    expect(declarationsOf(css, '.cck-input::placeholder')).toContain('color: var(--cck-input-placeholder-color)');
  });

  it('gives invalid and read-only a cue that is not color', () => {
    expect(declarationsOf(css, '.cck-input:where([data-invalid]):where([data-touched], [data-submitted])')).toContain(
      'box-shadow: inset 0 0 0 var(--cck-input-border-width) var(--cck-input-invalid-border-color)',
    );
    expect(declarationsOf(css, '.cck-input:where([data-readonly])')).toContain('border-style: dashed');
  });

  it('lets disabled win over invalid and touched: no invalid line, and it comes later', () => {
    const disabled = declarationsOf(css, '.cck-input:where([data-disabled], :disabled)') ?? '';
    expect(disabled).toContain('box-shadow: none');
    expect(css.indexOf('.cck-input:where([data-disabled], :disabled) {')).toBeGreaterThan(
      css.indexOf('.cck-input:where([data-invalid]):where([data-touched], [data-submitted]) {'),
    );
  });

  it('lets disabled win over invalid in forced colors too: the thin border, after the thick one', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    const invalid = forced.indexOf('border-width: var(--cck-input-invalid-border-width)');
    const disabled = forced.indexOf('border-width: var(--cck-input-border-width)');
    expect(invalid).toBeGreaterThan(-1);
    expect(disabled).toBeGreaterThan(invalid);
  });

  it('keeps the states at the specificity of the base rule, so no state selector is stronger', () => {
    expect(scss).not.toMatch(/&\[data-/);
    expect(css).not.toMatch(/\.cck-input\[data-/);
  });

  it('rings the focus and never removes the outline outside a field', () => {
    expect(declarationsOf(css, '.cck-input:focus-visible')).toContain(
      'outline: var(--cck-input-focus-width) solid var(--cck-input-focus-color)',
    );
  });

  it('has a forced-colors border, a thicker invalid border and GrayText when disabled', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('border-color: CanvasText');
    expect(forced).toContain('border-width: var(--cck-input-invalid-border-width)');
    expect(forced).toContain('border-color: GrayText');
    expect(forced).toContain('outline-color: Highlight');
  });
});

describe('input inside a field input wrapper', () => {
  it('is borderless and transparent, fills the wrapper and keeps the wrapper font', () => {
    const rule = declarationsOf(css, '.cck-form-field__input-wrapper > .cck-input') ?? '';
    for (const line of [
      'flex: 1',
      'min-inline-size: 0',
      'padding: 0',
      'border: 0',
      'background-color: transparent',
      'font: inherit',
      'box-shadow: none',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('leaves the focus ring to the wrapper', () => {
    expect(declarationsOf(css, '.cck-form-field__input-wrapper > .cck-input:focus-visible')).toContain('outline: none');
  });
});
