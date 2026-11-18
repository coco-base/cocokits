import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, selectorsOf, structureTokenOf, tokensCss } from './css-test-helpers';

/** The rules without the tokens: the token blocks share class selectors with the rules. */
const allCss = read('dist', 'styles.css');
const stylesCss = allCss.slice(allCss.indexOf('\n@layer cocokits {'));
const COMPONENTS = ['avatar', 'avatar-group', 'avatar-label'] as const;
const scss = COMPONENTS.map((name) => read('src', 'styles', 'components', `_${name}.scss`)).join('\n');
const SIZES = ['xs', 'sm', 'md', 'lg'] as const;
/** The old edges of the four sizes. */
const EDGES = { xs: 28, sm: 32, md: 40, lg: 48 } as const;
/** The Core size token an edge resolves to. */
const coreSize = (px: number): string => `var(--cck-size-${String(px)})`;

/** The token block of a component in one size; the default size shares the block of the bare class. */
const tokenBlock = (name: string, size: (typeof SIZES)[number]): string => {
  const selector = size === 'md' ? `.cck-${name}, .cck-${name}[data-size=md] {` : `.cck-${name}[data-size=${size}] {`;
  const start = tokensCss.indexOf(selector);
  return start < 0 ? '' : tokensCss.slice(start, tokensCss.indexOf('}', start));
};

describe('avatar output', () => {
  it.each(COMPONENTS)('puts the rules of dist/components/%s.css inside @layer cocokits', (name) => {
    const css = read('dist', 'components', `${name}.css`);
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(css).toContain(`.cck-${name}`);
    expect(stylesCss).toContain(`.cck-${name}`);
  });

  it('emits the tokens on the component classes, md as the default, and never on :root', () => {
    for (const name of COMPONENTS) {
      for (const size of SIZES) expect(tokenBlock(name, size)).not.toBe('');
    }
    const blocks = tokensCss.split('  }').filter((block) => block.includes(':root'));
    expect(blocks.join('')).not.toContain('--cck-avatar');
  });

  it.each(SIZES)('gives the avatar, the group avatars and the label avatars the old edge in %s', (size) => {
    expect(tokenBlock('avatar', size)).toContain(`--cck-avatar-size: ${coreSize(EDGES[size])}`);
    expect(tokenBlock('avatar-group', size)).toContain(`--cck-avatar-group-avatar-size: ${coreSize(EDGES[size])}`);
    expect(tokenBlock('avatar-label', size)).toContain(`--cck-avatar-label-avatar-size: ${coreSize(EDGES[size])}`);
  });

  it('uses the design overlaps, avatar-to-text gaps and text gaps', () => {
    const spacing = (name: string): string => `var(--cck-${name})`;
    for (const [size, overlap, gap, textGap, inlineGap] of [
      ['xs', 8, 'spacing-3', 'spacing-1', 'spacing-2'],
      ['sm', 10, 'spacing-3', 'spacing-2', 'spacing-3'],
      ['md', 12, 'spacing-4', 'spacing-2', 'spacing-3'],
      ['lg', 14, 'spacing-5', 'spacing-3', 'spacing-3'],
    ] as const) {
      expect(tokenBlock('avatar-group', size)).toContain(`--cck-avatar-group-overlap: ${coreSize(overlap)}`);
      expect(tokenBlock('avatar-label', size)).toContain(`--cck-avatar-label-gap: ${spacing(gap)}`);
      expect(tokenBlock('avatar-label', size)).toContain(`--cck-avatar-label-text-gap: ${spacing(textGap)}`);
      expect(tokenBlock('avatar-label', size)).toContain(`--cck-avatar-label-text-inline-gap: ${spacing(inlineGap)}`);
    }
  });

  // The avatar text of xs reads text-sm; the label name takes text-xs, sm, md and lg (design: Avatar, AvatarLabel).
  it.each([
    ['xs', 'text-sm', 'text-xs'],
    ['sm', 'text-sm', 'text-sm'],
    ['md', 'text-md', 'text-md'],
    ['lg', 'text-lg', 'text-lg'],
  ] as const)('sets the fallback and name text of %s to %s and %s, medium', (size, avatarText, nameText) => {
    for (const part of ['font-family', 'font-size', 'line-height', 'letter-spacing']) {
      expect(tokenBlock('avatar', size)).toContain(`--cck-avatar-fallback-${part}: var(--cck-${avatarText}-${part})`);
      expect(tokenBlock('avatar-group', size)).toContain(
        `--cck-avatar-group-avatar-${part}: var(--cck-${avatarText}-${part})`,
      );
      expect(tokenBlock('avatar-label', size)).toContain(
        `--cck-avatar-label-avatar-${part}: var(--cck-${avatarText}-${part})`,
      );
      expect(tokenBlock('avatar-label', size)).toContain(`--cck-avatar-label-${part}: var(--cck-${nameText}-${part})`);
    }
    expect(tokenBlock('avatar', size)).toContain('--cck-avatar-fallback-font-weight: var(--cck-font-weight-medium)');
    expect(tokenBlock('avatar-label', size)).toContain('--cck-avatar-label-font-weight: var(--cck-font-weight-medium)');
  });

  it('colours the fallback with the Active Color of its option and the description with on-surface/3 in regular weight', () => {
    expect(structureTokenOf('.cck-avatar', 'avatar-fallback-bg')).toBe(ref('color'));
    expect(structureTokenOf('.cck-avatar', 'avatar-fallback-text-color')).toBe(ref('on-color'));
    expect(structureTokenOf('.cck-avatar-label', 'avatar-label-description-color')).toBe(ref('on-surface-3'));
    expect(structureTokenOf('.cck-avatar-label', 'avatar-label-description-font-weight')).toBe(
      ref('font-weight-regular'),
    );
  });
});

