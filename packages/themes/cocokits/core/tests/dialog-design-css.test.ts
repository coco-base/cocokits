import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, sizeTokenOf, structureTokenOf } from './css-test-helpers';

const css = read('dist', 'components', 'dialog.css');
const ROOT = '.cck-dialog__content';
const CLOSE = '.cck-dialog__close:not(.cck-button)';
const own = (name: string): string | undefined => structureTokenOf(ROOT, `dialog-${name}`);

/** The tokens of a token file whose value in some mode is not an alias, as `<collection>#<token>`. */
const rawTokens = (file: string): string[] => {
  const json = JSON.parse(read('src', 'tokens', `${file}.tokens.json`)) as {
    collections: { name: string; tokens: { name: string; valuesByMode: Record<string, unknown> }[] }[];
  };
  return json.collections.flatMap((collection) =>
    collection.tokens
      .filter((token) => Object.values(token.valuesByMode).some((value) => !/^\{[^{}#]+#[^{}]+\}$/.test(String(value))))
      .map((token) => `${collection.name}#${token.name}`),
  );
};

describe('dialog design match', () => {
  it.each([
    ['border-color', 'border-1'],
    ['radius', 'radius-xl'],
    ['shadow', 'shadow-xl'],
    ['viewport-margin', 'spacing-6'],
    ['title-font-size', 'text-lg-font-size'],
    ['title-font-weight', 'font-weight-semibold'],
    ['description-gap', 'spacing-6'],
    ['header-gap', 'spacing-4'],
    ['footer-gap', 'spacing-4'],
    ['close-size', 'size-28'],
    ['close-color', 'text-3'],
    ['close-icon-size', 'size-20'],
    ['close-padding-inline', 'size-4'],
    ['close-label-padding-inline', 'spacing-5'],
    ['close-radius', 'radius-md'],
    ['close-font-weight', 'font-weight-medium'],
    ['close-hover-color', 'text-1'],
    ['close-hover-bg', 'surface-2'],
    ['close-active-bg', 'surface-3'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it.each([['close-padding-block'], ['section-gap'], ['divider-color'], ['divider-width']])(
    'has no token %s',
    (name) => {
      expect(own(name)).toBeUndefined();
      expect(css).not.toContain(`--cck-dialog-${name}`);
    },
  );

  it.each([
    ['xs', 320, 'spacing-6', 'spacing-5'],
    ['sm', 480, 'spacing-6', 'spacing-5'],
    ['md', 576, 'spacing-7', 'spacing-6'],
    ['lg', 768, 'spacing-7', 'spacing-6'],
    ['xl', 1152, 'spacing-8', 'spacing-6'],
  ])('size %s: %ipx wide at most, padding %s and gap %s (D8r)', (mode, width, padding, gap) => {
    const size = (name: string): string | undefined => sizeTokenOf(ROOT, mode, `dialog-${name}`);
    expect(size('max-inline-size')).toBe(`${String(width)}px`);
    expect(size('padding')).toBe(ref(padding));
    expect(size('gap')).toBe(ref(gap));
  });

  it('keeps every Component value an alias, with the widths and the motion duration the only exceptions', () => {
    expect(rawTokens('dialog')).toEqual([
      'Dialog__content / Size#max-inline-size',
      'Dialog__content / Structure#motion-duration',
    ]);
    expect(own('motion-duration')).toBe('200ms');
  });

  it('keeps the viewport margin and reads the size variables', () => {
    const rule = declarationsOf(css, ROOT) ?? '';
    expect(rule).toContain('max-inline-size: var(--cck-dialog-max-inline-size)');
    expect(rule).toContain('padding: var(--cck-dialog-padding)');
    expect(rule).toContain('inline-size: calc(100% - 2 * var(--cck-dialog-viewport-margin))');
  });

  it('draws a plain Close as a borderless square of at least close-size, with its own colour, radius and icon size', () => {
    const rule = declarationsOf(css, CLOSE) ?? '';
    expect(rule).toContain('display: inline-flex');
    expect(rule).toContain('border: 0');
    expect(rule).toContain('background-color: transparent');
    expect(rule).toContain('color: var(--cck-dialog-close-color)');
    expect(rule).toContain('border-radius: var(--cck-dialog-close-radius)');
    expect(rule).toContain('min-block-size: var(--cck-dialog-close-size)');
    expect(rule).toContain('min-inline-size: var(--cck-dialog-close-size)');
    expect(rule).toContain('padding: 0 var(--cck-dialog-close-padding-inline)');
    expect(rule).toContain('font-weight: var(--cck-dialog-close-font-weight)');
    expect(rule).not.toContain('--cck-dialog-border');
    expect(rule).not.toContain('--cck-dialog-text-color');
    expect(declarationsOf(css, `${CLOSE} > .cck-svg-icon:not([data-size])`)).toContain(
      'font-size: var(--cck-dialog-close-icon-size)',
    );
    expect(declarationsOf(css, `${CLOSE}:not(:has(> *))`)).toContain(
      'padding-inline: var(--cck-dialog-close-label-padding-inline)',
    );
  });

  it('fills the Close on hover and on press, and keeps its focus ring', () => {
    const hover = declarationsOf(css, `${CLOSE}:hover`) ?? '';
    expect(hover).toContain('background-color: var(--cck-dialog-close-hover-bg)');
    expect(hover).toContain('color: var(--cck-dialog-close-hover-color)');
    const active = declarationsOf(css, `${CLOSE}:active`) ?? '';
    expect(active).toContain('background-color: var(--cck-dialog-close-active-bg)');
    expect(active).toContain('color: var(--cck-dialog-close-hover-color)');
    expect(css.indexOf(`${CLOSE}:active`)).toBeGreaterThan(css.indexOf(`${CLOSE}:hover`));
    expect(declarationsOf(css, `${CLOSE}:focus-visible`)).toContain(
      'outline: var(--cck-dialog-focus-width) solid var(--cck-dialog-focus-color)',
    );
  });
});
