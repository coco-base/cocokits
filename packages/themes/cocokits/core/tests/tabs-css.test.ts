import { describe, expect, it } from 'vitest';
import { read } from './css-test-helpers';

const tokensCss = read('dist', 'tokens.css');
const css = read('dist', 'components', 'tabs.css');
const source = read('src', 'styles', 'components', '_tabs.scss');
/** The selectors of every rule that names a CocoKits class. */
const selectorsOf = (text: string): string[] =>
  [...text.matchAll(/(?:^|[{}])\s*([^{}@]+?)\s*\{/g)].map((match) => match[1]).filter((s) => s.includes('.cck-'));

describe('tabs output', () => {
  it('puts the rules inside @layer cocokits, in its entry and in the whole theme', () => {
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain('.cck-tabs {');
  });

  it('emits its size tokens on the root class and never on :root', () => {
    expect(tokensCss).toContain('.cck-tabs[data-size=sm], .cck-tab-nav[data-size=sm] {');
    expect(tokensCss).toContain('.cck-tabs, .cck-tabs[data-size=md], .cck-tab-nav, .cck-tab-nav[data-size=md] {');
    const onRoot = tokensCss
      .split('  }')
      .filter((block) => block.includes(':root'))
      .join('');
    expect(onRoot).not.toContain('--cck-tabs-');
  });

  it('reads its own tokens and the geometry of the base, and every token exists in tokens.css', () => {
    const names = [...new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]))];
    expect(names.length).toBeGreaterThan(10);
    for (const name of names) {
      if (name.startsWith('--active-tab-')) continue;
      expect(name.startsWith('--cck-tabs-'), name).toBe(true);
      expect(tokensCss, name).toContain(`${name}:`);
    }
  });

  it('reads the four variables the base writes on the indicator, each with an empty fallback', () => {
    for (const name of ['left', 'top', 'width', 'height']) {
      expect(css).toContain(`var(--active-tab-${name}, 0)`);
    }
  });

  it('starts every selector with a CocoKits class and joins parts with child combinators only', () => {
    const selectors = selectorsOf(css);
    expect(selectors.length).toBeGreaterThan(10);
    for (const selector of selectors) {
      const flat = selector.replace(/\([^()]*(?:\([^()]*(?:\([^()]*\)[^()]*)*\)[^()]*)*\)/g, '()');
      for (const part of flat.split(',')) {
        const tokens = part.trim().split(/\s+/);
        expect(tokens[0], selector).toMatch(/^\.cck-/);
        tokens.forEach((token, index) => {
          if (index % 2 === 1) expect(token, selector).toMatch(/^[>~+]$/);
        });
      }
    }
  });

  it('selects state with the base attributes, never with ARIA or an unbuilt class', () => {
    expect(css).not.toMatch(/\[aria-|\[role/);
    expect(css).not.toMatch(/\.cck-tabs--|\.is-/);
  });

  it('slides the indicator only inside @media (prefers-reduced-motion: no-preference)', () => {
    const outside = css.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n {2}\}\n/, '');
    expect(css).toContain('@media (prefers-reduced-motion: no-preference)');
    expect(outside).not.toContain('transition');
  });

  it('uses :hover only to switch the slide on, never for a color', () => {
    const hovers = source.split('\n').filter((line) => line.includes(':hover'));
    expect(hovers).toHaveLength(1);
    expect(source).toContain(':where(:hover, :focus-within) > .cck-#{$block}__indicator {\n      transition:');
    expect(source).not.toMatch(/:active/);
  });

  it('keeps a marker for the selected tab in forced colors', () => {
    const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
    expect(forced).toContain('Highlight;');
    expect(forced).toContain('HighlightText');
    expect(forced).toContain('GrayText');
  });

  it('keeps the triggers at least 24px high through the size tokens', () => {
    expect(css).toContain('min-block-size: var(--cck-tabs-trigger-height)');
    for (const mode of ['sm', 'md', 'lg']) {
      const block = new RegExp(String.raw`\.cck-tabs\[data-size=${mode}\][^{]*\{([^}]*)\}`).exec(tokensCss)?.[1];
      const height = /--cck-tabs-trigger-height: var\(--cck-size-(\d+)\)/.exec(block ?? '')?.[1];
      expect(Number(height), mode).toBeGreaterThanOrEqual(24);
    }
  });
});
