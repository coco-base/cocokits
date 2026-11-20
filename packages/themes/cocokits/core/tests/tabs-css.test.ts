import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, selectorsOf, sizeTokenOf, structureTokenOf, tokensCss } from './css-test-helpers';

const css = read('dist', 'components', 'tabs.css');
const source = read('src', 'styles', 'components', '_tabs.scss');
const forced = css.slice(css.indexOf('@media (forced-colors: active)'));

/** The rules of the sheet outside every `prefers-reduced-motion: no-preference` block. */
const withoutMotion = (sheet: string): string =>
  sheet.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n {2}\}\n/g, '');

/** The px value of a theme token in a density mode, following its alias chain. */
function px(name: string, density: string): number {
  const value =
    structureTokenOf(`[data-cck-spacing=${density}]`, name) ?? structureTokenOf(':root', name) ?? `missing ${name}`;
  const alias = /^var\(--cck-([\w-]+)\)$/.exec(value)?.[1];
  return alias ? px(alias, density) : Number.parseFloat(value);
}

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

  it('reads its own tokens, the geometry of the base and private properties it sets itself', () => {
    const names = [...new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]))];
    expect(names.length).toBeGreaterThan(10);
    for (const name of names) {
      if (name.startsWith('--active-tab-')) continue;
      if (name.startsWith('--_')) {
        expect(css, name).toContain(`${name}:`);
        continue;
      }
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

  it('slides the indicator and fades the label only inside @media (prefers-reduced-motion: no-preference)', () => {
    expect(css).toContain('@media (prefers-reduced-motion: no-preference)');
    expect(withoutMotion(css)).not.toContain('transition');
    expect(css).toMatch(
      /\.cck-tabs > \.cck-tabs__list:where\(:hover, :focus-within\) > \.cck-tabs__indicator \{\s*transition: translate var\(--cck-tabs-motion-duration\) ease, inline-size/,
    );
    expect(declarationsOf(css, '.cck-tabs > .cck-tabs__list > .cck-tabs__trigger')).not.toContain('transition');
    expect(css).toContain('transition-property: color;');
  });

  it('uses :hover to colour the label of an enabled tab and to switch the slide on, with no pressed look', () => {
    const hovers = source.split('\n').filter((line) => line.includes(':hover'));
    expect(hovers).toHaveLength(2);
    expect(source).toContain('#{$trigger}:hover:not([data-disabled], :disabled) {');
    expect(source).toContain(':where(:hover, :focus-within) > .cck-#{$block}__indicator {\n      transition:');
    expect(source).not.toMatch(/:active/);
    expect(
      declarationsOf(css, '.cck-tabs > .cck-tabs__list > .cck-tabs__trigger:hover:not([data-disabled], :disabled)'),
    ).toMatch(/^\s*color: var\(--cck-tabs-hover-label-color\);\s*$/);
  });

  it('keeps a marker for the selected tab in forced colors', () => {
    expect(forced).toContain('Highlight;');
    expect(forced).toContain('HighlightText');
    expect(forced).toContain('GrayText');
  });

  it('sizes the triggers from the control height, less the inset of a boxed list', () => {
    expect(declarationsOf(css, '.cck-tabs > .cck-tabs__list > .cck-tabs__trigger')).toContain(
      'min-block-size: calc(var(--cck-tabs-height) - 2 * var(--_inset, 0px))',
    );
    expect(declarationsOf(css, '.cck-tabs[data-variant=border] > .cck-tabs__list')).toContain(
      '--_inset: calc(var(--cck-tabs-list-padding) + var(--cck-tabs-list-border-width))',
    );
    expect(declarationsOf(css, '.cck-tabs[data-variant=fill] > .cck-tabs__list')).toContain(
      '--_inset: var(--cck-tabs-list-padding)',
    );
    for (const mode of ['sm', 'md', 'lg']) {
      expect(sizeTokenOf('.cck-tabs', mode, 'tabs-height')).toBe(ref(`control-${mode}`));
    }
  });

  // The trigger is the target: control height less twice the inset of the list (padding, plus the border in border).
  // The `sm` triggers in SHORT are under 24px. A horizontal tab still passes WCAG 2.5.8 on the spacing exception,
  // because it is at least 24px wide; a vertical Compact `border` list does not.
  const SHORT = new Set(['border sm normal', 'border sm compact', 'border sm comfortable', 'fill sm compact']);
  it.each(['normal', 'compact', 'comfortable'])(
    'keeps every trigger at least 24px high in the %s density',
    (density) => {
      const padding = px('spacing-3', density);
      const border = px('border-width-1', density);
      const insets = { border: padding + border, fill: padding, line: 0, basic: 0 };
      const short: string[] = [];
      for (const mode of ['sm', 'md', 'lg']) {
        for (const [variant, inset] of Object.entries(insets)) {
          const height = px(`control-${mode}`, density) - 2 * inset;
          if (height < 24 && !SHORT.has(`${variant} ${mode} ${density}`))
            short.push(`${variant} ${mode}: ${String(height)}px`);
        }
      }
      expect(short).toEqual([]);
    },
  );

  it.each([
    ['root', '.cck-tabs'],
    ['list', '.cck-tabs > .cck-tabs__list'],
    ['trigger', '.cck-tabs > .cck-tabs__list > .cck-tabs__trigger'],
    ['trigger label', '.cck-tabs > .cck-tabs__list > .cck-tabs__trigger > .cck-tabs__trigger-label'],
    ['panel', '.cck-tabs__panel'],
  ])('restates [hidden] on the %s, because it sets display', (_part, selector) => {
    expect(declarationsOf(css, selector)).toMatch(/display:\s*(inline-)?(flex|block)/);
    expect(declarationsOf(css, `${selector}[hidden]`)).toContain('display: none');
  });
});

