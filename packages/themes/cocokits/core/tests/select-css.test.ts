import { describe, expect, it } from 'vitest';
import { declarationsOf, read, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'select.css');

describe('select output', () => {
  it('puts the rules inside @layer cocokits and into the whole theme', () => {
    expect(css.replace(/^@property --side-offset \{[^}]*\}\n/, '').startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain('.cck-select__content {');
  });

  it('emits the size modes on the root, the content tokens on the content class and nothing on :root', () => {
    expect(tokensCss).toContain('.cck-select[data-size=sm] {');
    expect(tokensCss).toContain('.cck-select, .cck-select[data-size=md] {');
    expect(tokensCss).toContain('.cck-select[data-size=lg] {');
    expect(tokensCss).toContain('.cck-select__content {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-select-');
  });

  it('draws the trigger box from the size tokens', () => {
    const rule = declarationsOf(css, '.cck-select__trigger') ?? '';
    for (const line of [
      'min-block-size: var(--cck-select-height)',
      'padding-inline: var(--cck-select-padding-inline)',
      'font-size: var(--cck-select-font-size)',
      'border-radius: var(--cck-select-radius)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('reads the surface, the offset and the anchor width from tokens and the positioning module', () => {
    const rule = declarationsOf(css, '.cck-select__content') ?? '';
    for (const line of [
      '--side-offset: var(--cck-select-content-side-offset)',
      'min-inline-size: var(--anchor-width)',
      'background-color: var(--cck-select-content-bg)',
      'box-shadow: var(--cck-select-content-shadow)',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('caps the height of the list with the documented custom property, 220px by default, and the available height', () => {
    const rule = declarationsOf(css, '.cck-select__content') ?? '';
    expect(rule).toContain(
      'max-block-size: min(var(--cck-select-content-max-height, 220px), var(--available-height, 100vh))',
    );
    expect(tokensCss).not.toContain('--cck-select-content-max-height:');
  });

  it('leaves the placement to the positioning module', () => {
    const rule = declarationsOf(css, '.cck-select__content') ?? '';
    expect(rule).not.toMatch(/(^|[\s;])(position|inset|top|left|right|bottom|transform)\s*:/);
  });

  it('restates [hidden] on the boxes it sets to display', () => {
    expect(css).toMatch(/\.cck-select\[hidden\]\s*\{\s*display: none/);
    expect(css).toMatch(/\.cck-select__content\[hidden\]\s*\{\s*display: none/);
  });

  it('draws the multiple box with CSS and the chevron and the check as theme icons: no image, no pseudo-element', () => {
    expect(css).not.toMatch(/url\(/);
    expect(css).not.toContain('.cck-select__option-indicator::after');
    expect(css).not.toContain('.cck-select__dropdown-icon:dir(rtl)');
    expect(css).toContain('.cck-select__content[data-multiple] .cck-select__option-indicator');
    const chevron = declarationsOf(css, '.cck-select__dropdown-icon') ?? '';
    expect(chevron).toContain('font-size: var(--cck-select-icon-size)');
    expect(chevron).toContain('color: var(--cck-select-icon-color)');
    expect(chevron).not.toContain('border');
    const open = declarationsOf(
      css,
      '.cck-select[data-state=open] > .cck-select__trigger > .cck-select__dropdown-icon',
    );
    expect(open).toContain('rotate: 180deg');
    const check = declarationsOf(css, '.cck-select__option-indicator') ?? '';
    expect(check).toContain('font-size: var(--cck-select-indicator-size)');
    expect(check).toContain('color: var(--cck-select-indicator-color)');
  });

  it('has a focus ring on the trigger and a hover border', () => {
    expect(css).toMatch(/\.cck-select__trigger:focus-visible\s*\{[^}]*outline: var\(--cck-select-focus-width\)/);
    expect(css).toContain(':where(:hover)');
  });

  it('shows invalid with a second line, read-only with a dashed border and disabled over invalid', () => {
    expect(css).toMatch(/\[data-invalid\][^{]*\{[^}]*box-shadow: inset 0 0 0 var\(--cck-select-border-width\)/);
    expect(css).toMatch(/\[data-readonly\][^{]*\{[^}]*border-style: dashed/);
    expect(css.indexOf('[data-disabled]')).toBeGreaterThan(css.indexOf('[data-invalid]'));
    expect(css).toMatch(/\[data-disabled\][^{]*\{[^}]*box-shadow: none/);
  });

  it('runs its motion only without a reduced-motion preference, keyed on data-state', () => {
    const motion = css.split('@media (prefers-reduced-motion: no-preference)')[1] ?? '';
    expect(motion).toContain('.cck-select__content[data-state=open]');
    expect(motion).toContain('.cck-select__content[data-state=closed]');
    const outside = css.split('@media (prefers-reduced-motion: no-preference)')[0] ?? '';
    expect(outside).not.toMatch(/animation:/);
  });

  it('mirrors the inline slide in right-to-left on the part itself', () => {
    expect(css).toContain('[data-side=start]:dir(rtl)');
    expect(css).toContain('[data-side=end]:dir(rtl)');
  });

  it('uses system colors in forced colors', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    for (const color of ['CanvasText', 'GrayText', 'Highlight', 'HighlightText']) {
      expect(forced).toContain(color);
    }
  });
});

describe('select separator', () => {
  it('draws a line in the list border tokens with the option padding as vertical margin', () => {
    const rule = declarationsOf(css, '.cck-select__separator') ?? '';
    expect(rule).toContain('margin-block: var(--cck-select-option-padding-block)');
    expect(rule).toContain(
      'border-block-start: var(--cck-select-content-border-width) solid var(--cck-select-content-border-color)',
    );
    expect(rule).not.toContain('background');
  });

  it('keeps the line in forced colors with a system colour', () => {
    const forced = css.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toMatch(/\.cck-select__separator\s*\{[^}]*border-block-start-color: CanvasText/);
  });
});

describe('select inside a form field', () => {
  const fieldCss = read('dist', 'components', 'form-field.css');

  it('fills the input wrapper and takes the size of the field, not its own', () => {
    expect(fieldCss).toMatch(/\.cck-form-field__input-wrapper > \.cck-select\s*\{[^}]*flex: 1/);
    expect(fieldCss).toMatch(
      /\.cck-form-field__input-wrapper > \.cck-select > \.cck-select__trigger\s*\{[^}]*min-block-size: var\(--cck-form-field-height\)/,
    );
  });
});

describe('select list tokens', () => {
  it('reads in the list only the tokens that are emitted on the list class', () => {
    // The list is portaled out of the root, so a token of the root (the Size and Structure collections) is not there.
    const list = tokensCss.slice(tokensCss.indexOf('.cck-select__content {'));
    const emitted = new Set([...list.slice(0, list.indexOf('}')).matchAll(/(--cck-select-[\w-]+):/g)].map((m) => m[1]));
    const listRules = css
      .split('}')
      .filter((rule) =>
        /\.cck-select__(content|option|option-indicator|option-group|option-group-label|option-content|separator)\b/.test(
          rule,
        ),
      )
      .join('}');
    const read = [...listRules.matchAll(/var\((--cck-select-[\w-]+)/g)].map((m) => m[1]);
    const missing = read.filter(
      (name) =>
        !emitted.has(name) &&
        !['--cck-select-content-max-height', '--cck-select-slide-x', '--cck-select-slide-y'].includes(name),
    );
    expect(missing).toEqual([]);
  });
});
