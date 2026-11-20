import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, sizeTokenOf, structureTokenOf } from './css-test-helpers';

// The token tables of the Checkbox, the Radio and the Switch (test-plan kind E); the rules are in choice-css.test.ts.

interface TokenFile {
  collections: { name: string; tokens: { name: string; valuesByMode: Record<string, unknown> }[] }[];
}
const tokensJson = (block: string): TokenFile => JSON.parse(read('src', 'tokens', `${block}.tokens.json`)) as TokenFile;
const cssOf = (block: string): string => read('dist', 'components', `${block}.css`);
const forcedOf = (css: string): string => css.slice(css.indexOf('@media (forced-colors: active)'));
/** The state part of the Switch disabled rules: the fact, or a natively disabled input (`<fieldset disabled>`). */
const SWITCH_DISABLED =
  '.cck-switch:where([data-disabled], :has(> .cck-switch__label > .cck-switch__track > .cck-switch__input:disabled))';

describe('box sizes', () => {
  it.each([
    ['checkbox', 'box-icon-size', ['size-10', 'size-12', 'size-16']],
    ['radio', 'box-dot-size', ['size-6', 'size-6', 'size-8']],
  ] as const)('draws the %s box at 14, 16 and 20 px, with its %s', (block, mark, marks) => {
    const tokens = tokensJson(block).collections[0]?.tokens ?? [];
    expect(tokens.find((t) => t.name === 'box-size')?.valuesByMode).toEqual({
      sm: '{Core / Size#size-14}',
      md: '{Core / Size#size-16}',
      lg: '{Core / Size#size-20}',
    });
    ['sm', 'md', 'lg'].forEach((mode, index) => {
      expect(sizeTokenOf(`.cck-${block}`, mode, `${block}-${mark}`), mode).toBe(ref(marks[index]));
    });
  });

  it('centres the radio dot in the box', () => {
    expect(cssOf('radio')).toMatch(
      /\.cck-radio__background::after \{[^}]*inset: calc\(\(100% - var\(--cck-radio-box-dot-size\)\) \/ 2\)/,
    );
  });

  it('keeps the dash two borders high and holds no invalid border width', () => {
    expect(cssOf('checkbox')).toContain('inset-block: calc(50% - var(--cck-checkbox-box-border-width))');
    expect(structureTokenOf('.cck-checkbox', 'checkbox-box-invalid-border-width')).toBeUndefined();
  });

  it.each(['checkbox', 'radio'])('the %s has no halo size', (block) => {
    for (const collection of tokensJson(block).collections)
      expect(collection.tokens.map((t) => t.name).filter((name) => name.startsWith('halo'))).toEqual([]);
  });
});

/** The structure tokens the Checkbox and the Radio share; the Checkbox adds `box-readonly-bg`. */
const BOX_STRUCTURE = [
  ['hit-size', 'size-24'],
  ['gap', 'spacing-4'],
  ['box-border-width', 'border-width-1'],
  ['box-bg', 'surface-1'],
  ['box-border-color', 'border-3'],
  ['box-hover-border-color', 'text-3'],
  ['box-shadow', 'shadow-xs'],
  ['box-checked-bg', 'color'],
  ['box-checked-border-color', 'color'],
  ['box-mark-color', 'on-color'],
  ['box-invalid-border-color', 'danger-color'],
  ['label-font-weight', 'font-weight-regular'],
  ['label-text-color', 'text-1'],
  ['hover-mix', 'opacity-10'],
  ['active-mix', 'opacity-20'],
  ['focus-color', 'focus-2'],
  ['focus-width', 'border-width-2'],
  ['focus-offset', 'spacing-2'],
  ['disabled-opacity', 'opacity-50'],
] as const;

describe.each([
  ['checkbox', [...BOX_STRUCTURE, ['box-radius', 'radius-sm'], ['box-readonly-bg', 'surface-2']]],
  ['radio', [...BOX_STRUCTURE, ['box-radius', 'radius-full']]],
] as const)('%s design match', (block, structure) => {
  const ROOT = `.cck-${block}`;
  const size = (mode: string, name: string): string | undefined => sizeTokenOf(ROOT, mode, `${block}-${name}`);
  const own = (name: string): string | undefined => structureTokenOf(ROOT, `${block}-${name}`);

  it.each(['sm', 'md', 'lg'])('size %s: the label text is text-sm', (mode) => {
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(size(mode, `label-${part}`), part).toBe(ref(`text-sm-${part}`));
  });

  it.each(structure as readonly (readonly [string, string])[])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it('keeps the gap and the hit size in the structure collection, not per size', () => {
    for (const mode of ['sm', 'md', 'lg']) {
      expect(size(mode, 'gap'), mode).toBeUndefined();
      expect(size(mode, 'hit-size'), mode).toBeUndefined();
    }
    expect(declarationsOf(cssOf(block), `${ROOT}__label`)).toContain(
      `font-weight: var(--cck-${block}-label-font-weight)`,
    );
  });
});

