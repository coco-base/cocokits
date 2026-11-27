import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, selectorsOf, structureTokenOf, tokensCss } from './css-test-helpers';

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
/** The sheet without its `prefers-reduced-motion` blocks: `state.transition` emits one block per include. */
const withoutMotion = (css: string): string =>
  css.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n {2}\}\n/g, '');
/** The state part of the disabled rules: the fact, or a natively disabled input (`<fieldset disabled>`). */
const disabledOf = (block: string): string => {
  const input =
    block === 'switch'
      ? '> .cck-switch__label > .cck-switch__track > .cck-switch__input'
      : `> .cck-${block}__wrapper > .cck-${block}__input-wrapper > .cck-${block}__input`;
  return `.cck-${block}:where([data-disabled], :has(${input}:disabled))`;
};

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

  it('reads only its own tokens, every one in tokens.css, and sets every private property it reads', () => {
    const names = [...new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]))];
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      // The SvgIcon rules of the entry sheet read their own tokens (svg-icon-css.test.ts).
      if (name.startsWith('--cck-svg-icon-')) continue;
      if (name.startsWith('--_')) {
        expect(css, name).toContain(`${name}:`);
        continue;
      }
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

  // Block content (an Accordion panel, a Dialog body) and a stretched flex column both fill a block-level root.
  it('makes the root block-level for labelPosition before, and [hidden] still wins', () => {
    const before = `${root}[data-label-position=before] {`;
    expect(declarationsOf(css, `${root}[data-label-position=before]`)).toContain('display: flex');
    expect(css.indexOf(before)).toBeGreaterThan(-1);
    expect(css.indexOf(before)).toBeLessThan(css.indexOf(`${root}[hidden] {`));
  });

  it('transitions only named properties and only inside no-preference', () => {
    expect(withoutMotion(css)).not.toContain('transition');
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

  it('fades the disabled root with the disabled opacity and keeps it opaque in forced colors', () => {
    expect(declarationsOf(css, disabledOf(block))).toContain(`opacity: var(--cck-${block}-disabled-opacity)`);
    expect(declarationsOf(forcedOf(css), disabledOf(block))).toContain('opacity: 1');
    expect(tokensCss).not.toMatch(new RegExp(`--cck-${block}-[\\w-]*disabled-(bg|border-color|mark-color|color)\\b`));
  });

  it('keeps the hit area at least 24 by 24 CSS px in every size, from one structure token', () => {
    const hit = tokensJson(block)
      .collections.flatMap((collection) => collection.tokens)
      .filter((t) => t.name === 'hit-size');
    expect(hit).toHaveLength(1);
    const value = structureTokenOf(root, `${block}-hit-size`);
    const step = /^var\(--cck-size-(\d+)\)$/.exec(value ?? '')?.[1];
    expect(Number(step)).toBeGreaterThanOrEqual(24);
    expect(tokensCss).toContain(`--cck-size-${String(step)}: ${String(step)}px;`);
  });

  it('has a hover and a pressed rule, and both exclude the disabled root and a disabled input', () => {
    const rules = selectorsOf(css).filter((selector) => /:where\(:(hover|active)\)/.test(selector));
    expect(rules.some((selector) => selector.includes(':where(:hover)'))).toBe(true);
    expect(rules.some((selector) => selector.includes(':where(:active)'))).toBe(true);
    for (const selector of rules) {
      expect(selector).toContain(':where(:not([data-disabled]');
      expect(selector).toContain('__input:disabled');
    }
  });

  it('defines no token with a color literal', () => {
    expect(JSON.stringify(tokensJson(block))).not.toMatch(/#[0-9a-f]{3,8}"/i);
  });
});

describe('hover and pressed', () => {
  it.each(['checkbox', 'radio'] as const)('the %s borders an empty box and layers a filled one', (block) => {
    const css = cssOf(block);
    const filled = block === 'checkbox' ? '[data-checked], [data-indeterminate]' : '[data-checked]';
    const live = `:where(:not([data-disabled]${block === 'checkbox' ? ', [data-readonly]' : ''}, :has(> .cck-${block}__wrapper > .cck-${block}__input-wrapper > .cck-${block}__input:disabled)))`;
    const box = `> .cck-${block}__wrapper > .cck-${block}__input-wrapper > .cck-${block}__background`;
    expect(declarationsOf(css, `.cck-${block}:where(:hover)${live}:where(:not(${filled})) ${box}`)).toContain(
      `border-color: var(--cck-${block}-box-hover-border-color)`,
    );
    for (const [state, mix] of [
      ['hover', 'hover-mix'],
      ['active', 'active-mix'],
    ]) {
      const rule = declarationsOf(css, `.cck-${block}:where(:${state})${live}:where(${filled}) ${box}`) ?? '';
      const layer = `color-mix(in srgb, var(--cck-${block}-box-checked-bg), var(--cck-${block}-box-mark-color) var(--cck-${block}-${mix}))`;
      expect(rule, state).toContain(`background-color: ${layer}`);
      expect(rule, state).toContain(`border-color: ${layer}`);
    }
    expect(css).not.toMatch(/:where\(:active\)[^{]*:where\(:not\(\[data-checked\]/);
  });

  it('the switch layers the ink of the pill into its fill, and draws no halo', () => {
    const css = cssOf('switch');
    const live =
      ':where(:not([data-disabled], [data-readonly], :has(> .cck-switch__label > .cck-switch__track > .cck-switch__input:disabled)))';
    for (const [state, mix] of [
      ['hover', 'hover-mix'],
      ['active', 'active-mix'],
    ]) {
      expect(
        declarationsOf(css, `.cck-switch:where(:${state})${live} > .cck-switch__label > .cck-switch__track::before`),
      ).toContain(`background-color: color-mix(in srgb, var(--_fill), var(--_ink) var(--cck-switch-${mix}))`);
    }
    expect(declarationsOf(css, '.cck-switch__backdrop')).toContain('display: none');
    expect(tokensCss).not.toContain('--cck-switch-halo');
  });

  it('the switch fill and ink start as the track pair and become the checked pair', () => {
    const css = cssOf('switch');
    expect(declarationsOf(css, '.cck-switch')).toContain('--_fill: var(--cck-switch-track-bg)');
    expect(declarationsOf(css, '.cck-switch')).toContain('--_ink: var(--cck-switch-track-ink)');
    expect(declarationsOf(css, '.cck-switch:where([data-checked])')).toContain(
      '--_fill: var(--cck-switch-track-checked-bg)',
    );
    expect(declarationsOf(css, '.cck-switch__track::before')).toContain('background-color: var(--_fill)');
  });
});

describe('filled controls', () => {
  it.each(['checkbox', 'switch'] as const)('the %s keeps the read-only dashes visible on the fill', (block) => {
    expect(cssOf(block)).toMatch(/\[data-readonly\][^{]*\{[^}]*border-style: dashed;[^}]*background-clip: padding-box/);
  });

  it('the checkbox and the switch change only the border colour when invalid, also on a filled control', () => {
    for (const block of ['checkbox', 'switch'] as const) {
      const css = cssOf(block);
      expect(css).not.toContain('box-shadow: inset');
      expect(css).not.toMatch(/\[data-invalid\][^{]*\{[^}]*(?:box-shadow|outline|border-width)/);
      expect(css).toMatch(
        new RegExp(`\\[data-invalid\\][^{]*\\{\\s*border-color: var\\(--cck-${block}-[\\w-]*invalid-border-color\\)`),
      );
    }
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

  it.each(['checkbox', 'radio', 'switch'] as const)('the %s has no halo to reset in forced colors', (block) => {
    expect(forcedOf(cssOf(block))).not.toContain('__backdrop');
  });
});

describe('checkbox look', () => {
  const css = cssOf('checkbox');
  const box = (facts: string): string =>
    `.cck-checkbox:where(${facts}) > .cck-checkbox__wrapper > .cck-checkbox__input-wrapper > .cck-checkbox__background`;
  const FILLED = '[data-checked], [data-indeterminate]';

  const tick = '.cck-checkbox > .cck-checkbox__wrapper > .cck-checkbox__input-wrapper > .cck-checkbox__background';

  it('fills the box for checked and mixed, shows the dash for mixed only, and draws the tick as an icon', () => {
    expect(css).not.toContain('clip-path');
    expect(declarationsOf(css, box(FILLED))).toContain('background-color: var(--cck-checkbox-box-checked-bg)');
    expect(declarationsOf(css, box(FILLED))).not.toContain('opacity');
    expect(declarationsOf(css, `${box('[data-indeterminate]')}::after`)).toContain('opacity: 1');
    const icon = declarationsOf(css, tick) ?? '';
    expect(icon).toContain('font-size: var(--cck-checkbox-box-icon-size)');
    expect(icon).toContain('color: var(--cck-checkbox-box-mark-color)');
  });

  it('caps the box radius at 30% of the box, so the box never reads as a radio', () => {
    expect(declarationsOf(css, tick)).toContain(
      'border-radius: min(var(--cck-checkbox-box-radius), var(--cck-checkbox-box-size) * 0.3)',
    );
  });

  it('keeps the tick colour when disabled, and HighlightText on the Highlight fill or GrayText in forced colors', () => {
    const normal = css.slice(0, css.indexOf('@media'));
    expect(normal).not.toMatch(/\[data-disabled\][^{]*__background \{\s*color:/);
    const forced = forcedOf(css);
    expect(forced).toMatch(/\.cck-checkbox:where\(\[data-checked\]\) > [^{]*__background \{\s*color: HighlightText/);
    expect(forced).toMatch(
      /\.cck-checkbox:where\(\[data-checked\], \[data-indeterminate\]\) > [^{]*__background \{[^}]*background-color: Highlight/,
    );
    expect(forced).toMatch(/\[data-disabled\][^{]*__background \{[^}]*color: GrayText/);
  });

  it('shows invalid by the border colour only and read-only with a dashed border', () => {
    expect(declarationsOf(css, box('[data-invalid]):where([data-touched], [data-submitted]'))?.trim()).toBe(
      'border-color: var(--cck-checkbox-box-invalid-border-color);',
    );
    expect(css).toMatch(/\[data-readonly\][^{]*\{[^}]*border-style: dashed/);
  });

  it('gives the box its resting shadow and drops it when disabled', () => {
    expect(declarationsOf(css, '.cck-checkbox__background')).toContain('box-shadow: var(--cck-checkbox-box-shadow)');
    expect(
      declarationsOf(
        css,
        `${disabledOf('checkbox')} > .cck-checkbox__wrapper > .cck-checkbox__input-wrapper > .cck-checkbox__background`,
      ),
    ).toContain('box-shadow: none');
  });

  it('keeps the 1px border in forced colors: no thicker invalid border', () => {
    expect(forcedOf(css)).not.toContain('border-width');
  });

  it('makes the hit area a grid cell with the native input over it, transparent', () => {
    const cell = declarationsOf(css, '.cck-checkbox__input-wrapper') ?? '';
    expect(cell).toContain('inline-size: var(--cck-checkbox-box-size)');
    expect(cell).toContain('block-size: var(--cck-checkbox-hit-size)');
    const input = declarationsOf(css, '.cck-checkbox__input') ?? '';
    expect(input).toContain('inline-size: var(--cck-checkbox-hit-size)');
    expect(input).toContain('block-size: var(--cck-checkbox-hit-size)');
    expect(input).toContain('opacity: 0');
    expect(input).toContain('grid-area: 1/1');
  });
});

describe('[hidden] on the parts that set display', () => {
  it.each([
    ['checkbox', '.cck-checkbox__wrapper'],
    ['checkbox', '.cck-checkbox__input-wrapper'],
    ['checkbox', '.cck-checkbox > .cck-checkbox__wrapper > .cck-checkbox__input-wrapper > .cck-checkbox__background'],
    ['radio', '.cck-radio__wrapper'],
    ['radio', '.cck-radio__input-wrapper'],
    ['switch', '.cck-switch__label'],
  ])('the %s restates it on %s', (block, part) => {
    const css = cssOf(block);
    expect(declarationsOf(css, part) ?? '').toMatch(/display: (inline-)?(flex|grid)/);
    expect(declarationsOf(css, `${part}[hidden]`)).toContain('display: none');
  });
});

describe('radio look', () => {
  const css = cssOf('radio');

  it('is round, with a round dot, and has no read-only or mixed rule', () => {
    expect(declarationsOf(css, '.cck-radio__background')).toContain('border-radius: var(--cck-radio-box-radius)');
    expect(css).toMatch(/\.cck-radio__background::after \{[^}]*border-radius: 50%/);
    expect(css).not.toMatch(/data-readonly|data-indeterminate/);
  });

  it('shows an invalid group by the border colour of its radios only', () => {
    const rule = declarationsOf(
      css,
      '.cck-radio-group:where([data-invalid]) > .cck-radio > .cck-radio__wrapper > .cck-radio__input-wrapper > .cck-radio__background',
    );
    expect(rule).toContain('border-color: var(--cck-radio-box-invalid-border-color)');
    expect(rule).not.toMatch(/box-shadow|outline|border-width/);
    expect(structureTokenOf('.cck-radio', 'radio-box-invalid-border-color')).toBe(ref('danger-color'));
    expect(css.indexOf('[data-invalid]')).toBeLessThan(css.indexOf(':where([data-disabled], :has('));
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

  it('shows invalid by the border colour only and read-only with a dashed border in border/3', () => {
    expect(css).not.toContain('box-shadow: inset');
    expect(css).toMatch(/\[data-readonly\][^{]*\{[^}]*border-style: dashed/);
    expect(css).toMatch(/\[data-readonly\][^{]*\{[^}]*border-color: var\(--cck-switch-track-readonly-border-color\)/);
    expect(structureTokenOf('.cck-switch', 'switch-track-readonly-border-color')).toBe(ref('border-3'));
    expect(forcedOf(css)).not.toContain('border-width');
  });

  it('draws the rail focus ring on the track box and the contained one on the pill', () => {
    const input = '> .cck-switch__label > .cck-switch__track > .cck-switch__input:focus-visible';
    const track = '> .cck-switch__label > .cck-switch__track';
    expect(css).toContain(`.cck-switch[data-variant=rail]:has(${input}) ${track} {`);
    expect(css).toContain(`.cck-switch:not([data-variant=rail]):has(${input}) ${track}::before,`);
  });

  it('recolors the thumb in forced colors for both positions', () => {
    const forced = forcedOf(css);
    expect(forced).toContain('background-color: HighlightText');
    expect(forced).toContain('background-color: CanvasText');
  });
});

describe('labelPosition before puts the control at the end edge', () => {
  const before = (block: string): string => `.cck-${block}[data-label-position=before]`;

  it.each(['checkbox', 'radio'])('the %s wrapper fills the root and the label takes the free space', (block) => {
    const css = cssOf(block);
    expect(declarationsOf(css, `${before(block)} > .cck-${block}__wrapper`)).toMatch(
      /flex-direction: row-reverse;\s*flex: 1/,
    );
    expect(declarationsOf(css, `${before(block)} > .cck-${block}__wrapper > .cck-${block}__label`)).toContain(
      'flex: 1',
    );
  });

  it('the switch label fills the root and the track takes the free space before it, in logical properties', () => {
    const css = cssOf('switch');
    expect(declarationsOf(css, `${before('switch')} > .cck-switch__label`)).toMatch(
      /flex-direction: row-reverse;\s*flex: 1/,
    );
    expect(declarationsOf(css, `${before('switch')} > .cck-switch__label > .cck-switch__track`)).toContain(
      'margin-inline-start: auto',
    );
  });
});
