import { describe, expect, it } from 'vitest';
import { declarationsOf, read, ref, sizeTokenOf, structureTokenOf } from './css-test-helpers';

const css = read('dist', 'components', 'tooltip.css');
const ROOT = '.cck-tooltip__content';
const own = (name: string): string | undefined => structureTokenOf(ROOT, `tooltip-${name}`);

describe('tooltip design match', () => {
  it.each([
    ['bg', 'contrast-color'],
    ['arrow-bg', 'contrast-color'],
    ['text-color', 'contrast-on-color'],
    ['radius', 'radius-sm'],
    ['shadow', 'shadow-none'],
    ['font-weight', 'font-weight-medium'],
    ['arrow-width', 'size-14'],
  ])('structure token %s is %s', (name, value) => {
    expect(own(name)).toBe(ref(value));
  });

  it.each([
    ['sm', 'spacing-4', 'spacing-3', 192, 'text-xs'],
    ['md', 'spacing-5', 'spacing-4', 320, 'text-sm'],
    ['lg', 'spacing-6', 'spacing-5', 384, 'text-md'],
  ])('size %s: padding %s and %s, %ipx wide at most, %s text (TT9)', (mode, inline, block, width, text) => {
    const size = (name: string): string | undefined => sizeTokenOf(ROOT, mode, `tooltip-${name}`);
    expect(size('padding-inline')).toBe(ref(inline));
    expect(size('padding-block')).toBe(ref(block));
    expect(size('max-inline-size')).toBe(`${String(width)}px`);
    for (const name of ['font-family', 'font-size', 'line-height', 'letter-spacing']) {
      expect(size(name)).toBe(ref(`${text}-${name}`));
    }
  });

  it('has a 14 by 7 arrow', () => {
    expect(own('arrow-height')).toBe('7px');
  });

  it('weights the text from the new variable and sizes the arrow from the tokens', () => {
    expect(declarationsOf(css, ROOT)).toContain('font-weight: var(--cck-tooltip-font-weight)');
    const arrow = declarationsOf(css, '.cck-tooltip__arrow svg') ?? '';
    expect(arrow).toContain('inline-size: var(--cck-tooltip-arrow-width)');
    expect(arrow).toContain('block-size: var(--cck-tooltip-arrow-height)');
  });
});
