import { describe, expect, it } from 'vitest';
import { declarationsOf, read, selectorsOf, tokensCss } from './css-test-helpers';

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
      const size = /--cck-icon-button-size: var\(--cck-size-(\d+)\)/.exec(block ?? '')?.[1];
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
    expect(declarationsOf(css, `${ROOT}[data-variant=light]`)).toContain('var(--cck-icon-button-soft-bg)');
    expect(declarationsOf(css, `${ROOT}[data-variant=basic]`)).toContain('var(--cck-icon-button-soft-icon-color)');
    expect(declarationsOf(css, `${ROOT}[data-rounded]`)).toContain(
      'border-radius: var(--cck-icon-button-radius-rounded)',
    );
  });

  it('styles disabled for the attribute and for a disabled fieldset, after the variants', () => {
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

  it('changes no color on hover or press, and reaches no part but its own root', () => {
    expect(own).not.toMatch(/:hover|:active/);
    for (const selector of selectorsOf(own)) expect(selector, selector).toMatch(/^\.cck-icon-button(?![\w-])/);
  });

  it('uses no color literal, no !important and no physical property', () => {
    expect(own).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|oklch\(|!important/i);
    expect(own).not.toMatch(
      /(^|[\s{;])(left|right|width|height|margin-left|margin-right|padding-left|padding-right)\s*:/,
    );
  });
});
