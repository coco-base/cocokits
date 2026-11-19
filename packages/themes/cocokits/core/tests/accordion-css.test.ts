import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, selectorsOf, sizeTokenOf, structureTokenOf, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'accordion.css');
/** The compiled CSS drops the quotes of an attribute value. */
const trigger = '.cck-accordion > .cck-accordion__item > .cck-accordion__header > .cck-accordion__trigger';
const content = '.cck-accordion > .cck-accordion__item > .cck-accordion__content';
const indicator = `${trigger} > .cck-accordion__indicator`;
/** The built sheet also holds the SvgIcon rules (own tokens, own root); the rules below are about the accordion. */
const ownSelectors = (): string[] => selectorsOf(css).filter((selector) => !selector.startsWith('.cck-svg-icon'));
/** The text of every top-level block that opens with `at`, each up to its closing brace at the same indent. */
const mediaBlocks = (text: string, at: string): string[] =>
  text
    .split(at)
    .slice(1)
    .map((rest) => at + rest.slice(0, rest.indexOf('\n  }\n')));
const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
const boxed = `.cck-accordion:where([data-variant=default], [data-variant=group]) > .cck-accordion__item > .cck-accordion__header > .cck-accordion__trigger`;

/** The px value of a theme token in a density mode, following its alias chain. */
function px(name: string, density: string): number {
  const value =
    structureTokenOf(`[data-cck-spacing=${density}]`, name) ?? structureTokenOf(':root', name) ?? `missing ${name}`;
  const alias = /^var\(--cck-([\w-]+)\)$/.exec(value)?.[1];
  return alias ? px(alias, density) : Number.parseFloat(value);
}

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

  it('makes the trigger full width with wrapping text, as high as its line plus the block padding', () => {
    const rule = declarationsOf(css, trigger) ?? '';
    expect(rule).toContain('inline-size: 100%');
    expect(rule).toContain('padding-block: var(--cck-accordion-trigger-padding-block)');
    expect(rule).not.toMatch(/(^|[\s;])(min-)?block-size:/);
    expect(rule).toContain('text-align: start');
    expect(rule).not.toContain('white-space: nowrap');
  });

  // No height token exists: one line of text-sm plus twice the block padding is the target.
  it.each(['normal', 'compact', 'comfortable'])(
    'keeps every trigger at least 24px high in the %s density',
    (density) => {
      const line = px('font-size-sm', density) * px('text-sm-line-height', density);
      for (const mode of ['sm', 'md', 'lg']) {
        expect(sizeTokenOf('.cck-accordion', mode, 'accordion-line-height')).toBe(ref('text-sm-line-height'));
        const padding = /var\(--cck-([\w-]+)\)/.exec(
          sizeTokenOf('.cck-accordion', mode, 'accordion-trigger-padding-block') ?? '',
        )?.[1];
        expect(line + 2 * px(padding ?? 'missing', density), mode).toBeGreaterThanOrEqual(24);
      }
    },
  );

  it('styles focus on [data-focus-visible] and disabled on [data-disabled] only', () => {
    expect(css).toContain(`${trigger}[data-focus-visible] {`);
    expect(css).toContain(`${trigger}[data-disabled] {`);
    expect(css).not.toContain(':focus-visible');
    expect(css).not.toContain(':disabled');
    const hovers = css.match(/[^\s]*:hover[^\s]*/g) ?? [];
    expect(hovers).toHaveLength(2);
    for (const hover of hovers) expect(hover).toContain(':hover:not([data-disabled])');
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
    const blocks = mediaBlocks(css, '@media (prefers-reduced-motion: no-preference)');
    const motion = blocks.join('\n');
    expect(declarationsOf(motion, `${content}[data-state=open]`)).toContain(
      'animation: cck-accordion-open var(--cck-accordion-motion-duration) ease',
    );
    expect(declarationsOf(motion, `${content}[data-state=closed]`)).toContain(
      'animation: cck-accordion-close var(--cck-accordion-motion-duration) ease forwards',
    );
    expect(declarationsOf(motion, content)).toContain('overflow-y: clip');
    const turn = declarationsOf(blocks.at(-1) ?? '', indicator) ?? '';
    expect(turn).toContain('transition-property: color, rotate');
    expect(turn).toContain('transition-duration: 150ms, var(--cck-accordion-motion-duration)');
    const outside = blocks.reduce((sheet, block) => sheet.replace(block, ''), css);
    // The item and the group clip their rounded corners with `overflow: clip`, which is not motion.
    expect(outside).not.toMatch(/animation:|overflow: (?!clip)|transition/);
  });

  it('sets no display on the content, so the native hidden hides it', () => {
    expect(declarationsOf(css, content) ?? '').not.toContain('display');
  });

  it('keeps the focus ring, a GrayText disabled trigger and CanvasText borders in forced colors', () => {
    expect(declarationsOf(forced, `${trigger}[data-focus-visible]`)).toContain('outline-color: Highlight');
    const disabled = declarationsOf(forced, `${trigger}[data-disabled]`) ?? '';
    expect(disabled).toContain('color: GrayText');
    expect(disabled).toContain('opacity: 1');
    expect(forced).toContain('border-color: CanvasText');
    expect(css).not.toContain('forced-color-adjust');
    const rest = declarationsOf(css, `${trigger}[data-disabled]`) ?? '';
    expect(rest).toContain('opacity: var(--cck-accordion-disabled-opacity)');
    expect(rest).toContain('cursor: not-allowed');
  });

  // Forced colors replace an author colour with CanvasText, so a chevron with its own colour no longer follows the
  // GrayText of its disabled trigger unless a forced-colors rule gives it one.
  it('lets the chevron of a disabled trigger follow the GrayText of the trigger in forced colors', () => {
    const own = /(^|[\s;])color:/.test(declarationsOf(css, indicator) ?? '');
    const followed = /(^|[\s;])color: (GrayText|inherit|currentColor)/.test(
      declarationsOf(forced, `${trigger}[data-disabled] > .cck-accordion__indicator`) ?? '',
    );
    expect(!own || followed).toBe(true);
  });

  it.each([
    ['root', '.cck-accordion'],
    ['item', '.cck-accordion > .cck-accordion__item'],
  ])('restates [hidden] on the %s, because it sets display', (_part, selector) => {
    expect(declarationsOf(css, `${selector}[hidden]`)).toContain('display: none');
  });
});

