import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, selectorsOf, sizeTokenOf, structureTokenOf, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'tabs.css');
const source = read('src', 'styles', 'components', '_tabs.scss');

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

  it('uses :hover to switch the slide on and for the hover fill of the block variants', () => {
    const hovers = source.split('\n').filter((line) => line.includes(':hover'));
    expect(hovers).toHaveLength(2);
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

describe('tabs design match', () => {
  const ROOT = '.cck-tabs';
  const size = (mode: string, name: string): string | undefined => sizeTokenOf(ROOT, mode, `tabs-${name}`);
  const own = (name: string): string | undefined => structureTokenOf(ROOT, `tabs-${name}`);
  const triggers = '.cck-tabs > .cck-tabs__list > .cck-tabs__trigger';
  const navCss = read('dist', 'components', 'tab-nav.css');

  it.each([
    ['sm', 'size-32', 'spacing-5', 'text-sm'],
    ['md', 'size-40', 'spacing-5', 'text-md'],
    ['lg', 'size-40', 'spacing-7', 'text-md'],
  ])('size %s: trigger %s high, padding %s, label %s from one text group', (mode, height, padding, text) => {
    expect(size(mode, 'trigger-height')).toBe(ref(height));
    expect(size(mode, 'trigger-padding-inline')).toBe(ref(padding));
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(size(mode, `label-${part}`), part).toBe(ref(`${text}-${part}`));
  });

  it.each([
    ['gap', 'spacing-0'],
    ['list-gap', 'spacing-0'],
    ['panel-padding', 'spacing-6'],
    ['list-radius', 'radius-xl'],
    ['list-border-radius', 'radius-2xl'],
    ['trigger-radius', 'radius-xl'],
    ['label-font-weight', 'font-weight-regular'],
    ['label-color', 'on-surface-3'],
    ['fill-label-color', 'text-2'],
    ['hover-bg', 'surface-3'],
    ['hover-label-color', 'text-2'],
    ['focus-color', 'brand-on-container'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it('rounds the border list with its own radius and the fill list with the list radius', () => {
    expect(declarationsOf(css, `${ROOT}[data-variant=border] > .cck-tabs__list`)).toContain(
      'border-radius: var(--cck-tabs-list-border-radius)',
    );
    expect(declarationsOf(css, `${ROOT}[data-variant=fill] > .cck-tabs__list`)).toContain(
      'border-radius: var(--cck-tabs-list-radius)',
    );
  });

  it('colours the fill label before the selected rule, so the selected label wins', () => {
    const fill = `${ROOT}[data-variant=fill] > .cck-tabs__list > .cck-tabs__trigger`;
    expect(declarationsOf(css, fill)).toContain('color: var(--cck-tabs-fill-label-color)');
    expect(css.indexOf(`${fill} {`)).toBeLessThan(css.indexOf(`${triggers}[data-selected] {`));
  });

  it.each([
    ['tabs', 'trigger', 'data-selected', css],
    ['tab-nav', 'link', 'data-active', navCss],
  ])('hovers the %s %s in the block variants only, never selected or disabled', (block, part, selected, sheet) => {
    const selector = `.cck-${block}:is([data-variant=border], [data-variant=fill], [data-variant=basic]) > .cck-${block}__list > .cck-${block}__${part}:hover:not([${selected}], [data-disabled], :disabled)`;
    const rule = declarationsOf(sheet, selector) ?? '';
    expect(rule).toContain('background-color: var(--cck-tabs-hover-bg)');
    expect(rule).toContain('color: var(--cck-tabs-hover-label-color)');
    expect(sheet.indexOf(`${selector} {`)).toBeGreaterThan(sheet.indexOf(`[data-disabled],`));
  });

  it('gives hover no forced-colors rule, and pads the Tabs panel only', () => {
    expect(css.slice(css.indexOf('@media (forced-colors: active)'))).not.toContain(':hover');
    expect(declarationsOf(css, '.cck-tabs > .cck-tabs__panel')).toContain('padding: var(--cck-tabs-panel-padding)');
    expect(navCss).not.toContain('panel-padding');
  });
});
