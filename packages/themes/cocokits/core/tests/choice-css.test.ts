import { describe, expect, it } from 'vitest';
import { declarationsOf, read, selectorsOf, tokensCss } from './css-test-helpers';

const BLOCKS = ['checkbox', 'switch', 'radio'] as const;

interface TokenFile {
  collections: { name: string; tokens: { name: string; valuesByMode: Record<string, unknown> }[] }[];
}
const tokensJson = (block: string): TokenFile => JSON.parse(read('src', 'tokens', `${block}.tokens.json`)) as TokenFile;
const cssOf = (block: string): string => read('dist', 'components', `${block}.css`);
const scssOf = (block: string): string =>
  [
    read('src', 'styles', 'components', `_${block}.scss`),
    block === 'switch' ? '' : read('src', 'styles', '_choice-box.scss'),
  ].join('\n');
const forcedOf = (css: string): string => css.slice(css.indexOf('@media (forced-colors: active)'));

describe.each(BLOCKS)('%s output', (block) => {
  const css = cssOf(block);
  const root = `.cck-${block}`;

  it('puts the rules inside @layer cocokits, in its entry and in the whole theme', () => {
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain(`${root} {`);
  });

  it('emits its tokens on the component class and never on :root', () => {
    expect(tokensCss).toContain(`${root}[data-size=sm] {`);
    expect(tokensCss).toContain(`${root}, ${root}[data-size=md] {`);
    const onRoot = tokensCss
      .split('  }')
      .filter((b) => b.includes(':root'))
      .join('');
    expect(onRoot).not.toContain(`--cck-${block}-`);
  });

  it('reads only its own tokens, and every one exists in tokens.css', () => {
    const names = [...new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]))];
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(name.startsWith(`--cck-${block}-`), name).toBe(true);
      expect(tokensCss, name).toContain(`${name}:`);
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

  it('uses no physical property, no !important, no color literal and no text content', () => {
    expect(scssOf(block)).not.toMatch(
      /(^|[\s{;])(left|right|top|bottom|width|height|min-width|min-height|margin-left|margin-right|padding-left|padding-right)\s*:/,
    );
    expect(css).not.toContain('!important');
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|oklch\(/i);
    expect(css).not.toMatch(/content: "[^"]/);
    expect(css).not.toContain('border-2');
  });

  it('restates [hidden] because the root sets display', () => {
    expect(declarationsOf(css, `${root}[hidden]`)).toContain('display: none');
    expect(declarationsOf(css, root)).toContain('display: inline-flex');
  });

  it('reverses the row for labelPosition before', () => {
    expect(css).toMatch(/\[data-label-position=before\] > [^{]+\{\s*flex-direction: row-reverse/);
  });

  it('transitions only named properties and only inside no-preference', () => {
    const outside = css.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n {2}\}\n/, '');
    expect(outside).not.toContain('transition');
    expect(css).toContain('@media (prefers-reduced-motion: no-preference)');
    expect(css).not.toMatch(/transition(-property)?: all/);
  });

  it('rings the focus on :focus-visible of the native input, also in forced colors', () => {
    expect(css).toMatch(/:has\(> [^{]*__input:focus-visible\)[^{]*\{\s*outline: var\(--cck-\w+-focus-width\) solid/);
    expect(forcedOf(css)).toContain('outline-color: Highlight');
  });

  it('gives every state a forced-colors rule with system colors', () => {
    const forced = forcedOf(css);
    for (const color of ['CanvasText', 'Highlight', 'HighlightText', 'GrayText']) expect(forced).toContain(color);
    expect(forced).toContain('[data-checked]');
    expect(forced).toContain('[data-disabled]');
  });

  it('puts disabled after checked (and invalid) and also covers a native fieldset[disabled]', () => {
    const normal = css.slice(0, css.indexOf('@media'));
    const disabled = normal.indexOf(':where([data-disabled], :has(');
    expect(disabled).toBeGreaterThan(normal.indexOf(':where([data-checked]'));
    if (block !== 'radio') expect(normal.indexOf('[data-invalid]')).toBeLessThan(disabled);
    expect(css).toContain('__input:disabled');
  });

  it('keeps the hit area at least 24 by 24 CSS px in every size', () => {
    const hit = tokensJson(block).collections[0]?.tokens.find((t) => t.name === 'hit-size');
    expect(hit).toBeDefined();
    for (const mode of ['sm', 'md', 'lg']) {
      expect(Number(/size-(\d+)\}/.exec(String(hit?.valuesByMode[mode]))?.[1]), mode).toBeGreaterThanOrEqual(24);
    }
  });

  it('has no :active rule in its built CSS or in the shared partial', () => {
    expect(css).not.toContain(':active');
    expect(read('src', 'styles', '_choice-box.scss')).not.toContain(':active');
  });

  it('defines no token with a color literal', () => {
    expect(JSON.stringify(tokensJson(block))).not.toMatch(/#[0-9a-f]{3,8}"/i);
  });
});

describe('hover', () => {
  it.each(['checkbox', 'radio'] as const)('the %s shows a halo and a hover border on the box', (block) => {
    const css = cssOf(block);
    const tail = `> .cck-${block}__wrapper > .cck-${block}__input-wrapper`;
    expect(declarationsOf(css, `.cck-${block}:where(:hover) ${tail} > .cck-${block}__backdrop`)).toContain(
      `background-color: var(--cck-${block}-halo-bg)`,
    );
    expect(declarationsOf(css, `.cck-${block}:where(:hover) ${tail} > .cck-${block}__background`)).toContain(
      `border-color: var(--cck-${block}-box-hover-border-color)`,
    );
  });

  it('the switch shows a halo, a hover border and a hover thumb', () => {
    const css = cssOf('switch');
    const track = '> .cck-switch__label > .cck-switch__track';
    expect(declarationsOf(css, `.cck-switch:where(:hover) ${track} > .cck-switch__backdrop`)).toContain(
      'background-color: var(--cck-switch-halo-bg)',
    );
    expect(declarationsOf(css, `.cck-switch:where(:hover) ${track}::before`)).toContain(
      'border-color: var(--cck-switch-track-hover-border-color)',
    );
    expect(declarationsOf(css, `.cck-switch:where(:hover) ${track} > .cck-switch__thumb`)).toContain(
      'background-color: var(--cck-switch-thumb-hover-color)',
    );
  });
});

describe('filled controls', () => {
  it.each(['checkbox', 'switch'] as const)('the %s keeps the read-only dashes visible on the fill', (block) => {
    expect(cssOf(block)).toMatch(/\[data-readonly\][^{]*\{[^}]*border-style: dashed;[^}]*background-clip: padding-box/);
  });

  it('the checkbox draws the invalid line in the mark color on a filled box, after the plain invalid rule', () => {
    const css = cssOf('checkbox');
    const filled = css.indexOf('[data-checked], [data-indeterminate]):where([data-invalid])');
    expect(filled).toBeGreaterThan(css.indexOf('--cck-checkbox-box-invalid-border-color)'));
    expect(css.slice(filled, filled + 400)).toContain('var(--cck-checkbox-box-mark-color)');
  });

  it('the switch draws the invalid line in the thumb color on a filled track', () => {
    expect(cssOf('switch')).toMatch(
      /\[data-checked\]\):where\(\[data-invalid\]\)[^{]*\{[^}]*--cck-switch-thumb-checked-color/,
    );
  });

  it.each(['checkbox', 'switch', 'radio'] as const)(
    'the %s has a CanvasText border on a Highlight fill in forced colors, so dashed and thicker edges show',
    (block) => {
      const forced = forcedOf(cssOf(block));
      const rule = /\[data-checked\][^{]*\{[^}]*border-color: CanvasText/;
      expect(forced).toMatch(rule);
      expect(forced).not.toMatch(/\[data-checked\][^{]*\{[^}]*border-color: Highlight/);
      expect(forced.search(rule)).toBeLessThan(forced.indexOf('GrayText'));
    },
  );

  it.each(['checkbox', 'switch', 'radio'] as const)('the %s halo is transparent in forced colors', (block) => {
    expect(forcedOf(cssOf(block))).toMatch(/__backdrop \{\s*background-color: transparent/);
  });

  it('the switch halo is painted behind the pill and the thumb', () => {
    const css = cssOf('switch');
    expect(declarationsOf(css, '.cck-switch__track')).toContain('isolation: isolate');
    expect(declarationsOf(css, '.cck-switch__backdrop')).toContain('z-index: -1');
  });
});

describe('checkbox look', () => {
  const css = cssOf('checkbox');
  const box = (facts: string): string =>
    `.cck-checkbox:where(${facts}) > .cck-checkbox__wrapper > .cck-checkbox__input-wrapper > .cck-checkbox__background`;
  const FILLED = '[data-checked], [data-indeterminate]';

  it('draws the tick for checked and the dash for mixed, and the dash wins', () => {
    expect(css).toMatch(/\.cck-checkbox__background::after \{[^}]*clip-path: polygon\(/);
    expect(declarationsOf(css, box(FILLED))).toContain('background-color: var(--cck-checkbox-box-checked-bg)');
    expect(declarationsOf(css, `${box('[data-indeterminate]')}::after`)).toContain('clip-path: none');
    expect(css.indexOf('clip-path: none')).toBeGreaterThan(css.indexOf(`${box(FILLED)} {`));
  });

  it('shows invalid with a second line and read-only with a dashed border, not by color alone', () => {
    expect(css).toContain(
      'box-shadow: inset 0 0 0 var(--cck-checkbox-box-border-width) var(--cck-checkbox-box-invalid-border-color)',
    );
    expect(css).toMatch(/\[data-readonly\][^{]*\{[^}]*border-style: dashed/);
  });

  it('thickens the invalid border in forced colors and lets disabled reset it, last', () => {
    const forced = forcedOf(css);
    const thick = forced.indexOf('border-width: var(--cck-checkbox-box-invalid-border-width)');
    expect(thick).toBeGreaterThan(-1);
    expect(forced.indexOf('border-width: var(--cck-checkbox-box-border-width)')).toBeGreaterThan(thick);
  });

  it('removes the invalid line when disabled', () => {
    const normal = css.slice(0, css.indexOf('@media'));
    expect(normal.lastIndexOf('box-shadow: none')).toBeGreaterThan(normal.lastIndexOf('box-shadow: inset'));
  });

  it('makes the hit area a grid cell with the native input over it, transparent', () => {
    expect(declarationsOf(css, '.cck-checkbox__input-wrapper')).toContain('inline-size: var(--cck-checkbox-hit-size)');
    const input = declarationsOf(css, '.cck-checkbox__input') ?? '';
    expect(input).toContain('opacity: 0');
    expect(input).toContain('grid-area: 1/1');
  });
});

describe('radio look', () => {
  const css = cssOf('radio');

  it('is round, with a round dot, and has no invalid, read-only or mixed rule', () => {
    expect(declarationsOf(css, '.cck-radio__background')).toContain('border-radius: var(--cck-radio-box-radius)');
    expect(css).toMatch(/\.cck-radio__background::after \{[^}]*border-radius: 50%/);
    expect(css).not.toMatch(/data-invalid|data-readonly|data-indeterminate/);
  });

  it('has a full-radius box token', () => {
    expect(tokensCss).toMatch(/--cck-radio-box-radius: var\(--cck-radius-full\)/);
  });
});

describe('switch look', () => {
  const css = cssOf('switch');
  const THUMB = '.cck-switch:where([data-checked]) > .cck-switch__label > .cck-switch__track > .cck-switch__thumb';

  it('moves the thumb with a logical offset, so RTL needs no counterpart', () => {
    expect(declarationsOf(css, '.cck-switch__thumb')).toContain('inset-inline-start: var(--cck-switch-thumb-offset)');
    expect(declarationsOf(css, THUMB)).toMatch(/inset-inline-start: calc\(100% - /);
    expect(css).not.toContain(':dir(rtl)');
  });

  it('makes the track the hit area and draws the pill on its ::before', () => {
    expect(declarationsOf(css, '.cck-switch__track')).toContain('block-size: var(--cck-switch-hit-size)');
    expect(declarationsOf(css, '.cck-switch__track::before')).toContain('block-size: var(--cck-switch-track-height)');
  });

  it('shows invalid with a second line, read-only with a dashed border and a thicker invalid border in forced colors', () => {
    expect(css).toContain('box-shadow: inset 0 0 0 var(--cck-switch-track-border-width)');
    expect(css).toMatch(/\[data-readonly\][^{]*\{[^}]*border-style: dashed/);
    expect(forcedOf(css)).toContain('border-width: var(--cck-switch-track-invalid-border-width)');
  });

  it('recolors the thumb in forced colors for both positions', () => {
    const forced = forcedOf(css);
    expect(forced).toContain('background-color: HighlightText');
    expect(forced).toContain('background-color: CanvasText');
  });
});

describe('halo size', () => {
  const px = (block: string, name: string, mode: string): number => {
    const token = tokensJson(block).collections[0]?.tokens.find((t) => t.name === name);
    return Number(/size-(\d+)\}/.exec(String(token?.valuesByMode[mode]))?.[1]);
  };

  /** The `gap` token, followed from its Theme Spacing alias to the Core Size it names, in px. */
  const gap = (block: string): number => {
    const alias = String(tokensJson(block).collections[1]?.tokens.find((t) => t.name === 'gap')?.valuesByMode.Default);
    const base = JSON.parse(read('src', 'tokens', 'base.tokens.json')) as TokenFile;
    const spacing = base.collections
      .flatMap((c) => c.tokens)
      .find((token) => token.name === /#(spacing-\d+)\}/.exec(alias)?.[1]);
    return Number(/size-(\d+)\}/.exec(String(spacing?.valuesByMode.Normal))?.[1]);
  };

  it.each(['checkbox', 'radio'])(
    'keeps the %s halo inside the gap to the label, so it never covers the text',
    (block) => {
      for (const mode of ['sm', 'md', 'lg']) {
        expect((px(block, 'halo-size', mode) - px(block, 'hit-size', mode)) / 2, mode).toBeLessThanOrEqual(gap(block));
      }
    },
  );
});

describe('box sizes', () => {
  it.each(['checkbox', 'radio'])('draws the %s box at 16, 20 and 24 px', (block) => {
    const size = tokensJson(block).collections[0]?.tokens.find((t) => t.name === 'box-size');
    expect(size?.valuesByMode).toEqual({
      sm: '{Core / Size#size-16}',
      md: '{Core / Size#size-20}',
      lg: '{Core / Size#size-24}',
    });
  });
});