describe('accordion design match', () => {
  const ROOT = '.cck-accordion';
  const size = (mode: string, name: string): string | undefined => sizeTokenOf(ROOT, mode, `accordion-${name}`);
  const own = (name: string): string | undefined => structureTokenOf(ROOT, `accordion-${name}`);

  it.each([
    ['sm', 'spacing-5', 'spacing-5', 'spacing-5'],
    ['md', 'spacing-6', 'spacing-6', 'spacing-6'],
    ['lg', 'spacing-7', 'spacing-6', 'spacing-6'],
  ])('size %s: trigger padding %s, inline padding %s, content end space %s, text-sm', (mode, block, inline, end) => {
    expect(size(mode, 'trigger-padding-block')).toBe(ref(block));
    expect(size(mode, 'padding-inline')).toBe(ref(inline));
    expect(size(mode, 'content-padding-block-start')).toBe(ref('spacing-3'));
    expect(size(mode, 'content-padding-block-end')).toBe(ref(end));
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(size(mode, part), part).toBe(ref(`text-sm-${part}`));
  });

  it.each([
    'trigger-height',
    'trigger-padding-inline',
    'trigger-padding-inline-start',
    'content-padding-inline',
    'gap',
  ])('has no size token %s any more', (name) => {
    for (const mode of ['sm', 'md', 'lg']) expect(size(mode, name), mode).toBeUndefined();
  });

  it.each([
    ['gap', 'spacing-4'],
    ['radius', 'radius-lg'],
    ['border-width', 'border-width-1'],
    ['border-color', 'border-1'],
    ['bg', 'surface-1'],
    ['basic-trigger-radius', 'radius-sm'],
    ['trigger-gap', 'spacing-4'],
    ['trigger-font-weight', 'font-weight-medium'],
    ['trigger-color', 'text-1'],
    ['trigger-hover-bg', 'surface-2'],
    ['icon-color', 'text-3'],
    ['content-color', 'text-2'],
    ['disabled-opacity', 'opacity-50'],
    ['focus-color', 'focus-2'],
    ['focus-width', 'border-width-2'],
    ['focus-offset', 'spacing-2'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it.each(['group-radius', 'trigger-bg', 'trigger-open-bg', 'trigger-disabled-bg', 'disabled-color'])(
    'has no structure token %s any more',
    (name) => {
      expect(own(name)).toBeUndefined();
    },
  );

  it.each(['sm', 'md', 'lg'])('size %s: the chevron is size-16, set by the size collection', (mode) => {
    expect(size(mode, 'icon-size')).toBe(ref('size-16'));
    expect(own('icon-size')).toBeUndefined();
  });

  it('fills its container, so opening an item never changes the width', () => {
    expect(declarationsOf(css, ROOT)).toContain('inline-size: 100%');
  });

  it('starts the label at the start, the chevron at the end, and before the label when the toggle comes before', () => {
    expect(declarationsOf(css, trigger)).toContain('justify-content: flex-start');
    expect(declarationsOf(css, indicator)).toContain('margin-inline-start: auto');
    const before = declarationsOf(
      css,
      `${ROOT}[data-toggle-position=before] > .cck-accordion__item > .cck-accordion__header > .cck-accordion__trigger > .cck-accordion__indicator`,
    );
    expect(before).toContain('order: -1');
    expect(before).toContain('margin-inline-start: 0');
    expect(declarationsOf(css, trigger)).toContain('gap: var(--cck-accordion-trigger-gap)');
  });

  it('keeps the item gap in the structure collection, and the group and basic variants without it', () => {
    expect(declarationsOf(css, ROOT)).toContain('gap: var(--cck-accordion-gap)');
    expect(declarationsOf(css, `${ROOT}[data-variant=group]`)).toContain('gap: 0');
    expect(declarationsOf(css, `${ROOT}[data-variant=basic]`)).toContain('gap: 0');
  });

  it('clips the item and the group at their rounded corners, both with the radius token', () => {
    const item = declarationsOf(css, `${ROOT}[data-variant=default] > .cck-accordion__item`) ?? '';
    expect(item).toContain('border-radius: var(--cck-accordion-radius)');
    expect(item).toContain('overflow: clip');
    const group = declarationsOf(css, `${ROOT}[data-variant=group]`) ?? '';
    expect(group).toContain('border-radius: var(--cck-accordion-radius)');
    expect(group).toContain('overflow: clip');
  });

  it('rounds a boxed trigger inside its box, square at the end of an open default item', () => {
    const inner = 'calc(var(--cck-accordion-radius) - var(--cck-accordion-border-width))';
    const item = `${ROOT}[data-variant=default] > .cck-accordion__item > .cck-accordion__header > .cck-accordion__trigger`;
    expect(declarationsOf(css, item)).toContain(`border-radius: ${inner}`);
    const open = declarationsOf(css, `${item}[data-state=open]`) ?? '';
    expect(open).toContain('border-end-start-radius: 0');
    expect(open).toContain('border-end-end-radius: 0');
    expect(declarationsOf(css, trigger)).toContain('border-radius: var(--cck-accordion-basic-trigger-radius)');
  });

  it('pads a boxed trigger and its content with the inline padding, and basic not at all', () => {
    expect(declarationsOf(css, trigger)).toContain('padding-inline: 0');
    expect(declarationsOf(css, boxed)).toContain('padding-inline: var(--cck-accordion-padding-inline)');
    expect(
      declarationsOf(
        css,
        `${ROOT}:where([data-variant=default], [data-variant=group]) > .cck-accordion__item > .cck-accordion__content`,
      ),
    ).toContain('padding-inline: var(--cck-accordion-padding-inline)');
  });

  it('measures the space above and below the content as pseudo-elements', () => {
    expect(declarationsOf(css, `${content}::before`)).toContain(
      'block-size: var(--cck-accordion-content-padding-block-start)',
    );
    expect(declarationsOf(css, `${content}::after`)).toContain(
      'block-size: var(--cck-accordion-content-padding-block-end)',
    );
  });

  it('fills a boxed trigger only on hover, never when disabled, and tints the chevron on hover', () => {
    expect(declarationsOf(css, `${boxed}:hover:not([data-disabled])`)).toContain(
      'background-color: var(--cck-accordion-trigger-hover-bg)',
    );
    expect(declarationsOf(css, `${trigger}:hover:not([data-disabled]) > .cck-accordion__indicator`)).toContain(
      'color: var(--cck-accordion-trigger-color)',
    );
    expect(declarationsOf(css, indicator)).toContain('color: var(--cck-accordion-icon-color)');
    for (const state of ['[data-state=open]', '[data-disabled]']) {
      expect(declarationsOf(css, `${boxed}${state}`) ?? '', state).not.toContain('background-color');
    }
  });

  it('leaves the basic variant unfilled and gives hover no forced-colors rule', () => {
    expect(declarationsOf(css, trigger)).toContain('background-color: transparent');
    expect(css).not.toContain(
      '[data-variant=basic] > .cck-accordion__item > .cck-accordion__header > .cck-accordion__trigger:hover',
    );
    expect(forced).not.toContain(':hover');
  });

  it('draws the focus ring outside a basic trigger and inside a boxed one', () => {
    expect(declarationsOf(css, `${trigger}[data-focus-visible]`)).toContain(
      'outline-offset: var(--cck-accordion-focus-offset)',
    );
    expect(declarationsOf(css, `${boxed}[data-focus-visible]`)).toContain(
      'outline-offset: calc(-1 * var(--cck-accordion-focus-width))',
    );
  });
});
