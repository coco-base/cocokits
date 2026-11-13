import { describe, expect, it } from 'vitest';
import { declarationsOf, read, selectorsOf, tokensCss } from './css-test-helpers';

const ROOT = '.cck-svg-icon';
const SVG = '.cck-svg-icon > .cck-svg-icon__svg';
/** The per-component sheets whose parts show an icon (or hold a SvgIcon), and the SvgIcon sheet itself. */
const SHEETS = ['select', 'accordion', 'checkbox', 'icon-button', 'svg-icon'] as const;
const sheet = (name: string): string => read('dist', 'components', `${name}.css`);
const occurrences = (css: string, text: string): number => css.split(text).length - 1;
const layerBody = (css: string): string => css.slice(css.indexOf('@layer cocokits {'));

describe('svg-icon output', () => {
  const css = sheet('svg-icon');

  it('puts the rules inside @layer cocokits, in its entry and in the whole theme', () => {
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(read('dist', 'styles.css')).toContain(`${SVG} {`);
  });

  it('makes the icon 1em square, never shrunk, and the svg fills it with currentColor', () => {
    const root = declarationsOf(css, ROOT) ?? '';
    for (const line of ['display: inline-flex', 'flex-shrink: 0', 'inline-size: 1em', 'block-size: 1em']) {
      expect(root).toContain(line);
    }
    const svg = declarationsOf(css, SVG) ?? '';
    expect(svg).toContain('fill: currentColor');
    expect(svg).toContain('inline-size: 100%');
    expect(svg).toContain('block-size: 100%');
  });

  it('sets the font size only from data-size and the color only from data-cck-color, so the default is 1em currentColor', () => {
    expect(declarationsOf(css, `${ROOT}[data-size]`)).toContain('font-size: var(--cck-svg-icon-size)');
    expect(declarationsOf(css, `${ROOT}[data-cck-color]`)).toContain('color: var(--cck-svg-icon-color)');
    expect(declarationsOf(css, ROOT)).not.toMatch(/font-size|(^|[\s;])color:/);
  });

  it('emits the sizes xs to 2xl on the class and the color from the Active Color, never on :root', () => {
    for (const mode of ['xs', 'sm', 'lg', 'xl', '"2xl"']) expect(tokensCss).toContain(`${ROOT}[data-size=${mode}] {`);
    expect(tokensCss).toContain(`${ROOT}, ${ROOT}[data-size=md] {`);
    expect(tokensCss).toMatch(/\.cck-svg-icon \{\s*--cck-svg-icon-color: var\(--cck-edge\)/);
    const onRoot = tokensCss
      .split('  }')
      .filter((block) => block.includes(':root'))
      .join('');
    expect(onRoot).not.toContain('--cck-svg-icon-');
  });

  it('reads only its own tokens, and every one exists in tokens.css', () => {
    const names = [...new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]))];
    expect(names.sort()).toEqual(['--cck-svg-icon-color', '--cck-svg-icon-size']);
    for (const name of names) expect(tokensCss, name).toContain(`${name}:`);
  });

  it('mirrors only in a right-to-left context, and only for data-rtl-mirror (AC 21)', () => {
    expect(declarationsOf(css, `${ROOT}[data-rtl-mirror]:dir(rtl)`)).toContain('scale: -1 1');
    expect(css.match(/scale:/g)).toHaveLength(1);
    expect(css).not.toMatch(/\[data-rtl-mirror\]\s*\{/);
    expect(css).not.toMatch(/\[data-rtl-mirror\]:dir\(ltr\)|:not\(:dir\(rtl\)\)/);
  });

  it('starts every selector with the svg icon class and joins parts with child combinators only', () => {
    for (const selector of selectorsOf(css)) {
      expect(selector, selector).toMatch(/^\.cck-svg-icon(?![\w-])/);
      selector.split(/\s+/).forEach((token, index) => {
        if (index % 2 === 1) expect(token, selector).toBe('>');
      });
    }
  });

  it('uses no color literal, no !important and no physical property', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|oklch\(|!important/i);
    expect(css).not.toMatch(/(^|[\s{;])(left|right|width|height|margin-left|margin-right)\s*:/);
  });
});

describe.each(SHEETS)('the %s sheet (AC 23)', (name) => {
  const css = sheet(name);

  it('holds the SvgIcon rules inside @layer cocokits, once', () => {
    const body = layerBody(css);
    expect(css.replace(/^@property --side-offset \{[^}]*\}\n/, '').startsWith('@layer cocokits {')).toBe(true);
    expect(body).toContain(`${ROOT} {`);
    expect(body).toContain(`${SVG} {`);
    expect(occurrences(css, `${ROOT} {`)).toBe(1);
    expect(occurrences(css, `${SVG} {`)).toBe(1);
  });
});

describe('styles.css (AC 23)', () => {
  const css = read('dist', 'styles.css');

  it('holds the SvgIcon rules once, although four components include them', () => {
    expect(occurrences(css, `${SVG} {`)).toBe(1);
    expect(occurrences(css, 'inline-size: 1em')).toBe(1);
    expect(occurrences(css, `${ROOT}[data-size] {`)).toBe(1);
    expect(occurrences(css, `${ROOT}[data-rtl-mirror]:dir(rtl) {`)).toBe(1);
  });

  it('keeps the SvgIcon rules out of the rules mixins of the components, so they cannot repeat', () => {
    for (const block of ['select', 'accordion', 'checkbox', 'icon-button']) {
      const rules = read('src', 'styles', 'components', `_${block}.scss`);
      expect(rules, block).not.toContain('.cck-svg-icon');
      expect(rules, block).not.toContain('svg-icon');
    }
  });

  it('restates [hidden] on the box it sets to display', () => {
    expect(sheet('svg-icon')).toMatch(/\.cck-svg-icon\[hidden\]\s*\{\s*display: none/);
  });
});
