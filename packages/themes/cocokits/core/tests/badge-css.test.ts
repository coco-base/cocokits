import { describe, expect, it } from 'vitest';
import { declarationsOf, read } from './css-test-helpers';

const stylesCss = read('dist', 'styles.css');
const tokensCss = read('dist', 'tokens.css');
const scss = ['_badge.scss', '_badge-container.scss']
  .map((file) => read('src', 'styles', 'components', file))
  .join('\n');

const X = 'var(--cck-badge-offset-x, 0px)';
const Y = 'var(--cck-badge-offset-y, 0px)';
const INSET = 'calc(0.2929 * var(--cck-badge-container-radius, 0px))';
/** The offset adds to the corner; the inline offset is mirrored in RTL. */
const CORNERS = [
  {
    position: 'top-left',
    block: 'inset-block-start',
    inline: 'inset-inline-start',
    ltr: `calc(-50% + ${X}) calc(-50% + ${Y})`,
    rtl: `calc(50% - ${X}) calc(-50% + ${Y})`,
  },
  {
    position: 'top-right',
    block: 'inset-block-start',
    inline: 'inset-inline-end',
    ltr: `calc(50% + ${X}) calc(-50% + ${Y})`,
    rtl: `calc(-50% - ${X}) calc(-50% + ${Y})`,
  },
  {
    position: 'bottom-left',
    block: 'inset-block-end',
    inline: 'inset-inline-start',
    ltr: `calc(-50% + ${X}) calc(50% + ${Y})`,
    rtl: `calc(50% - ${X}) calc(50% + ${Y})`,
  },
  {
    position: 'bottom-right',
    block: 'inset-block-end',
    inline: 'inset-inline-end',
    ltr: `calc(50% + ${X}) calc(50% + ${Y})`,
    rtl: `calc(-50% - ${X}) calc(50% + ${Y})`,
  },
] as const;

