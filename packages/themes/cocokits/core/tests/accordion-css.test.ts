import { describe, expect, it } from 'vitest';
import { declarationsOf, read, selectorsOf, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'accordion.css');
/** The compiled CSS drops the quotes of an attribute value. */
const trigger = '.cck-accordion > .cck-accordion__item > .cck-accordion__header > .cck-accordion__trigger';
const content = '.cck-accordion > .cck-accordion__item > .cck-accordion__content';
const indicator = `${trigger} > .cck-accordion__indicator`;
/** The built sheet also holds the SvgIcon rules (own tokens, own root); the rules below are about the accordion. */
const ownSelectors = (): string[] => selectorsOf(css).filter((selector) => !selector.startsWith('.cck-svg-icon'));
/** The text of the first block that opens with `at`, up to its closing brace at the same indent. */
const mediaBlock = (text: string, at: string): string => {
  const start = text.indexOf(at);
  const end = text.indexOf('\n  }\n', start);
  return text.slice(start, end);
};

describe('accordion output', () => {
  it('puts the rules inside @layer cocokits, in its entry and in the whole theme', () => {
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain('.cck-accordion {');
  });

  it('emits its size tokens on the root class and never on :root', () => {
    expect(tokensCss).toContain('.cck-accordion[data-size=sm] {');
    expect(tokensCss).toContain('.cck-accordion, .cck-accordion[data-size=md] {');
    const onRoot = tokensCss
      .split('  }')
      .filter((block) => block.includes(':root'))
      .join('');
    expect(onRoot).not.toContain('--cck-accordion-');
  });

  it('reads its own tokens and the size variable the base writes, and every token exists in tokens.css', () => {
    const names = [...new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]))];
    expect(names.length).toBeGreaterThan(10);
    for (const name of names) {
      // The SvgIcon rules of the entry sheet read their own tokens (svg-icon-css.test.ts).
      if (name === '--accordion-content-height' || name.startsWith('--cck-svg-icon-')) continue;
      expect(name.startsWith('--cck-accordion-'), name).toBe(true);
      expect(tokensCss, name).toContain(`${name}:`);
    }
  });

  it('starts every selector with a CocoKits class and joins parts with child or sibling combinators only', () => {
    const selectors = selectorsOf(css);
    expect(selectors.length).toBeGreaterThan(10);
    for (const selector of selectors) {
      const flat = selector.replace(/\([^()]*(?:\([^()]*\)[^()]*)*\)/g, '()');
      for (const part of flat.split(',')) {
        const tokens = part.trim().split(/\s+/);
        expect(tokens[0], selector).toMatch(/^\.cck-/);
        tokens.forEach((token, index) => {
          if (index % 2 === 1) expect(token, selector).toMatch(/^[>~+]$/);
        });
      }
    }
  });

  it('reaches the parts of its own root only: no rule starts at an item, a header, a trigger or a content', () => {
    for (const selector of ownSelectors()) {
      const flat = selector.replace(/\([^()]*\)/g, '()');
      for (const part of flat.split(',')) expect(part.trim(), selector).toMatch(/^\.cck-accordion(?![\w-])/);
    }
  });

  it('selects state with the base attributes, never with ARIA or an unbuilt class', () => {
    expect(css).not.toMatch(/\[aria-|\[role/);
    expect(css).not.toMatch(/\.cck-accordion--|\.is-/);
    expect(css).not.toMatch(/\[data-(?:variant|size|toggle-position|hide-toggle)\]:/);
  });

  it('writes the theme options on the root and styles them there, with presence booleans bare', () => {
    for (const selector of [
      '.cck-accordion[data-variant=default] > .cck-accordion__item',
      '.cck-accordion[data-variant=group]',
      '.cck-accordion[data-variant=basic]',
    ]) {
      expect(css, selector).toContain(`${selector} {`);
    }
    expect(css).toContain('.cck-accordion[data-toggle-position=before]');
    expect(css).toContain('.cck-accordion[data-hide-toggle] > .cck-accordion__item');
    expect(css).not.toContain('data-hide-toggle=');
  });

  it('sizes the indicator part that holds the theme icon, turns it when open, moves or hides it with the options', () => {
    const box = declarationsOf(css, indicator) ?? '';
    expect(box).toContain('font-size: var(--cck-accordion-icon-size)');
    expect(box).not.toMatch(/border|content:|clip-path/);
    expect(declarationsOf(css, `${trigger}[data-state=open] > .cck-accordion__indicator`)).toContain('rotate: 180deg');
    expect(css).toMatch(/\[data-toggle-position=before\][^{]*__indicator \{\s*order: -1;/);
    expect(css).toMatch(/\[data-hide-toggle\][^{]*__indicator \{\s*display: none;/);
  });

  it('draws nothing on the trigger and keeps no right-to-left rule, because the icon is symmetric', () => {
    expect(css).not.toMatch(/__trigger::after/);
    expect(ownSelectors().filter((selector) => selector.includes(':dir(rtl)'))).toEqual([]);
    expect(tokensCss).not.toContain('--cck-accordion-icon-width');
  });

  it('makes the trigger full width, at least 24px high through the size tokens, with wrapping text', () => {
    const rule = declarationsOf(css, trigger) ?? '';
    expect(rule).toContain('inline-size: 100%');
    expect(rule).toContain('min-block-size: max(24px, var(--cck-accordion-trigger-height))');
    expect(rule).toContain('text-align: start');
    expect(rule).not.toContain('white-space: nowrap');
    for (const mode of ['sm', 'md']) {
      const block = new RegExp(String.raw`\.cck-accordion\[data-size=${mode}\][^{]*\{([^}]*)\}`).exec(tokensCss)?.[1];
      const height = /--cck-accordion-trigger-height: var\(--cck-size-(\d+)\)/.exec(block ?? '')?.[1];
      expect(Number(height), mode).toBeGreaterThanOrEqual(24);
    }
  });

  it('styles focus on [data-focus-visible] and disabled on [data-disabled] only', () => {
    expect(css).toContain(`${trigger}[data-focus-visible] {`);
    expect(css).toContain(`${trigger}[data-disabled] {`);
    expect(css).not.toContain(':focus-visible');
    expect(css).not.toContain(':disabled');
    expect(css).not.toContain(':hover');
  });

  it('animates the height over the size variable, with both ends open when the variable is unset', () => {
    expect(css).toContain('@keyframes cck-accordion-open {');
    expect(css).toContain('calc(var(--accordion-content-height) * 0)');
    const open = css.slice(css.indexOf('@keyframes cck-accordion-open'), css.indexOf('@keyframes cck-accordion-close'));
    expect(open).toMatch(/from \{\s*block-size: calc\(var\(--accordion-content-height\) \* 0\);/);
    expect(open).toMatch(/to \{\s*block-size: var\(--accordion-content-height\);/);
    const close = css.slice(css.indexOf('@keyframes cck-accordion-close'));
    expect(close).toMatch(/from \{\s*block-size: var\(--accordion-content-height\);/);
    expect(close).toMatch(/to \{\s*block-size: calc\(var\(--accordion-content-height\) \* 0\);/);
  });

  it('runs the animation only under prefers-reduced-motion: no-preference, so reduced motion has none', () => {
    const motion = mediaBlock(css, '@media (prefers-reduced-motion: no-preference)');
    expect(motion).toContain(`${content}[data-state=open]`);
    expect(motion).toContain('animation: cck-accordion-open var(--cck-accordion-motion-duration)');
    expect(motion).toContain('animation: cck-accordion-close var(--cck-accordion-motion-duration)');
    expect(motion).toContain('overflow: hidden');
    const outside = css.replace(motion, '');
    expect(outside).not.toMatch(/animation:|overflow:|transition/);
  });

  it('sets no display on the content, so the native hidden hides it', () => {
    expect(declarationsOf(css, content) ?? '').not.toContain('display');
  });

  it('keeps the focus ring and lets the indicator follow the trigger color in forced colors', () => {
    const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
    expect(forced).toContain('outline-color: Highlight');
    expect(forced).toContain('GrayText');
    expect(forced).toContain('CanvasText');
    expect(css).not.toContain('forced-color-adjust');
    expect(declarationsOf(css, indicator)).not.toMatch(/(^|[\s;])color:/);
    expect(declarationsOf(css, `${trigger}[data-disabled]`)).toContain('color: var(--cck-accordion-disabled-color)');
  });
});