describe('avatar shape', () => {
  it('draws a round square that clips the image', () => {
    const rule = declarationsOf(stylesCss, '.cck-avatar') ?? '';
    for (const line of [
      'display: inline-flex',
      'align-items: center',
      'justify-content: center',
      'flex-shrink: 0',
      'inline-size: var(--cck-avatar-size)',
      'block-size: var(--cck-avatar-size)',
      'border-radius: var(--cck-avatar-radius)',
      'overflow: hidden',
      'vertical-align: middle',
    ]) {
      expect(rule).toContain(line);
    }
  });

  it('fills the root with a covering image and a centred, coloured fallback', () => {
    const image = declarationsOf(stylesCss, '.cck-avatar__image') ?? '';
    expect(image).toContain('display: block');
    expect(image).toContain('object-fit: cover');
    const fallback = declarationsOf(stylesCss, '.cck-avatar__fallback') ?? '';
    expect(fallback).toContain('display: flex');
    expect(fallback).toContain('border-radius: inherit');
    expect(fallback).toContain('background-color: var(--cck-avatar-fallback-bg)');
    expect(fallback).toContain('color: var(--cck-avatar-fallback-text-color)');
  });

  it.each([
    '.cck-avatar[hidden]',
    '.cck-avatar__image[hidden]',
    '.cck-avatar__fallback[hidden]',
    '.cck-avatar-group[hidden]',
    '.cck-avatar-label[hidden]',
    '.cck-avatar-label__text[hidden]',
  ])('restates the native hidden on %s, in the layer', (selector) => {
    expect(declarationsOf(stylesCss, selector)).toContain('display: none');
  });

  it('borders the fallback in forced colors only', () => {
    const forced = read('dist', 'components', 'avatar.css').split('@media (forced-colors: active)')[1] ?? '';
    expect(forced).toContain('.cck-avatar__fallback');
    expect(forced).toContain('border: 1px solid CanvasText');
    expect(declarationsOf(stylesCss, '.cck-avatar__fallback')).not.toContain('border: ');
  });
});

describe('avatar group', () => {
  it('overlaps the later avatar with a logical margin and rings every direct avatar', () => {
    expect(declarationsOf(stylesCss, '.cck-avatar-group > .cck-avatar + .cck-avatar')).toContain(
      'margin-inline-start: calc(-1 * var(--cck-avatar-group-overlap))',
    );
    const direct = declarationsOf(stylesCss, '.cck-avatar-group > .cck-avatar') ?? '';
    expect(direct).toContain('box-shadow: 0 0 0 var(--cck-avatar-group-ring-width) var(--cck-avatar-group-ring-color)');
  });

  it('leaves the size and the fallback text of its direct avatars to the avatar itself (AG5)', () => {
    const direct = declarationsOf(stylesCss, '.cck-avatar-group > .cck-avatar') ?? '';
    expect(direct).not.toMatch(/inline-size|block-size|font-/);
  });
});

describe('avatar label', () => {
  it('leaves the size of its direct avatar to the avatar itself (AL9)', () => {
    expect(stylesCss).not.toContain('.cck-avatar-label > .cck-avatar');
  });

  it.each([
    ['.cck-avatar-label', 'row'],
    ['.cck-avatar-label[data-avatar-position=right]', 'row-reverse'],
    ['.cck-avatar-label[data-avatar-position=top]', 'column'],
    ['.cck-avatar-label[data-avatar-position=bottom]', 'column-reverse'],
  ])('lays out %s as %s', (selector, direction) => {
    expect(declarationsOf(stylesCss, selector)).toContain(`flex-direction: ${direction}`);
  });

  it('aligns the text to the end for the right position', () => {
    expect(declarationsOf(stylesCss, '.cck-avatar-label[data-avatar-position=right]')).toContain('text-align: end');
  });

  it('stacks the text and puts it on one line for the horizontal label alignment', () => {
    expect(declarationsOf(stylesCss, '.cck-avatar-label__text')).toContain('flex-direction: column');
    const inline = declarationsOf(
      stylesCss,
      '.cck-avatar-label[data-label-alignment=horizontal] > .cck-avatar-label__text',
    );
    expect(inline).toContain('flex-direction: row');
    expect(inline).toContain('gap: var(--cck-avatar-label-text-inline-gap)');
    expect(declarationsOf(stylesCss, '.cck-avatar-label__text')).toContain('gap: var(--cck-avatar-label-text-gap)');
  });

  it('colours the name and the description', () => {
    expect(declarationsOf(stylesCss, '.cck-avatar-label__name')).toContain('color: var(--cck-avatar-label-name-color)');
    expect(declarationsOf(stylesCss, '.cck-avatar-label__description')).toContain(
      'color: var(--cck-avatar-label-description-color)',
    );
    expect(declarationsOf(stylesCss, '.cck-avatar-label__description')).toContain(
      'font-weight: var(--cck-avatar-label-description-font-weight)',
    );
  });
});

describe('avatar selectors', () => {
  it('uses no :nth-child, no tag selector and no physical property', () => {
    const own = selectorsOf(stylesCss).filter((selector) => selector.includes('.cck-avatar'));
    expect(own.length).toBeGreaterThan(0);
    for (const selector of own) {
      expect(selector).not.toMatch(/nth-|:first-|:last-/);
      expect(selector).not.toMatch(/(^|[\s>+~])(?:img|span|div|cck-)/);
    }
    expect(scss).not.toMatch(/margin-(left|right)|padding-(left|right)|(^|\s)(left|right):/);
  });
});
