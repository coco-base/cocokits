import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, selectorsOf, sizeTokenOf, structureTokenOf, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'icon-button.css');
/** The rules of the IconButton itself: the entry sheet also holds the SvgIcon rules (svg-icon-css.test.ts). */
const own = css.slice(0, css.indexOf('.cck-svg-icon'));
const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
const ROOT = '.cck-icon-button';

describe('icon-button output', () => {
  it('puts the rules inside @layer cocokits, in its entry and in the whole theme', () => {
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain(`${ROOT} {`);
  });

  it('emits the size modes on the class, the structure on the class, and nothing on :root', () => {
    for (const mode of ['sm', 'lg']) expect(tokensCss).toContain(`${ROOT}[data-size=${mode}] {`);
    expect(tokensCss).toContain(`${ROOT}, ${ROOT}[data-size=md] {`);
    const onRoot = tokensCss
      .split('  }')
      .filter((block) => block.includes(':root'))
      .join('');
    expect(onRoot).not.toContain('--cck-icon-button');
  });

  it('sizes a square from the size tokens, at least 24 by 24 CSS px, and sets the icon size as its font size', () => {
    const rule = declarationsOf(css, ROOT) ?? '';
    expect(rule).toContain('inline-size: var(--cck-icon-button-size)');
    expect(rule).toContain('block-size: var(--cck-icon-button-size)');
    expect(rule).toContain('font-size: var(--cck-icon-button-icon-size)');
    for (const mode of ['sm', 'md', 'lg']) {
      const block = new RegExp(
        String.raw`\.cck-icon-button(?:, \.cck-icon-button)?\[data-size=${mode}\] \{([^}]*)\}`,
      ).exec(tokensCss)?.[1];
      const size = /--cck-icon-button-size: (?:var\(--cck-size-)?(\d+)/.exec(block ?? '')?.[1];
      expect(Number(size), mode).toBeGreaterThanOrEqual(24);
    }
  });

  it('reads only its own tokens, and every one exists in tokens.css (the SvgIcon rules read theirs)', () => {
    const names = [...new Set([...own.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]))];
    expect(names.length).toBeGreaterThan(10);
    for (const name of names) {
      expect(name.startsWith('--cck-icon-button-'), name).toBe(true);
      expect(tokensCss, name).toContain(`${name}:`);
    }
  });

  it('draws the Button variants, with the rounded radius from data-rounded', () => {
    expect(declarationsOf(css, `${ROOT}[data-variant=primary]`)).toContain('var(--cck-icon-button-solid-bg)');
    expect(declarationsOf(css, `${ROOT}[data-variant=outline]`)).toContain(
      'border-color: var(--cck-icon-button-border-color)',
    );
    expect(css).not.toContain('data-variant=light');
    for (const variant of ['outline', 'basic'])
      expect(declarationsOf(css, `${ROOT}[data-variant=${variant}]`)).toContain(
        'color: var(--cck-icon-button-outline-icon-color)',
      );
    expect(structureTokenOf(ROOT, 'icon-button-outline-icon-color')).toBe(ref('color'));
    expect(declarationsOf(css, ROOT)).not.toContain('line-height');
    expect(declarationsOf(css, `${ROOT}[data-variant=primary]:hover:not([data-disabled], :disabled)`)).toContain(
      'background-color: var(--cck-icon-button-solid-hover-bg)',
    );
    expect(structureTokenOf(ROOT, 'icon-button-solid-hover-bg')).toBe(ref('container'));
    expect(declarationsOf(css, `${ROOT}[data-rounded]`)).toContain(
      'border-radius: var(--cck-icon-button-radius-rounded)',
    );
  });

  it('styles disabled for the attribute and a disabled fieldset, after the variants', () => {
    const rule = /\.cck-icon-button\[data-disabled\],\s*\.cck-icon-button:disabled\s*\{([^}]*)\}/.exec(css);
    expect(rule?.[1]).toContain('color: var(--cck-icon-button-disabled-icon-color)');
    expect(rule?.[1]).toContain('background-color: var(--cck-icon-button-disabled-bg)');
    expect(rule?.index).toBeGreaterThan(css.indexOf(`${ROOT}[data-variant=basic]`));
  });

  it('rings the focus with :focus-visible', () => {
    expect(declarationsOf(css, `${ROOT}:focus-visible`)).toContain('outline: var(--cck-icon-button-focus-width) solid');
  });

  it('has the forced-colors rules of the Button: ButtonText border, GrayText disabled, Highlight focus', () => {
    expect(forced).toMatch(/\.cck-icon-button\[data-variant\] \{\s*border-color: ButtonText/);
    expect(forced).toMatch(
      /\[data-disabled\],\s*\.cck-icon-button\[data-variant\]:disabled \{\s*border-color: GrayText;\s*color: GrayText/,
    );
    expect(forced).toMatch(/:focus-visible \{\s*outline-color: Highlight/);
  });

  it('tints only the outline and basic variants on hover, changes no color on press, and reaches no part but its own root', () => {
    expect(own.match(/:hover/g)).toHaveLength(2);
    expect(own).not.toMatch(/:active/);
    for (const selector of selectorsOf(own)) expect(selector, selector).toMatch(/^\.cck-icon-button(?![\w-])/);
  });

  it('uses no color literal, no !important and no physical property', () => {
    expect(own).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|oklch\(|!important/i);
    expect(own).not.toMatch(
      /(^|[\s{;])(left|right|width|height|margin-left|margin-right|padding-left|padding-right)\s*:/,
    );
  });

  it('restates [hidden] on the box it sets to display', () => {
    expect(own).toMatch(/\.cck-icon-button\[hidden\]\s*\{\s*display: none/);
  });
});

describe('icon-button design match', () => {
  const sizes = [
    ['sm', 'size-36', 'size-20'],
    ['md', 'size-44', 'size-24'],
    ['lg', 'size-52', 'size-32'],
  ] as const;

  it.each(sizes)('size %s: the square and the icon', (mode, size, icon) => {
    const at = (name: string): string | undefined => sizeTokenOf(ROOT, mode, name);
    expect(at('icon-button-size')).toBe(ref(size));
    expect(at('icon-button-icon-size')).toBe(ref(icon));
  });

  it('fills the outline with surface/1 and the hover with surface/2', () => {
    expect(structureTokenOf(ROOT, 'icon-button-outline-bg')).toBe(ref('surface-1'));
    expect(structureTokenOf(ROOT, 'icon-button-hover-bg')).toBe(ref('surface-2'));
    expect(declarationsOf(css, `${ROOT}[data-variant=outline]`)).toContain(
      'background-color: var(--cck-icon-button-outline-bg)',
    );
  });

  it('tints outline and basic on hover after the variants, never a disabled one, with no forced-colors rule', () => {
    const selector = `${ROOT}:where([data-variant=outline], [data-variant=basic]):hover:not([data-disabled], :disabled)`;
    expect(declarationsOf(css, selector)).toContain('background-color: var(--cck-icon-button-hover-bg)');
    expect(css.indexOf(':hover')).toBeGreaterThan(css.indexOf(`${ROOT}[data-variant=basic]`));
    expect(css.indexOf(':hover')).toBeLessThan(css.indexOf('[data-disabled],'));
    expect(forced).not.toContain(':hover');
  });
});