describe('tabs design match', () => {
  const ROOT = '.cck-tabs';
  const size = (mode: string, name: string): string | undefined => sizeTokenOf(ROOT, mode, `tabs-${name}`);
  const own = (name: string): string | undefined => structureTokenOf(ROOT, `tabs-${name}`);
  const triggers = '.cck-tabs > .cck-tabs__list > .cck-tabs__trigger';
  const navCss = read('dist', 'components', 'tab-nav.css');

  it.each([
    ['sm', 'control-sm', 'spacing-4'],
    ['md', 'control-md', 'spacing-5'],
    ['lg', 'control-lg', 'spacing-6'],
  ])('size %s: height %s, trigger padding %s, label text-sm from one text group', (mode, height, padding) => {
    expect(size(mode, 'height')).toBe(ref(height));
    expect(size(mode, 'trigger-height')).toBeUndefined();
    expect(size(mode, 'trigger-padding-inline')).toBe(ref(padding));
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing'])
      expect(size(mode, `label-${part}`), part).toBe(ref(`text-sm-${part}`));
  });

  it.each([
    ['gap', 'spacing-6'],
    ['list-gap', 'spacing-2'],
    ['list-padding', 'spacing-3'],
    ['list-radius', 'radius-md'],
    ['vertical-list-radius', 'radius-lg'],
    ['list-border-width', 'border-width-1'],
    ['list-border-color', 'border-2'],
    ['border-list-shadow', 'shadow-xs'],
    ['list-bg', 'surface-2'],
    ['line-width', 'border-width-1'],
    ['line-color', 'border-1'],
    ['trigger-radius', 'radius-sm'],
    ['basic-trigger-radius', 'radius-md'],
    ['trigger-gap', 'spacing-4'],
    ['label-font-weight', 'font-weight-medium'],
    ['label-color', 'text-3'],
    ['hover-label-color', 'text-1'],
    ['selected-label-color', 'text-1'],
    ['indicator-bg', 'container'],
    ['fill-indicator-bg', 'surface-1'],
    ['fill-indicator-shadow', 'shadow-sm'],
    ['indicator-line-width', 'border-width-2'],
    ['indicator-line-color', 'color'],
    ['indicator-line-neutral-color', 'text-1'],
    ['disabled-opacity', 'opacity-50'],
    ['focus-color', 'focus-2'],
    ['focus-width', 'border-width-2'],
    ['focus-offset', 'spacing-2'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it.each(['panel-padding', 'list-border-radius', 'fill-label-color', 'disabled-bg', 'disabled-label-color'])(
    'has no token %s any more',
    (name) => {
      expect(own(name)).toBeUndefined();
    },
  );

  it('rounds both boxed lists with the list radius, and a vertical boxed list with its own radius', () => {
    for (const variant of ['border', 'fill']) {
      expect(declarationsOf(css, `${ROOT}[data-variant=${variant}] > .cck-tabs__list`)).toContain(
        'border-radius: var(--_list-radius, var(--cck-tabs-list-radius))',
      );
    }
    expect(
      declarationsOf(
        css,
        `${ROOT}:is([data-variant=border], [data-variant=fill])[data-orientation=vertical] > .cck-tabs__list`,
      ),
    ).toContain('--_list-radius: var(--cck-tabs-vertical-list-radius)');
  });

  it('keeps the trigger and the indicator of a boxed list concentric with it, and basic on its own radius', () => {
    expect(
      declarationsOf(
        css,
        `${ROOT}:is([data-variant=border], [data-variant=fill]) > .cck-tabs__list > :is(.cck-tabs__trigger, .cck-tabs__indicator)`,
      ),
    ).toContain(
      'border-radius: max(var(--cck-tabs-trigger-radius), var(--_list-radius, var(--cck-tabs-list-radius)) - var(--_inset))',
    );
    expect(
      declarationsOf(
        css,
        `${ROOT}[data-variant=basic] > .cck-tabs__list > :is(.cck-tabs__trigger, .cck-tabs__indicator)`,
      ),
    ).toContain('border-radius: var(--cck-tabs-basic-trigger-radius)');
  });

  it('draws the border list with a border and a shadow, the fill indicator as a card, the line as an inset shadow', () => {
    const border = declarationsOf(css, `${ROOT}[data-variant=border] > .cck-tabs__list`) ?? '';
    expect(border).toContain('border: var(--cck-tabs-list-border-width) solid var(--cck-tabs-list-border-color)');
    expect(border).toContain('box-shadow: var(--cck-tabs-border-list-shadow)');
    const card = declarationsOf(css, `${ROOT}[data-variant=fill] > .cck-tabs__list > .cck-tabs__indicator`) ?? '';
    expect(card).toContain('background-color: var(--cck-tabs-fill-indicator-bg)');
    expect(card).toContain('box-shadow: var(--cck-tabs-fill-indicator-shadow)');
    expect(declarationsOf(css, `${ROOT}[data-variant=line] > .cck-tabs__list`)).toContain(
      'box-shadow: inset 0 calc(-1 * var(--cck-tabs-line-width)) 0 var(--cck-tabs-line-color)',
    );
    const vertical = `${ROOT}[data-variant=line][data-orientation=vertical] > .cck-tabs__list`;
    expect(declarationsOf(css, vertical)).toContain(
      'box-shadow: inset calc(-1 * var(--cck-tabs-line-width)) 0 0 var(--cck-tabs-line-color)',
    );
    expect(declarationsOf(css, `${vertical}:dir(rtl)`)).toContain(
      'box-shadow: inset var(--cck-tabs-line-width) 0 0 var(--cck-tabs-line-color)',
    );
  });

  it('colours the label at rest, then the selected label after the hover rule, so it wins', () => {
    expect(declarationsOf(css, triggers)).toContain('color: var(--cck-tabs-label-color)');
    expect(declarationsOf(css, `${triggers}[data-selected]`)).toContain('color: var(--cck-tabs-selected-label-color)');
    expect(css.indexOf(`${triggers}:hover:not([data-disabled], :disabled) {`)).toBeLessThan(
      css.indexOf(`${triggers}[data-selected] {`),
    );
  });

  it.each([
    ['tabs', 'trigger', 'data-selected', css],
    ['tab-nav', 'link', 'data-active', navCss],
  ])('gives the %s %s a hover label, the pointer cursor and a faded disabled state', (block, part, selected, sheet) => {
    const trigger = `.cck-${block} > .cck-${block}__list > .cck-${block}__${part}`;
    expect(sheet).not.toContain('hover-bg');
    expect(declarationsOf(sheet, `${trigger}:hover:not([data-disabled], :disabled)`)).toContain(
      'color: var(--cck-tabs-hover-label-color)',
    );
    expect(declarationsOf(sheet, trigger)).toContain('cursor: pointer');
    const disabled = declarationsOf(sheet, `${trigger}[data-disabled],\n  ${trigger}:disabled`) ?? '';
    expect(disabled).toContain('opacity: var(--cck-tabs-disabled-opacity)');
    expect(disabled).toContain('cursor: not-allowed');
    expect(disabled).not.toContain('background-color');
    expect(selected).toMatch(/^data-/);
  });

  it('gives the Tabs and the TabNav panel one rule without padding, and hover no forced-colors rule', () => {
    expect(forced).not.toContain(':hover');
    for (const [block, sheet] of [
      ['tabs', css],
      ['tab-nav', navCss],
    ] as const) {
      expect(declarationsOf(sheet, `.cck-${block}__panel`)).toMatch(
        /^\s*box-sizing: border-box;\s*display: block;\s*$/,
      );
      expect(declarationsOf(sheet, `.cck-${block} > .cck-${block}__panel`)).toBeUndefined();
    }
    expect(css).not.toContain('panel-padding');
    expect(source).toContain('@mixin panel-rules($block)');
  });

  it('draws the neutral line indicator in its own colour, keeps the list on one row and scrolls it', () => {
    expect(
      declarationsOf(
        css,
        `${ROOT}[data-variant=line][data-cck-color=neutral] > .cck-tabs__list > .cck-tabs__indicator::after`,
      ),
    ).toContain('background-color: var(--cck-tabs-indicator-line-neutral-color)');
    const list = declarationsOf(css, `${ROOT} > .cck-tabs__list`) ?? '';
    expect(list).toContain('flex-flow: row nowrap');
    expect(list).toContain('overflow-x: auto');
    expect(declarationsOf(css, ROOT)).toContain('inline-size: 100%');
  });

  it.each([
    ['sm', 'size-16'],
    ['md', 'size-16'],
    ['lg', 'size-20'],
  ])('size %s: the trigger icon is %s and the trigger gap is trigger-gap', (mode, icon) => {
    expect(size(mode, 'trigger-icon-size')).toBe(ref(icon));
    expect(declarationsOf(css, `${ROOT} > .cck-tabs__list > .cck-tabs__trigger`)).toContain(
      'gap: var(--cck-tabs-trigger-gap)',
    );
  });
});