describe('badge output', () => {
  it.each(['styles.css', 'components/badge.css', 'components/badge-container.css'])(
    'puts the rules of dist/%s inside @layer cocokits',
    (name) => {
      const css = read('dist', name);
      expect(css.startsWith('@layer cocokits {')).toBe(true);
      expect(css).toContain(name.includes('container') ? '.cck-badge-container' : '.cck-badge');
    },
  );

  it('emits the badge tokens on the component class and never on :root', () => {
    expect(tokensCss).toContain('.cck-badge[data-size=sm] {');
    expect(tokensCss).toContain('.cck-badge, .cck-badge[data-size=md] {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-badge');
  });

  it('sizes the sm and md heights with literals and the others with Core sizes', () => {
    expect(tokensCss).toMatch(/\.cck-badge\[data-size=sm\] \{[^}]*--cck-badge-height: 18px/);
    expect(tokensCss).toMatch(/\.cck-badge\[data-size=md\][^{]*\{[^}]*--cck-badge-height: 22px/);
  });

  it('selects the radius by variant', () => {
    expect(declarationsOf(stylesCss, '.cck-badge[data-variant=rounded]')).toContain(
      'border-radius: var(--cck-badge-radius-rounded)',
    );
    expect(declarationsOf(stylesCss, '.cck-badge[data-variant=rectangle]')).toContain(
      'border-radius: var(--cck-badge-radius-rectangle)',
    );
  });

  it('keeps the container in flow and centred', () => {
    const rule = declarationsOf(stylesCss, '.cck-badge-container') ?? '';
    for (const line of [
      'position: relative',
      'display: inline-flex',
      'align-items: center',
      'justify-content: center',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('outlines the badge in forced colors only', () => {
    const forced = read('dist', 'components', 'badge.css').split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('.cck-badge');
    expect(forced).toContain('outline: 1px solid CanvasText');
    expect(declarationsOf(stylesCss, '.cck-badge')).not.toContain('outline');
  });
});

describe('badge dot and hidden', () => {
  it('draws the dot on [data-empty] with the dot size and no padding', () => {
    const rule = declarationsOf(stylesCss, '.cck-badge[data-empty]') ?? '';
    expect(rule).toContain('inline-size: var(--cck-badge-dot-size)');
    expect(rule).toContain('block-size: var(--cck-badge-dot-size)');
    expect(rule).toContain('padding-inline: 0');
  });

  it('restates the native hidden with display none, in the layer', () => {
    expect(declarationsOf(stylesCss, '.cck-badge[hidden]')).toContain('display: none');
    expect(read('dist', 'components', 'badge.css')).toContain('.cck-badge[hidden]');
  });

  it('restates the native hidden on the container too, in the layer', () => {
    expect(declarationsOf(stylesCss, '.cck-badge-container[hidden]')).toContain('display: none');
    expect(read('dist', 'components', 'badge-container.css')).toContain('.cck-badge-container[hidden]');
  });

  it('has no rule or comment that names data-dot, data-hidden or data-custom-offset', () => {
    for (const text of [scss, stylesCss, read('dist', 'components', 'badge.css')]) {
      expect(text).not.toMatch(/data-dot|data-hidden|data-custom-offset/);
    }
  });
});

describe('badge position properties and RTL', () => {
  const properties = (text: string): string[] => [...new Set([...text.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]))];

  it('reads the three documented properties, each with a 0px fallback', () => {
    for (const name of ['--cck-badge-container-radius', '--cck-badge-offset-x', '--cck-badge-offset-y']) {
      expect(stylesCss).toContain(`var(${name}, 0px)`);
      expect(stylesCss.match(new RegExp(`var\\(${name}(?!, 0px\\))`, 'g'))).toBeNull();
    }
  });

  it('never defines the documented properties, in the theme CSS or in the tokens', () => {
    for (const name of ['--cck-badge-container-radius', '--cck-badge-offset-x', '--cck-badge-offset-y']) {
      expect(stylesCss).not.toMatch(new RegExp(`${name}\\s*:`));
      expect(tokensCss).not.toContain(name);
    }
  });

  it('reads no other custom property for the position', () => {
    const corner =
      read('dist', 'components', 'badge-container.css').split('.cck-badge-container[data-position] > .cck-badge')[1] ??
      '';
    expect(properties(corner).sort()).toEqual([
      '--cck-badge-container-radius',
      '--cck-badge-offset-x',
      '--cck-badge-offset-y',
    ]);
  });

  it('uses no physical left, right, top or bottom in the badge rules', () => {
    expect(scss).not.toMatch(/(^|[\s{;])(left|right|top|bottom|margin-left|margin-right)\s*:/);
    expect(stylesCss.match(/\.cck-badge-container\[data-position=/g)).toHaveLength(CORNERS.length * 2);
  });

  it('is absolute in a positioned container and styles no :not([data-custom-offset]) variant', () => {
    expect(declarationsOf(stylesCss, '.cck-badge-container[data-position] > .cck-badge')).toContain(
      'position: absolute',
    );
    expect(stylesCss).not.toContain(':not([data-custom-offset])');
  });

  it.each(CORNERS)('places $position with logical insets and the offset added', ({ position, block, inline, ltr }) => {
    const rule = declarationsOf(stylesCss, `.cck-badge-container[data-position=${position}] > .cck-badge`) ?? '';
    expect(rule).toContain(`${block}: ${INSET}`);
    expect(rule).toContain(`${inline}: ${INSET}`);
    expect(rule).toContain(`translate: ${ltr}`);
  });

  it.each(CORNERS)(
    'mirrors $position with :dir(rtl) on the badge selector, the offset-x subtracted',
    ({ position, rtl }) => {
      const rule = declarationsOf(stylesCss, `.cck-badge-container[data-position=${position}] > .cck-badge:dir(rtl)`);
      expect(rule).toBeDefined();
      expect(rule).toContain(`translate: ${rtl}`);
    },
  );

  it('has a :dir(rtl) counterpart with the opposite horizontal sign for every horizontal translate', () => {
    const rules = [
      ...stylesCss.matchAll(/(\.cck-badge-container[^{]*?)\s*\{[^}]*translate:\s*calc\((-?)50% ([+-])/g),
    ].map((match) => ({ selector: match[1], negative: match[2] === '-', sign: match[3] }));
    const plain = rules.filter(({ selector }) => !selector.includes(':dir(rtl)'));
    expect(plain).toHaveLength(CORNERS.length);
    for (const { selector, negative, sign } of plain) {
      const mirror = rules.find((rule) => rule.selector === `${selector}:dir(rtl)`);
      expect(mirror, selector).toBeDefined();
      expect(mirror?.negative, selector).toBe(!negative);
      expect(mirror?.sign, selector).not.toBe(sign);
    }
  });
});
