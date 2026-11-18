import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, selectorsOf, sizeTokenOf, structureTokenOf, tokensCss } from './css-test-helpers';

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
    expect(box).not.toMatch(/border(?!-box)|content:|clip-path/);
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
    expect(css.match(/:hover/g)).toHaveLength(1);
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
    // The item and the group clip their rounded corners with `overflow: clip`, which is not motion.
    expect(outside).not.toMatch(/animation:|overflow: (?!clip)|transition/);
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

describe('accordion design match', () => {
  const ROOT = '.cck-accordion';
  const filled = `${ROOT}:where([data-variant=default], [data-variant=group]) > .cck-accordion__item > .cck-accordion__header > .cck-accordion__trigger`;
  const size = (mode: string, name: string): string | undefined => sizeTokenOf(ROOT, mode, `accordion-${name}`);
  const own = (name: string): string | undefined => structureTokenOf(ROOT, `accordion-${name}`);

  it.each([
    ['sm', 'size-48', 'spacing-4'],
    ['md', 'size-56', 'spacing-5'],
  ])('size %s: trigger %s high, item gap %s, medium text, padding and content space', (mode, height, gap) => {
    expect(size(mode, 'trigger-height')).toBe(ref(height));
    expect(size(mode, 'gap')).toBe(ref(gap));
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(size(mode, part), part).toBe(ref(`text-md-${part}`));
    expect(size(mode, 'trigger-padding-inline')).toBe(ref('spacing-5'));
    expect(size(mode, 'trigger-padding-inline-start')).toBe(ref('spacing-6'));
    expect(size(mode, 'content-padding-block-start')).toBe(ref('spacing-5'));
    expect(size(mode, 'content-padding-inline')).toBe(ref('spacing-6'));
    expect(size(mode, 'content-padding-block-end')).toBe(ref('spacing-7'));
  });

  it.each([
    ['radius', 'radius-md'],
    ['group-radius', 'radius-2xl'],
    ['trigger-bg', 'surface-2'],
    ['trigger-open-bg', 'surface-1'],
    ['trigger-hover-bg', 'surface-3'],
    ['trigger-disabled-bg', 'disabled-surface'],
    ['content-color', 'on-surface-1'],
    ['focus-color', 'focus-2'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it.each([
    ['sm', 'size-20'],
    ['md', 'size-24'],
    ['lg', 'size-24'],
  ])('size %s: the chevron is %s, set by the size collection', (mode, icon) => {
    expect(size(mode, 'icon-size')).toBe(ref(icon));
    expect(own('icon-size')).toBeUndefined();
  });

  it('fills its container, so opening an item never changes the width', () => {
    expect(declarationsOf(css, ROOT)).toContain('inline-size: 100%');
  });

  it('makes a closed default item as high as its size: the trigger height includes the item border', () => {
    expect(
      declarationsOf(
        css,
        `${ROOT}[data-variant=default] > .cck-accordion__item > .cck-accordion__header > .cck-accordion__trigger`,
      ),
    ).toContain(
      'min-block-size: max(24px, var(--cck-accordion-trigger-height) - 2 * var(--cck-accordion-border-width))',
    );
  });

  it('starts the label and the chevron at the start when the toggle comes before', () => {
    expect(
      declarationsOf(
        css,
        `${ROOT}[data-toggle-position=before] > .cck-accordion__item > .cck-accordion__header > .cck-accordion__trigger`,
      ),
    ).toContain('justify-content: flex-start');
    expect(own('trigger-gap')).toBe(ref('spacing-3'));
  });

  it('moves the item gap to the size collection: the structure block no longer holds it', () => {
    expect(own('gap')).toBeUndefined();
  });

  it('clips the item and the group at their rounded corners, the group with its own radius', () => {
    expect(declarationsOf(css, `${ROOT}[data-variant=default] > .cck-accordion__item`)).toContain('overflow: clip');
    const group = declarationsOf(css, `${ROOT}[data-variant=group]`) ?? '';
    expect(group).toContain('border-radius: var(--cck-accordion-group-radius)');
    expect(group).toContain('overflow: clip');
  });

  it('pads the trigger start and end apart and the content with its own inline padding', () => {
    const rule = declarationsOf(css, trigger) ?? '';
    expect(rule).toContain('padding-inline-start: var(--cck-accordion-trigger-padding-inline-start)');
    expect(rule).toContain('padding-inline-end: var(--cck-accordion-trigger-padding-inline)');
    expect(declarationsOf(css, content)).toContain('padding-inline: var(--cck-accordion-content-padding-inline)');
  });

  it('measures the space above and below the content as pseudo-elements', () => {
    expect(declarationsOf(css, `${content}::before`)).toContain(
      'block-size: var(--cck-accordion-content-padding-block-start)',
    );
    expect(declarationsOf(css, `${content}::after`)).toContain(
      'block-size: var(--cck-accordion-content-padding-block-end)',
    );
  });

  it('fills the header of default and group: closed, open, hover (not disabled), disabled, in this order', () => {
    const closed = declarationsOf(css, filled) ?? '';
    const open = declarationsOf(css, `${filled}[data-state=open]`) ?? '';
    const hover = declarationsOf(css, `${filled}:hover:not([data-disabled])`) ?? '';
    const disabled = declarationsOf(css, `${filled}[data-disabled]`) ?? '';
    expect(closed).toContain('background-color: var(--cck-accordion-trigger-bg)');
    expect(open).toContain('background-color: var(--cck-accordion-trigger-open-bg)');
    expect(hover).toContain('background-color: var(--cck-accordion-trigger-hover-bg)');
    expect(disabled).toContain('background-color: var(--cck-accordion-trigger-disabled-bg)');
    const at = (selector: string): number => css.indexOf(`${selector} {`);
    expect(at(filled)).toBeLessThan(at(`${filled}[data-state=open]`));
    expect(at(`${filled}[data-state=open]`)).toBeLessThan(at(`${filled}:hover:not([data-disabled])`));
    expect(at(`${filled}:hover:not([data-disabled])`)).toBeLessThan(at(`${filled}[data-disabled]`));
  });

  it('leaves the basic variant unfilled and gives hover no forced-colors rule', () => {
    expect(declarationsOf(css, trigger)).toContain('background-color: transparent');
    expect(css).not.toContain(
      '[data-variant=basic] > .cck-accordion__item > .cck-accordion__header > .cck-accordion__trigger:hover',
    );
    expect(css.slice(css.indexOf('@media (forced-colors: active)'))).not.toContain(':hover');
  });

  it('hides the chevron of a disabled trigger', () => {
    expect(declarationsOf(css, `${trigger}[data-disabled] > .cck-accordion__indicator`)).toContain('display: none');
  });
});