describe('switch design match', () => {
  const ROOT = '.cck-switch';
  const css = cssOf('switch');
  const size = (mode: string, name: string): string | undefined => sizeTokenOf(ROOT, mode, `switch-${name}`);
  const own = (name: string): string | undefined => structureTokenOf(ROOT, `switch-${name}`);

  it.each([
    ['sm', 'size-28', 'size-16', 'size-12', 'size-24', 'size-6'],
    ['md', 'size-36', 'size-20', 'size-16', 'size-32', 'size-8'],
    ['lg', 'size-44', 'size-24', 'size-20', 'size-40', 'size-10'],
  ])('size %s: track %s by %s, thumb %s, rail %s by %s', (mode, width, height, thumb, railWidth, railHeight) => {
    expect(size(mode, 'track-width')).toBe(ref(width));
    expect(size(mode, 'track-height')).toBe(ref(height));
    expect(size(mode, 'thumb-size')).toBe(ref(thumb));
    expect(size(mode, 'rail-track-width')).toBe(ref(railWidth));
    expect(size(mode, 'rail-track-height')).toBe(ref(railHeight));
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(size(mode, `label-${part}`), part).toBe(ref(`text-sm-${part}`));
  });

  it.each([
    ['hit-size', 'size-24'],
    ['gap', 'spacing-4'],
    ['thumb-offset', 'size-2'],
    ['track-radius', 'radius-full'],
    ['track-border-width', 'border-width-1'],
    ['track-bg', 'surface-3'],
    ['track-ink', 'text-1'],
    ['track-readonly-border-color', 'border-3'],
    ['track-checked-bg', 'color'],
    ['track-invalid-border-color', 'danger-color'],
    ['thumb-color', 'white'],
    ['thumb-checked-color', 'on-color'],
    ['thumb-shadow', 'shadow-sm'],
    ['rail-thumb-border-width', 'border-width-1'],
    ['rail-thumb-border-color', 'border-3'],
    ['label-font-weight', 'font-weight-regular'],
    ['label-text-color', 'text-1'],
    ['hover-mix', 'opacity-10'],
    ['active-mix', 'opacity-20'],
    ['focus-color', 'focus-2'],
    ['focus-width', 'border-width-2'],
    ['focus-offset', 'spacing-2'],
    ['disabled-opacity', 'opacity-50'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it('draws the thumb as a shadowed circle that keeps its size, with a border only in the rail variant', () => {
    const thumb = declarationsOf(css, '.cck-switch__thumb') ?? '';
    expect(thumb).toContain('box-sizing: border-box');
    expect(thumb).toContain('border-radius: 50%');
    expect(thumb).toContain('box-shadow: var(--cck-switch-thumb-shadow)');
    expect(thumb).not.toContain('border:');
    expect(
      declarationsOf(
        css,
        '.cck-switch[data-variant=rail] > .cck-switch__label > .cck-switch__track > .cck-switch__thumb',
      ),
    ).toContain('border: var(--cck-switch-rail-thumb-border-width) solid var(--cck-switch-rail-thumb-border-color)');
    expect(declarationsOf(css, '.cck-switch[data-variant=rail]')).toContain('--cck-switch-thumb-offset: 0px');
  });

  it('drops the thumb shadow when disabled, and colours the forced-colors thumb CanvasText or GrayText', () => {
    expect(
      declarationsOf(css, `${SWITCH_DISABLED} > .cck-switch__label > .cck-switch__track > .cck-switch__thumb`),
    ).toContain('box-shadow: none');
    const forced = forcedOf(css);
    expect(forced).toMatch(/__thumb \{\s*border-color: CanvasText/);
    expect(forced).toMatch(/\[data-disabled\][^{]*__thumb \{\s*border-color: GrayText/);
  });
});
