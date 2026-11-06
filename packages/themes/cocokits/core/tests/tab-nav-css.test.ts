import { describe, expect, it } from 'vitest';
import { read, selectorsOf, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'tab-nav.css');

describe('tab-nav output', () => {
  it('puts the rules inside @layer cocokits, in its entry and in the whole theme', () => {
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain('.cck-tab-nav {');
  });

  it('gets the Tabs tokens on its own root class, with the same values, and never on :root', () => {
    expect(tokensCss).toContain('.cck-tabs[data-size=sm], .cck-tab-nav[data-size=sm] {');
    expect(tokensCss).toContain('.cck-tabs, .cck-tabs[data-size=md], .cck-tab-nav, .cck-tab-nav[data-size=md] {');
    expect(tokensCss).toContain('.cck-tabs, .cck-tab-nav {');
    expect(tokensCss).not.toContain('--cck-tab-nav-');
    const onRoot = tokensCss
      .split('  }')
      .filter((block) => block.includes(':root'))
      .join('');
    expect(onRoot).not.toContain('--cck-tabs-');
  });

  it('reads the Tabs tokens and the geometry of the base only, and every token exists in tokens.css', () => {
    const names = [...new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]))];
    expect(names.length).toBeGreaterThan(10);
    for (const name of names) {
      if (name.startsWith('--active-tab-')) continue;
      expect(name.startsWith('--cck-tabs-'), name).toBe(true);
      expect(tokensCss, name).toContain(`${name}:`);
    }
  });

  it('selects the active and the disabled link with the base attributes, never ARIA or an unbuilt class', () => {
    expect(css).toContain('.cck-tab-nav > .cck-tab-nav__list > .cck-tab-nav__link[data-active] {');
    expect(css).toContain('.cck-tab-nav__link[data-disabled]');
    expect(css).not.toMatch(/\[aria-|\[role|data-selected|\.cck-tab-nav--|\.is-/);
  });

  it('has no orientation rule, and no rule for the panel: it sits anywhere, so no child combinator reaches it', () => {
    expect(css).not.toContain('cck-tab-nav__panel');
    expect(css).not.toContain('data-orientation');
  });

  it('reaches the parts the author places (list, links, indicator) as direct children; link and panel mode share the rules', () => {
    for (const part of ['link', 'indicator'])
      expect(css).toContain(`.cck-tab-nav > .cck-tab-nav__list > .cck-tab-nav__${part}`);
    expect(css).not.toMatch(/\[role|\[aria-/);
  });

  it('starts every selector with a CocoKits class and joins parts with child combinators only', () => {
    const selectors = selectorsOf(css);
    expect(selectors.length).toBeGreaterThan(10);
    for (const selector of selectors) {
      const flat = selector.replace(/\([^()]*(?:\([^()]*(?:\([^()]*\)[^()]*)*\)[^()]*)*\)/g, '()');
      for (const part of flat.split(',')) {
        const tokens = part.trim().split(/\s+/);
        expect(tokens[0], selector).toMatch(/^\.cck-tab-nav/);
        tokens.forEach((token, index) => {
          if (index % 2 === 1) expect(token, selector).toMatch(/^[>~+]$/);
        });
      }
    }
  });

  it('slides the indicator only inside @media (prefers-reduced-motion: no-preference), and never colors on :hover', () => {
    const outside = css.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n {2}\}\n/, '');
    expect(css).toContain('@media (prefers-reduced-motion: no-preference)');
    expect(outside).not.toContain('transition');
    const hovers = css.split('\n').filter((line) => line.includes(':hover'));
    expect(hovers).toEqual([
      '    .cck-tab-nav > .cck-tab-nav__list:where(:hover, :focus-within) > .cck-tab-nav__indicator {',
    ]);
    expect(css).not.toMatch(/:active/);
  });

  it('reads the four variables the base writes on the indicator and keeps a marker in forced colors', () => {
    for (const name of ['left', 'top', 'width', 'height']) expect(css).toContain(`var(--active-tab-${name}, 0)`);
    const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
    for (const word of ['Highlight;', 'HighlightText', 'GrayText']) expect(forced).toContain(word);
  });

  it('removes the link underline and keeps the links at least 24px high', () => {
    expect(css).toContain('text-decoration: none');
    expect(css).toContain('min-block-size: var(--cck-tabs-trigger-height)');
  });
});
