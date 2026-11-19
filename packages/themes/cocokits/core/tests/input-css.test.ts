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
  const invalidSelector = '.cck-input:where([data-invalid]):where([data-touched], [data-submitted])';
  const disabledSelector = '.cck-input:where([data-disabled], :disabled)';
  const forced = css.split('@media (forced-colors: active)')[1] ?? '';

  it('draws the md box with the tokens', () => {
    const rule = declarationsOf(css, '.cck-input') ?? '';
    for (const line of [
      'min-block-size: var(--cck-input-height)',
      'padding-inline: var(--cck-input-padding-inline)',
      'border: var(--cck-input-border-width) solid var(--cck-input-border-color)',
      'border-radius: var(--cck-input-radius)',
      'background-color: var(--cck-input-bg)',
      'box-shadow: var(--cck-input-shadow)',
      'color: var(--cck-input-text-color)',
    ]) {
      expect(rule).toContain(line);
    }
    expect(tokensCss).toMatch(/--cck-input-height: var\(--cck-control-md\)/);
  });

  it('sets no display, so the native hidden attribute hides it', () => {
    expect(scss).not.toMatch(/(^|[\s{;])display\s*:/);
  });

  it('looks different when invalid and touched or submitted, read-only and disabled', () => {
    expect(declarationsOf(css, invalidSelector)).toContain('border-color: var(--cck-input-invalid-border-color)');
    expect(declarationsOf(css, '.cck-input:where([data-readonly])')).toContain(
      'background-color: var(--cck-input-readonly-bg)',
    );
    const disabled = declarationsOf(css, disabledSelector) ?? '';
    expect(disabled).toContain('opacity: var(--cck-input-disabled-opacity)');
    expect(disabled).toContain('cursor: not-allowed');
    expect(declarationsOf(css, '.cck-input::placeholder')).toContain('color: var(--cck-input-placeholder-color)');
  });

  it('shows invalid by the border colour only, and read-only by a fill with a dashed border in forced colors', () => {
    const invalid = declarationsOf(css, invalidSelector) ?? '';
    expect(invalid).toContain('border-color: var(--cck-input-invalid-border-color)');
    expect(invalid).toContain('--_focus: var(--cck-input-invalid-border-color)');
    expect(invalid).not.toMatch(/box-shadow|outline|border-width/);
    expect(declarationsOf(css, '.cck-input:where([data-readonly])')).not.toContain('border-style');
    expect(declarationsOf(forced, '.cck-input:where([data-readonly])')).toContain('border-style: dashed');
  });

  it('lets disabled win over hover and invalid with the resting border, and it comes later', () => {
    const disabled = declarationsOf(css, disabledSelector) ?? '';
    expect(disabled).toContain('border-color: var(--cck-input-border-color)');
    expect(css.indexOf(`${disabledSelector} {`)).toBeGreaterThan(css.indexOf(`${invalidSelector} {`));
    expect(css.indexOf(`${disabledSelector} {`)).toBeGreaterThan(css.indexOf('.cck-input:where([data-readonly]) {'));
    expect(css.indexOf(`${disabledSelector} {`)).toBeGreaterThan(css.indexOf('.cck-input:where(:hover) {'));
  });

  it('keeps the 1px border in forced colors: no thicker invalid border', () => {
    expect(forced).not.toContain('invalid-border-width');
  });

  it('draws a 3px focus halo at 20% of the focus colour', () => {
    expect(structureTokenOf('.cck-input', 'input-focus-color')).toBe(ref('focus-2'));
    expect(structureTokenOf('.cck-input', 'input-focus-ring-width')).toBe(ref('size-3'));
    expect(structureTokenOf('.cck-input', 'input-focus-ring-mix')).toBe(ref('opacity-20'));
  });

  it('draws the border in border/2, the hover border in border/3 and the placeholder in text/3', () => {
    expect(structureTokenOf('.cck-input', 'input-border-color')).toBe(ref('border-2'));
    expect(structureTokenOf('.cck-input', 'input-hover-border-color')).toBe(ref('border-3'));
    expect(structureTokenOf('.cck-input', 'input-placeholder-color')).toBe(ref('text-3'));
  });

  it('keeps the states at the specificity of the base rule, so no state selector is stronger', () => {
    expect(scss).not.toMatch(/&\[data-/);
    expect(css).not.toMatch(/\.cck-input\[data-/);
  });

  it('shows the focus as the focus border and a halo, with no outline outside forced colors', () => {
    const focus = declarationsOf(css, '.cck-input:focus-visible') ?? '';
    expect(focus).toContain('outline: none');
    expect(focus).toContain('border-color: var(--_focus)');
    expect(focus).toContain(
      'box-shadow: 0 0 0 var(--cck-input-focus-ring-width) color-mix(in srgb, var(--_focus) var(--cck-input-focus-ring-mix), transparent)',
    );
    expect(declarationsOf(css, '.cck-input')).toContain('--_focus: var(--cck-input-focus-color)');
  });

  it('has a forced-colors border, GrayText when disabled and a Highlight outline for the focus', () => {
    expect(forced).toContain('border-color: CanvasText');
    const disabled = declarationsOf(forced, disabledSelector) ?? '';
    expect(disabled).toContain('border-color: GrayText');
    expect(disabled).toContain('opacity: 1');
    expect(declarationsOf(forced, '.cck-input:focus-visible')).toContain(
      'outline: var(--cck-input-focus-ring-width) solid Highlight',
    );
  });
});

describe('input inside a field input wrapper', () => {
  it('is borderless and transparent, fills the wrapper and keeps its own text (F25)', () => {
    const rule = declarationsOf(css, '.cck-form-field__input-wrapper > .cck-input') ?? '';
    for (const line of [
      'flex: 1',
      'min-inline-size: 0',
      'padding: 0',
      'border: 0',
      'background-color: transparent',
      'box-shadow: none',
      'opacity: 1',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('leaves the focus halo to the wrapper, and the forced-colors outline too', () => {
    expect(declarationsOf(css, '.cck-form-field__input-wrapper > .cck-input:focus-visible')).toContain(
      'box-shadow: none',
    );
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(declarationsOf(forced, '.cck-form-field__input-wrapper > .cck-input:focus-visible')).toContain(
      'outline: none',
    );
  });
});
