import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, structureTokenOf, tokensCss } from './css-test-helpers';

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

  it('shows invalid by the border colour only, and read-only with a dashed border', () => {
    const invalid =
      declarationsOf(css, '.cck-input:where([data-invalid]):where([data-touched], [data-submitted])') ?? '';
    expect(invalid).toContain('border-color: var(--cck-input-invalid-border-color)');
    expect(invalid).not.toMatch(/box-shadow|outline|border-width/);
    expect(declarationsOf(css, '.cck-input:where([data-readonly])')).toContain('border-style: dashed');
  });

  it('lets disabled win over invalid and touched, and it comes later', () => {
    const disabled = declarationsOf(css, '.cck-input:where([data-disabled], :disabled)') ?? '';
    expect(disabled).toContain('border-color: var(--cck-input-disabled-border-color)');
    expect(css.indexOf('.cck-input:where([data-disabled], :disabled) {')).toBeGreaterThan(
      css.indexOf('.cck-input:where([data-invalid]):where([data-touched], [data-submitted]) {'),
    );
  });

  it('keeps the 1px border in forced colors: no thicker invalid border', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).not.toContain('invalid-border-width');
  });

  it('draws a 1px focus ring with no offset', () => {
    expect(structureTokenOf('.cck-input', 'input-focus-width')).toBe(ref('size-1'));
    expect(structureTokenOf('.cck-input', 'input-focus-offset')).toBe(ref('spacing-0'));
  });

  it('draws the border and the hover border in border/2 and the placeholder in text/3', () => {
    expect(structureTokenOf('.cck-input', 'input-border-color')).toBe(ref('border-2'));
    expect(structureTokenOf('.cck-input', 'input-hover-border-color')).toBe(ref('border-2'));
    expect(structureTokenOf('.cck-input', 'input-placeholder-color')).toBe(ref('text-3'));
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

  it('has a forced-colors border and GrayText when disabled', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('border-color: CanvasText');
    expect(forced).toContain('border-color: GrayText');
    expect(forced).toContain('outline-color: Highlight');
  });
});

describe('input inside a field input wrapper', () => {
  it('is borderless and transparent, fills the wrapper and keeps its own text (F25)', () => {
    const rule = declarationsOf(css, '.cck-form-field__input-wrapper > .cck-input') ?? '';
    for (const line of ['flex: 1', 'min-inline-size: 0', 'padding: 0', 'border: 0', 'background-color: transparent']) {
      expect(rule).toContain(line);
    }
  });

  it('leaves the focus ring to the wrapper', () => {
    expect(declarationsOf(css, '.cck-form-field__input-wrapper > .cck-input:focus-visible')).toContain('outline: none');
  });
});
