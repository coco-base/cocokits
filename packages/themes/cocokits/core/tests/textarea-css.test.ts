import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, sizeTokenOf, structureTokenOf, tokensCss } from './css-test-helpers';

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
  const forced = css.split('@media (forced-colors: active)')[1] ?? '';

  it('draws the md box with the tokens, vertical resize and top alignment', () => {
    const rule = declarationsOf(css, '.cck-textarea') ?? '';
    for (const line of [
      'padding-block: var(--cck-textarea-padding-block)',
      'padding-inline: var(--cck-textarea-padding-inline)',
      'border: var(--cck-textarea-border-width) solid var(--cck-textarea-border-color)',
      'background-color: var(--cck-textarea-bg)',
      'box-shadow: var(--cck-textarea-shadow)',
      'color: var(--cck-textarea-text-color)',
      'resize: none',
      'vertical-align: top',
    ]) {
      expect(rule).toContain(line);
    }
    expect(declarationsOf(css, '.cck-textarea:not([data-auto-resize])')).toContain(
      'min-block-size: var(--cck-textarea-min-height)',
    );
  });

  it('caps the radius at half the height of a one-line control, so the box is no capsule', () => {
    expect(declarationsOf(css, '.cck-textarea')).toContain(
      'border-radius: min(var(--cck-textarea-radius), var(--cck-textarea-control-height) / 2)',
    );
    for (const size of ['sm', 'md', 'lg']) {
      expect(sizeTokenOf('.cck-textarea', size, 'textarea-control-height')).toBe(ref(`control-${size}`));
    }
  });

  it('reports the width of 20 characters where it can, and a cols attribute keeps its meaning', () => {
    const width = css.split('@supports (contain-intrinsic-inline-size: none)')[1] ?? '';
    const rule = declarationsOf(width, '.cck-textarea:where(:not([cols]), [data-auto-resize])') ?? '';
    expect(rule).toContain('contain: inline-size');
    expect(rule).toContain('contain-intrinsic-inline-size: 20ch');
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
    expect(disabled).toContain('opacity: var(--cck-textarea-disabled-opacity)');
    expect(disabled).toContain('cursor: not-allowed');
    expect(declarationsOf(css, '.cck-textarea::placeholder')).toContain('color: var(--cck-textarea-placeholder-color)');
  });

  it('shows invalid by the border colour only, and read-only by a fill with a dashed border in forced colors', () => {
    expect(declarationsOf(css, INVALID)).not.toMatch(/box-shadow|outline|border-width/);
    expect(declarationsOf(css, INVALID)).toContain('--_focus: var(--cck-textarea-invalid-border-color)');
    expect(declarationsOf(css, '.cck-textarea:where([data-readonly])')).not.toContain('border-style');
    expect(declarationsOf(forced, '.cck-textarea:where([data-readonly])')).toContain('border-style: dashed');
  });

  it('lets disabled win over invalid and touched, with no thicker invalid border in forced colors', () => {
    expect(declarationsOf(css, DISABLED)).toContain('border-color: var(--cck-textarea-border-color)');
    expect(css.indexOf(`${DISABLED} {`)).toBeGreaterThan(css.indexOf(`${INVALID} {`));
    expect(css.indexOf(`${DISABLED} {`)).toBeGreaterThan(css.indexOf('.cck-textarea:where([data-readonly]) {'));
    expect(forced).not.toContain('invalid-border-width');
  });

  it('draws a 3px halo at 20% of focus/2, the border in border/2, the hover border in border/3', () => {
    expect(structureTokenOf('.cck-textarea', 'textarea-focus-color')).toBe(ref('focus-2'));
    expect(structureTokenOf('.cck-textarea', 'textarea-focus-ring-width')).toBe(ref('size-3'));
    expect(structureTokenOf('.cck-textarea', 'textarea-focus-ring-mix')).toBe(ref('opacity-20'));
    expect(structureTokenOf('.cck-textarea', 'textarea-border-color')).toBe(ref('border-2'));
    expect(structureTokenOf('.cck-textarea', 'textarea-hover-border-color')).toBe(ref('border-3'));
    expect(structureTokenOf('.cck-textarea', 'textarea-placeholder-color')).toBe(ref('text-3'));
  });

  it('keeps the states at the specificity of the base rule', () => {
    expect(scss).not.toMatch(/&\[data-(?!auto-resize)/);
    expect(css).not.toMatch(/\.cck-textarea\[data-(?!auto-resize)/);
    expect(css).toContain('.cck-textarea:where([data-resize])');
  });

  it('shows the focus as a border and a halo outside a field and has forced-colors rules', () => {
    const focus = declarationsOf(css, '.cck-textarea:focus-visible') ?? '';
    expect(focus).toContain('outline: none');
    expect(focus).toContain('border-color: var(--_focus)');
    expect(focus).toContain(
      'box-shadow: 0 0 0 var(--cck-textarea-focus-ring-width) color-mix(in srgb, var(--_focus) var(--cck-textarea-focus-ring-mix), transparent)',
    );
    for (const line of ['border-color: CanvasText', 'border-color: GrayText', 'opacity: 1']) {
      expect(forced).toContain(line);
    }
    expect(declarationsOf(forced, '.cck-textarea:focus-visible')).toContain(
      'outline: var(--cck-textarea-focus-ring-width) solid Highlight',
    );
  });
});

describe('auto-resize', () => {
  const rule = declarationsOf(css, '.cck-textarea[data-auto-resize]') ?? '';

  it('grows with the content and drops the resize handle', () => {
    expect(rule).toContain('field-sizing: content');
    expect(rule).toContain('resize: none');
    expect(rule).not.toContain('inline-size');
  });

  it('is bounded by the documented rows, 2 and 5 by default, plus the padding and the border', () => {
    expect(rule).toMatch(
      /min-block-size: max\(var\(--cck-textarea-min-height\), var\(--cck-textarea-min-rows, 2\) \* 1lh/,
    );
    expect(rule).toMatch(/max-block-size: calc\(\s*var\(--cck-textarea-max-rows, 5\) \* 1lh/);
    expect(rule).toContain('var(--cck-textarea-padding-block)');
    expect(rule).toContain('var(--cck-textarea-border-width)');
  });

  it('is set by the attribute alone, so a textarea without the option keeps its rows', () => {
    expect(declarationsOf(css, '.cck-textarea') ?? '').not.toContain('field-sizing');
  });
});

describe('textarea inside a field input wrapper', () => {
  it('is borderless and transparent, fills the wrapper and keeps its own text (F25)', () => {
    const rule = declarationsOf(css, '.cck-form-field__input-wrapper > .cck-textarea') ?? '';
    for (const line of [
      'flex: 1',
      'min-inline-size: 0',
      'padding-inline: 0',
      'border: 0',
      'background-color: transparent',
    ]) {
      expect(rule).toContain(line);
    }
    expect(rule).not.toMatch(/padding-block|font|letter-spacing/);
  });

  it('leaves the focus halo to the wrapper, and the forced-colors outline too', () => {
    expect(declarationsOf(css, '.cck-form-field__input-wrapper > .cck-textarea:focus-visible')).toContain(
      'box-shadow: none',
    );
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(declarationsOf(forced, '.cck-form-field__input-wrapper > .cck-textarea:focus-visible')).toContain(
      'outline: none',
    );
  });
});
