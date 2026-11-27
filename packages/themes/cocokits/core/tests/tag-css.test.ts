import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, selectorsOf, sizeTokenOf, structureTokenOf, tokensCss } from './css-test-helpers';

const stylesCss = read('dist', 'styles.css');
const entryCss = read('dist', 'components', 'tag.css');
const scss = read('src', 'styles', 'components', '_tag.scss');
const rule = (selector: string): string => declarationsOf(entryCss, selector) ?? '';
const own = (name: string): string | undefined => structureTokenOf('.cck-tag', `tag-${name}`);

describe('tag output', () => {
  it.each(['styles.css', 'components/tag.css'])('puts the rules of dist/%s inside @layer cocokits', (name) => {
    const css = read('dist', name);
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(css).toContain('.cck-tag');
  });

  it('names only the root class, its own attributes and a direct SvgIcon child', () => {
    const selectors = selectorsOf(entryCss).flatMap((list) => list.split(/,\s*/));
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      expect(selector).toMatch(
        /^\.cck-tag(\[data-variant=(soft|solid|outline)\]|\[data-dot\]::before|\[hidden\]| > \.cck-svg-icon:not\(\[data-size\]\))?$/,
      );
    }
  });

  it('emits the tag tokens on the component class and never on :root', () => {
    expect(tokensCss).toContain('.cck-tag[data-size=sm] {');
    expect(tokensCss).toContain('.cck-tag, .cck-tag[data-size=md] {');
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-tag');
  });

  it('restates the native hidden with display none', () => {
    expect(rule('.cck-tag[hidden]')).toContain('display: none');
  });
});

describe('tag sizes', () => {
  // Height, padding, gap, text, icon and dot per size.
  it.each([
    ['sm', 'size-20', 'spacing-3', 'spacing-2', 'text-xs', 'size-12', 'size-6'],
    ['md', 'size-24', 'spacing-4', 'spacing-2', 'text-xs', 'size-14', 'size-6'],
    ['lg', 'size-28', 'spacing-4', 'spacing-3', 'text-sm', 'size-16', 'size-8'],
  ])(
    'size %s: height %s, padding %s, gap %s, text %s, icon %s, dot %s',
    (mode, height, padding, gap, text, icon, dot) => {
      const at = (name: string): string | undefined => sizeTokenOf('.cck-tag', mode, `tag-${name}`);
      expect(at('height')).toBe(ref(height));
      expect(at('padding-inline')).toBe(ref(padding));
      expect(at('gap')).toBe(ref(gap));
      expect(at('icon-size')).toBe(ref(icon));
      expect(at('dot-size')).toBe(ref(dot));
      for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing']) {
        expect(at(part), part).toBe(ref(`${text}-${part}`));
      }
    },
  );

  it('reads the size tokens on the root', () => {
    const root = rule('.cck-tag');
    for (const line of [
      'block-size: var(--cck-tag-height)',
      'padding-inline: var(--cck-tag-padding-inline)',
      'gap: var(--cck-tag-gap)',
      'font-size: var(--cck-tag-font-size)',
      'font-weight: var(--cck-tag-font-weight)',
    ]) {
      expect(root).toContain(line);
    }
  });
});

describe('tag variants and colour', () => {
  it('takes the corner from radius-md and the weight from medium', () => {
    expect(own('radius')).toBe(ref('radius-md'));
    expect(own('font-weight')).toBe(ref('font-weight-medium'));
    expect(own('border-width')).toBe(ref('border-width-1'));
    expect(rule('.cck-tag')).toContain('border-radius: var(--cck-tag-radius)');
  });

  it.each([
    ['soft', 'container', 'on-container'],
    ['solid', 'color', 'on-color'],
  ])('fills %s with the Active Color pair %s and %s', (variant, bg, text) => {
    expect(own(`${variant}-bg`)).toBe(ref(bg));
    expect(own(`${variant}-text-color`)).toBe(ref(text));
    const declarations = rule(`.cck-tag[data-variant=${variant}]`);
    expect(declarations).toContain(`background-color: var(--cck-tag-${variant}-bg)`);
    expect(declarations).toContain(`color: var(--cck-tag-${variant}-text-color)`);
  });

  it('draws outline as a border in the edge colour with no fill', () => {
    expect(own('outline-border-color')).toBe(ref('edge'));
    expect(own('outline-text-color')).toBe(ref('on-container'));
    const declarations = rule('.cck-tag[data-variant=outline]');
    expect(declarations).toContain('border-color: var(--cck-tag-outline-border-color)');
    expect(declarations).toContain('color: var(--cck-tag-outline-text-color)');
    expect(declarations).not.toContain('background');
  });

  it('reads every colour from the Active Color family, so all seven colours need no rule of their own', () => {
    expect(entryCss).not.toContain('data-cck-color');
    expect(tokensCss).toContain('[data-cck-color=success]');
  });

  it('has no hover, focus, pressed or disabled look and no pointer cursor', () => {
    expect(entryCss).not.toMatch(/:hover|:focus|:active|disabled|cursor/);
  });
});

describe('tag dot and icon', () => {
  it('draws the dot as a ::before in the text colour, sized by the dot token', () => {
    const dot = rule('.cck-tag[data-dot]::before');
    expect(dot).toContain('content: ""');
    expect(dot).toContain('box-sizing: border-box');
    expect(dot).toContain('inline-size: var(--cck-tag-dot-size)');
    expect(dot).toContain('block-size: var(--cck-tag-dot-size)');
    expect(dot).toContain('border-radius: 50%');
    expect(dot).toContain('background-color: currentColor');
  });

  it('sizes a direct SvgIcon child without its own size', () => {
    expect(rule('.cck-tag > .cck-svg-icon:not([data-size])')).toContain('font-size: var(--cck-tag-icon-size)');
  });

  it('keeps the border and the dot in forced colors only', () => {
    const forced = entryCss.split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('border-color: CanvasText');
    expect(forced).toMatch(/\.cck-tag\[data-dot\]::before \{\s*background-color: CanvasText/);
    expect(stylesCss).toContain('.cck-tag[data-dot]::before');
  });

  it('uses only logical sizes and spacing, so a right-to-left page needs no rule of its own', () => {
    expect(scss).not.toMatch(/(^|[\s{;])(left|right|top|bottom|width|height|margin-left|margin-right)\s*:/);
    expect(scss).not.toMatch(/padding-(left|right)|:dir\(rtl\)/);
  });
});
