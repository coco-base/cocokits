// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  declarationsOf,
  OVERLAY_TRIGGERS,
  read,
  ref,
  selectorsOf,
  sizePx,
  sizeTokenOf,
  structureTokenOf,
  tokenOf,
  tokensCss,
} from './css-test-helpers';

const css = read('dist', 'components', 'icon-button.css');
/** The rules of the IconButton itself: the entry sheet also holds the SvgIcon rules (svg-icon-css.test.ts). */
const own = css.slice(0, css.indexOf('.cck-svg-icon'));
const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
const ROOT = '.cck-icon-button';
const HOVER = `${ROOT}:hover:not([data-disabled], :disabled)`;
const OPEN = `${ROOT}[data-state=open]:is(${OVERLAY_TRIGGERS}):not([data-variant=primary], [data-disabled], :disabled)`;
const ACTIVE = `${ROOT}:active:not([data-disabled], :disabled)`;
const MODES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const DENSITIES = ['normal', 'compact', 'comfortable'] as const;
/** The pixels of `control-<mode>` in a density mode of Theme / Spacing. */
const controlPx = (mode: string, density: string): number =>
  sizePx(tokenOf(`[data-cck-spacing=${density}]`, `control-${mode}`));

describe('icon-button output', () => {
  it('puts the rules inside @layer cocokits, in its entry and in the whole theme', () => {
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain(`${ROOT} {`);
  });

  it('emits the size modes on the class, the structure on the class, and nothing on :root', () => {
    for (const mode of ['xs', 'sm', 'lg', 'xl']) expect(tokensCss).toContain(`${ROOT}[data-size=${mode}] {`);
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
    // The square aliases `control-<mode>`, so its pixels are those of the density mode.
    for (const mode of MODES) {
      expect(sizeTokenOf(ROOT, mode, 'icon-button-size'), mode).toBe(ref(`control-${mode}`));
      for (const density of DENSITIES)
        expect(controlPx(mode, density), `${mode} ${density}`).toBeGreaterThanOrEqual(24);
    }
  });

  it('reads only its own tokens, and every one exists in tokens.css (the SvgIcon rules read theirs)', () => {
    const names = [...new Set([...own.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]))];
    expect(names.length).toBeGreaterThan(10);
    for (const name of names) {
      // A private custom property (`--_fill`, `--_ink`) is set in the same sheet and is no token.
      if (name.startsWith('--_')) {
        expect(own, name).toContain(`${name}:`);
        expect(tokensCss, name).not.toContain(`${name}:`);
        continue;
      }
      expect(name.startsWith('--cck-icon-button-'), name).toBe(true);
      expect(tokensCss, name).toContain(`${name}:`);
    }
  });

  it('draws the Button variants with a fill and an ink, with the rounded radius from data-rounded', () => {
    const root = declarationsOf(css, ROOT) ?? '';
    expect(root).toContain('--_fill: transparent');
    expect(root).toContain('--_ink: var(--cck-icon-button-icon-color)');
    expect(root).toContain('background-color: var(--_fill)');
    expect(root).toContain('color: var(--_ink)');
    expect(root).not.toContain('line-height');
    const primary = declarationsOf(css, `${ROOT}[data-variant=primary]`) ?? '';
    expect(primary).toContain('--_fill: var(--cck-icon-button-solid-bg)');
    expect(primary).toContain('--_ink: var(--cck-icon-button-solid-icon-color)');
    expect(primary).toContain('box-shadow: var(--cck-icon-button-shadow)');
    expect(declarationsOf(css, `${ROOT}[data-variant=soft]`)).toContain('--_fill: var(--cck-icon-button-soft-bg)');
    const outline = declarationsOf(css, `${ROOT}[data-variant=outline]`) ?? '';
    expect(outline).toContain('--_fill: var(--cck-icon-button-outline-bg)');
    expect(outline).toContain('border-color: var(--cck-icon-button-border-color)');
    expect(outline).toContain('box-shadow: var(--cck-icon-button-shadow)');
    // `basic` takes the defaults of the root.
    expect(css).not.toContain('data-variant=basic');
    expect(css).not.toContain('data-variant=light');
    expect(declarationsOf(css, `${ROOT}[data-rounded]`)).toContain(
      'border-radius: var(--cck-icon-button-radius-rounded)',
    );
  });

  it('styles disabled for the attribute and a disabled fieldset, after the variants: it fades and keeps its look', () => {
    const rule = /\.cck-icon-button\[data-disabled\],\s*\.cck-icon-button:disabled\s*\{([^}]*)\}/.exec(css);
    expect(rule?.[1]).toContain('opacity: var(--cck-icon-button-disabled-opacity)');
    expect(rule?.[1]).toContain('box-shadow: none');
    expect(rule?.[1]).toContain('cursor: not-allowed');
    expect(rule?.[1]).not.toMatch(/background-color|(^|[\s;])color:/);
    expect(rule?.index).toBeGreaterThan(css.indexOf(`${ROOT}[data-variant=outline]`));
  });

  it('keeps the resting look of a Tooltip trigger while its tooltip is open: only an opened overlay rests on the hover fill', () => {
    expect(declarationsOf(css, `${HOVER}, ${OPEN}`)).toContain('background-color:');
    const button = (classes: string): HTMLElement => {
      const element = document.createElement('button');
      element.className = `cck-icon-button ${classes}`;
      element.setAttribute('data-state', 'open');
      return element;
    };
    expect(button('cck-tooltip__trigger').matches(OPEN)).toBe(false);
    for (const trigger of OVERLAY_TRIGGERS.split(', '))
      expect(button(trigger.slice(1)).matches(OPEN), trigger).toBe(true);
    // A Menu trigger that also has a Tooltip shows the open Menu.
    expect(button('cck-tooltip__trigger cck-menu__trigger').matches(OPEN)).toBe(true);
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

  it('has one hover, one open and one pressed rule, and reaches no part but its own root', () => {
    expect(own.match(/:hover/g)).toHaveLength(1);
    expect(own.match(/:active/g)).toHaveLength(1);
    expect(own.match(/data-state/g)).toHaveLength(1);
    for (const selector of selectorsOf(own)) expect(selector, selector).toMatch(/^\.cck-icon-button(?![\w-])/);
  });

  it('uses no color literal, no !important and no physical property', () => {
    expect(own).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|oklch\(|!important/i);
    expect(own).not.toMatch(
      /(^|[\s{;])(left|right|width|height|margin-left|margin-right|padding-left|padding-right)\s*:/,
    );
  });

  it('restates [hidden] on the box it sets to display', () => {
    expect(own).toMatch(/\.cck-icon-button\[hidden\]\s*\{\s*display: none/);
  });
});

describe('icon-button design match', () => {
  const sizes = [
    ['xs', 'size-14'],
    ['sm', 'size-16'],
    ['md', 'size-16'],
    ['lg', 'size-20'],
    ['xl', 'size-20'],
  ] as const;

  it.each(sizes)('size %s: the square is its control height and the icon its size step', (mode, icon) => {
    const at = (name: string): string | undefined => sizeTokenOf(ROOT, mode, name);
    expect(at('icon-button-size')).toBe(ref(`control-${mode}`));
    expect(at('icon-button-icon-size')).toBe(ref(icon));
  });

  it.each([
    ['xs', 24, 24, 28],
    ['sm', 32, 28, 36],
    ['md', 36, 32, 40],
    ['lg', 40, 36, 44],
    ['xl', 48, 40, 52],
  ] as const)('control-%s is %ipx in Normal, %ipx in Compact and %ipx in Comfortable', (mode, ...px) => {
    expect(DENSITIES.map((density) => controlPx(mode, density))).toEqual(px);
  });

  it.each([
    ['icon-button-solid-bg', 'color'],
    ['icon-button-solid-icon-color', 'on-color'],
    ['icon-button-soft-bg', 'container'],
    ['icon-button-icon-color', 'on-container'],
    ['icon-button-outline-bg', 'surface-1'],
    ['icon-button-border-color', 'edge'],
    ['icon-button-shadow', 'shadow-xs'],
    ['icon-button-radius', 'radius-md'],
    ['icon-button-radius-rounded', 'radius-full'],
    ['icon-button-hover-mix', 'opacity-10'],
    ['icon-button-active-mix', 'opacity-20'],
    ['icon-button-focus-color', 'focus-2'],
    ['icon-button-focus-width', 'border-width-2'],
    ['icon-button-focus-offset', 'spacing-2'],
    ['icon-button-disabled-opacity', 'opacity-50'],
  ])('structure token %s is %s', (name, alias) => {
    expect(structureTokenOf(ROOT, name)).toBe(ref(alias));
  });

  it('keeps no colour token per state', () => {
    for (const name of ['hover-bg', 'solid-hover-bg', 'disabled-bg', 'disabled-icon-color', 'outline-icon-color'])
      expect(tokensCss, name).not.toContain(`--cck-icon-button-${name}:`);
  });

  it('mixes the ink into the fill on hover, open and press after the variants, never a disabled one, with no forced-colors rule', () => {
    expect(declarationsOf(css, `${HOVER}, ${OPEN}`)).toContain(
      'background-color: color-mix(in srgb, var(--_fill), var(--_ink) var(--cck-icon-button-hover-mix))',
    );
    expect(declarationsOf(css, ACTIVE)).toContain(
      'background-color: color-mix(in srgb, var(--_fill), var(--_ink) var(--cck-icon-button-active-mix))',
    );
    for (const selector of [HOVER, OPEN, ACTIVE]) {
      expect(css.indexOf(selector), selector).toBeGreaterThan(css.indexOf(`${ROOT}[data-variant=outline]`));
      expect(css.indexOf(selector), selector).toBeLessThan(css.indexOf(`${ROOT}[data-disabled],`));
    }
    expect(forced).not.toMatch(/:hover|:active|data-state/);
  });
});
